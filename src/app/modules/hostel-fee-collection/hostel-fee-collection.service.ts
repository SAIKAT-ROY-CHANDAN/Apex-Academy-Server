import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { HostelInvoiceStatus } from '../../../../generated/prisma/enums';
import type { Prisma } from '../../../../generated/prisma/client';
import {
  ICreateHostelFeeCollection,
  IPayHostelDue,
  IUpdateHostelFeeCollection,
  IBkashInitiateResponse,
} from './hostel-fee-collection.type';

import { createBkashPayment, executeBkashPayment, queryBkashPayment } from './bkash.service';
import configs from '../../configs';

const collectionInclude = {
  student: {
    include: {
      studentEnrollments: {
        where: { is_primary: true },
        orderBy: { created_at: 'desc' as const },
        take: 1, // primary enrollment (promotion-safe)
        select: {
          academicClass: {
            select: {
              class_name: true,
              group: true,
              department: {
                select: { department_name: true },
              },
            },
          },
          batch: { select: { batch_name: true } },
          academicSection: { select: { section_name: true } },
          academicSession: { select: { session_name: true } },
        },
      },
    },
  },
  hostelFeeCollectionItems: true,
  mealCollection: true,
  hostelInvoice: true,
};

// Invoice numbers are per issue month: HINV-YYYYMM-00001
const generateInvoiceNumber = async (
  tx: Prisma.TransactionClient,
  issueDate: Date,
): Promise<string> => {
  const prefix = `HINV-${issueDate.getUTCFullYear()}${String(
    issueDate.getUTCMonth() + 1,
  ).padStart(2, '0')}`;

  const existingCount = await tx.hostelInvoice.count({
    where: { invoice_no: { startsWith: prefix } },
  });

  return `${prefix}-${String(existingCount + 1).padStart(5, '0')}`;
};

const createHostelFeeCollectionIntoDB = async (
  payload: ICreateHostelFeeCollection,
) => {
  const existingStudent = await prisma.student.findUnique({
    where: { id: payload.student_id },
  });

  if (!existingStudent) {
    throw new Error('Student not found');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Settlement: any outstanding due from previous collections is carried
    // into this new collection, so older rows must be zeroed to keep
    // SUM(due_amount) equal to the student's true outstanding balance.
    // The historical due stays preserved on each row's hostelInvoice snapshot.
    await tx.hostelFeeCollection.updateMany({
      where: { student_id: payload.student_id, due_amount: { gt: 0 } },
      data: { due_amount: 0 },
    });

    const collection = await tx.hostelFeeCollection.create({
      data: {
        student_id: payload.student_id,
        collection_date: new Date(payload.collection_date),
        total_amount: payload.total_amount,
        scholarship_amount: payload.scholarship_amount ?? 0,
        paid_amount: payload.paid_amount,
        due_amount: payload.due_amount,
        hostelFeeCollectionItems: {
          create: payload.hostelFeeCollectionItems,
        },
        mealCollection: payload.mealCollection
          ? {
              create: payload.mealCollection,
            }
          : undefined,
      },
      include: collectionInclude,
    });

    // Immutable invoice snapshot — records when this invoice was generated
    // and what was due at that moment, even after later settlements zero it out here.
    // Payment due date is decided internally: issue date + 15 day grace period.
    const issueDate = collection.collection_date;
    const dueDate = new Date(issueDate);
    dueDate.setUTCDate(dueDate.getUTCDate() + 15);
    const status =
      payload.due_amount <= 0
        ? HostelInvoiceStatus.PAID
        : payload.paid_amount > 0
          ? HostelInvoiceStatus.PARTIAL
          : HostelInvoiceStatus.UNPAID;

    const invoice = await tx.hostelInvoice.create({
      data: {
        invoice_no: await generateInvoiceNumber(tx, issueDate),
        student_id: payload.student_id,
        hostel_fee_collection_id: collection.id,
        issue_date: issueDate,
        due_date: dueDate,
        total_amount: collection.total_amount,
        scholarship_amount: collection.scholarship_amount,
        paid_amount: collection.paid_amount,
        due_amount: payload.due_amount,
        status,
      },
    });

    return { ...collection, hostelInvoice: invoice };
  });

  return result;
};

// Settle an outstanding due (fully or partially) from the students-due report.
// Follows the same settlement pattern as create: old rows' dues are zeroed and
// one new transaction row carries the remaining balance, keeping SUM(due_amount)
// equal to the student's true outstanding balance. An invoice snapshot is
// generated for the payment so it shows up on the deposited page history.
const payHostelDueFromDB = async (payload: IPayHostelDue) => {
  const existingStudent = await prisma.student.findUnique({
    where: { id: payload.student_id },
    select: { id: true },
  });

  if (!existingStudent) {
    throw new Error('Student not found');
  }

  const aggregate = await prisma.hostelFeeCollection.aggregate({
    _sum: { due_amount: true },
    where: { student_id: payload.student_id },
  });

  const outstandingDue = aggregate._sum.due_amount ?? 0;

  if (outstandingDue <= 0) {
    throw new Error('This student has no outstanding due');
  }

  // Gracefully handle if paid amount exceeds outstanding due without crashing
  const effectivePaidAmount = Math.min(payload.paid_amount, outstandingDue);

  const result = await prisma.$transaction(async (tx) => {
    await tx.hostelFeeCollection.updateMany({
      where: { student_id: payload.student_id, due_amount: { gt: 0 } },
      data: { due_amount: 0 },
    });

    const collectionDate = new Date();
    const dueAmount = Math.max(0, Math.round((outstandingDue - effectivePaidAmount) * 100) / 100);

    const collection = await tx.hostelFeeCollection.create({
      data: {
        student_id: payload.student_id,
        collection_date: collectionDate,
        total_amount: outstandingDue,
        scholarship_amount: 0,
        paid_amount: payload.paid_amount,
        due_amount: dueAmount,
        payment_method: payload.payment_method,
        transaction_id: payload.transaction_id,
        bkash_sender_number: payload.bkash_sender_number,
        bkash_receiver_number: payload.bkash_receiver_number,
        payment_note: payload.payment_note,
        hostelFeeCollectionItems: {
          create: [
            {
              item_name: 'Previous Due Settlement',
              item_amount: outstandingDue,
            },
          ],
        },
      },
      include: collectionInclude,
    });

    // Invoice snapshot for this settlement transaction.
    const dueDate = new Date(collectionDate);
    dueDate.setUTCDate(dueDate.getUTCDate() + 15);

    const invoice = await tx.hostelInvoice.create({
      data: {
        invoice_no: await generateInvoiceNumber(tx, collectionDate),
        student_id: payload.student_id,
        hostel_fee_collection_id: collection.id,
        issue_date: collectionDate,
        due_date: dueDate,
        total_amount: outstandingDue,
        scholarship_amount: 0,
        paid_amount: payload.paid_amount,
        due_amount: dueAmount,
        status:
          dueAmount <= 0 ? HostelInvoiceStatus.PAID : HostelInvoiceStatus.PARTIAL,
      },
    });

    return { ...collection, hostelInvoice: invoice };
  });

  return result;
};

const initiateBkashPaymentFromDB = async (
  studentId: string,
): Promise<IBkashInitiateResponse> => {
  const existingStudent = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });

  if (!existingStudent) {
    throw new Error('Student not found');
  }

  const aggregate = await prisma.hostelFeeCollection.aggregate({
    _sum: { due_amount: true },
    where: { student_id: studentId },
  });

  const totalDue = aggregate._sum.due_amount ?? 0;

  if (totalDue <= 0) {
    throw new Error('No outstanding hostel due');
  }

  const merchantInvoiceNumber = `BKHST-${Date.now()}`;

  // Explicitly tag callback URL as hostel to eliminate ambiguity
  const baseCallback = configs.bkash.callbackUrl as string;
  const separator = baseCallback.includes('?') ? '&' : '?';
  const callbackURL = `${baseCallback}${separator}type=hostel`;

  const { paymentID, bkashURL } = await createBkashPayment({
    amount: totalDue,
    merchantInvoiceNumber,
    callbackURL,
    payerReference: studentId,
  });

  // Track session for ownership check and idempotency
  await prisma.bkashPaymentSession.create({
    data: {
      payment_id: paymentID,
      student_id: studentId,
      payment_type: 'HOSTEL',
      amount: totalDue,
      status: 'INITIATED',
    },
  });

  return { bkashURL, paymentID, totalDue };
};

const executeBkashPaymentFromDB = async (
  paymentID: string,
  studentId: string,
) => {
  const session = await prisma.bkashPaymentSession.findUnique({
    where: { payment_id: paymentID },
  });

  // Security Ownership Check: Prevent IDOR / hijacking
  if (session && session.student_id && session.student_id !== studentId) {
    throw new Error('Unauthorized: This payment does not belong to your account');
  }

  // Idempotency: If already completed, return existing collection without calling bKash again
  if (session?.status === 'COMPLETED' && session.trx_id) {
    const existing = await prisma.hostelFeeCollection.findFirst({
      where: { transaction_id: session.trx_id },
      include: collectionInclude,
    });
    if (existing) {
      return existing;
    }
  }

  const executeResult = await executeBkashPayment(paymentID);

  const result = await payHostelDueFromDB({
    student_id: studentId,
    paid_amount: executeResult.amount,
    payment_method: 'BKASH',
    transaction_id: executeResult.transactionId,
    bkash_sender_number: executeResult.senderNumber,
    bkash_receiver_number: executeResult.receiverNumber,
  });

  if (session) {
    await prisma.bkashPaymentSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        trx_id: executeResult.transactionId,
      },
    });
  } else {
    await prisma.bkashPaymentSession.create({
      data: {
        payment_id: paymentID,
        student_id: studentId,
        payment_type: 'HOSTEL',
        amount: executeResult.amount,
        status: 'COMPLETED',
        trx_id: executeResult.transactionId,
      },
    });
  }

  return result;
};

const getAllHostelFeeCollectionsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, hostelFeeCollections] = await prisma.$transaction([
    prisma.hostelFeeCollection.count({ where }),
    prisma.hostelFeeCollection.findMany({
      skip,
      take,
      orderBy,
      where,
      include: collectionInclude,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: hostelFeeCollections,
  };
};

const getHostelFeeCollectionByIdFromDB = async (
  collectionId: string,
) => {
  const existing = await prisma.hostelFeeCollection.findUnique({
    where: { id: collectionId },
    include: collectionInclude,
  });

  if (!existing) {
    throw new Error('Hostel fee collection not found');
  }

  return existing;
};

const updateHostelFeeCollectionFromDB = async (
  collectionId: string,
  payload: IUpdateHostelFeeCollection,
) => {
  const existing = await prisma.hostelFeeCollection.findUnique({
    where: { id: collectionId },
  });

  if (!existing) {
    throw new Error('Hostel fee collection not found');
  }

  if (payload.student_id) {
    const existingStudent = await prisma.student.findUnique({
      where: { id: payload.student_id },
    });
    if (!existingStudent) {
      throw new Error('Student not found');
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = {};

    if (payload.student_id !== undefined) updateData.student_id = payload.student_id;
    if (payload.collection_date !== undefined)
      updateData.collection_date = new Date(payload.collection_date);
    if (payload.total_amount !== undefined) updateData.total_amount = payload.total_amount;
    if (payload.scholarship_amount !== undefined)
      updateData.scholarship_amount = payload.scholarship_amount;
    if (payload.paid_amount !== undefined) updateData.paid_amount = payload.paid_amount;
    if (payload.due_amount !== undefined) updateData.due_amount = payload.due_amount;

    if (payload.hostelFeeCollectionItems) {
      await tx.hostelFeeCollectionItem.deleteMany({
        where: { hostel_fee_collection_id: collectionId },
      });
      updateData.hostelFeeCollectionItems = {
        create: payload.hostelFeeCollectionItems,
      };
    }

    if (payload.mealCollection) {
      await tx.mealCollection.deleteMany({
        where: { hostel_fee_collection_id: collectionId },
      });
      updateData.mealCollection = {
        create: payload.mealCollection,
      };
    }

    const updated = await tx.hostelFeeCollection.update({
      where: { id: collectionId },
      data: updateData,
      include: collectionInclude,
    });

    return updated;
  });

  return result;
};

const getStudentHostelDueFromDB = async (studentId: string) => {
  const existingStudent = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });

  if (!existingStudent) {
    throw new Error('Student not found');
  }

  const aggregate = await prisma.hostelFeeCollection.aggregate({
    _sum: { due_amount: true },
    where: { student_id: studentId },
  });

  return { totalDue: aggregate._sum.due_amount ?? 0 };
};

const deleteHostelFeeCollectionFromDB = async (collectionId: string) => {
  const existing = await prisma.hostelFeeCollection.findUnique({
    where: { id: collectionId },
  });

  if (!existing) {
    throw new Error('Hostel fee collection not found');
  }

  await prisma.hostelFeeCollection.delete({
    where: { id: collectionId },
  });
};


const queryBkashPaymentStatusFromDB = async (paymentID: string) => {
  return await queryBkashPayment(paymentID);
};

export const HostelFeeCollectionService = {
  queryBkashPaymentStatusFromDB,
  createHostelFeeCollectionIntoDB,
  payHostelDueFromDB,
  initiateBkashPaymentFromDB,
  executeBkashPaymentFromDB,
  getAllHostelFeeCollectionsFromDB,
  getHostelFeeCollectionByIdFromDB,
  getStudentHostelDueFromDB,
  updateHostelFeeCollectionFromDB,
  deleteHostelFeeCollectionFromDB,
};
