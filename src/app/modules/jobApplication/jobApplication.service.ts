import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  createBkashPayment,
  executeBkashPayment,
} from '../hostel-fee-collection/bkash.service';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IJobApplicationCreate,
  IJobApplicationInitiateResponse,
} from './jobApplication.type';

const initiateJobApplicationPaymentIntoDB = async (
  payload: IJobApplicationCreate,
  callbackURL: string,
): Promise<IJobApplicationInitiateResponse> => {
  const circular = await prisma.websiteJobCircular.findUnique({
    where: { id: payload.circularId },
  });

  if (!circular) {
    throw new AppError(404, 'Job circular not found');
  }

  const applyFee = Number(circular.applyFee) || 0;
  if (applyFee <= 0) {
    throw new AppError(400, 'This circular has no apply fee configured');
  }

  const application = await prisma.jobApplication.create({
    data: {
      circular_id: payload.circularId,
      full_name: payload.fullName,
      gender: payload.gender,
      nid: payload.nid,
      dob: payload.dob,
      phone: payload.phone,
      email: payload.email,
      blood_group: payload.bloodGroup,
      village: payload.village,
      post_office: payload.postOffice,
      sub_district: payload.subDistrict,
      district: payload.district,
      degree: payload.degree,
      major_subject: payload.majorSubject,
      institution: payload.institution,
      cgpa: payload.cgpa,
      graduation_year: payload.graduationYear,
      image_url: payload.imageUrl,
      certificate_url: payload.certificateUrl,
      cv_url: payload.cvUrl,
      apply_fee: String(applyFee),
      payment_status: 'PENDING',
    },
  });

  const merchantInvoiceNumber = `BKJOB-${Date.now()}`;

  const { paymentID, bkashURL } = await createBkashPayment({
    amount: applyFee,
    merchantInvoiceNumber,
    callbackURL,
    payerReference: application.id,
  });

  await prisma.jobApplication.update({
    where: { id: application.id },
    data: { bkash_payment_id: paymentID },
  });

  // Track session to ensure cross-service idempotency
  await prisma.bkashPaymentSession.create({
    data: {
      payment_id: paymentID,
      payment_type: 'JOB',
      target_id: application.id,
      amount: applyFee,
      status: 'INITIATED',
    },
  });

  return { bkashURL, paymentID, applicationId: application.id };
};

const executeJobApplicationPaymentIntoDB = async (paymentID: string) => {
  const application = await prisma.jobApplication.findFirst({
    where: { bkash_payment_id: paymentID },
    include: {
      circular: { select: { positionName: true, positionType: true } },
    },
  });

  if (!application) {
    throw new AppError(404, 'Job application not found for this payment');
  }

  // Idempotency guard: If already marked PAID, return existing record immediately.
  // Avoids calling bKash /execute a second time, which would crash on page reloads.
  if (application.payment_status === 'PAID') {
    return {
      application,
      transactionId: application.transaction_id,
      amount: Number(application.apply_fee),
      alreadyPaid: true,
    };
  }

  // Payment is PENDING — execute with bKash
  const executeResult = await executeBkashPayment(paymentID);

  const updated = await prisma.jobApplication.update({
    where: { id: application.id },
    data: {
      payment_status: 'PAID',
      transaction_id: executeResult.transactionId,
    },
    include: {
      circular: { select: { positionName: true, positionType: true } },
    },
  });

  // Update session
  await prisma.bkashPaymentSession.updateMany({
    where: { payment_id: paymentID },
    data: {
      status: 'COMPLETED',
      trx_id: executeResult.transactionId,
    },
  });

  return {
    application: updated,
    transactionId: executeResult.transactionId,
    amount: executeResult.amount,
    alreadyPaid: false,
  };
};

const getAllJobApplicationsFromDB = async (
  query: QueryParams & { circular_id?: string; payment_status?: string },
) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['full_name', 'phone', 'email', 'nid', 'gender'],
  });

  if (query.circular_id) {
    where.circular_id = query.circular_id;
  }

  if (query.payment_status) {
    where.payment_status = query.payment_status;
  }

  const [totalItems, applications] = await prisma.$transaction([
    prisma.jobApplication.count({ where }),
    prisma.jobApplication.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        circular: {
          select: { positionName: true, positionType: true },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: applications,
  };
};

const getJobApplicationByIdFromDB = async (id: string) => {
  return prisma.jobApplication.findUniqueOrThrow({
    where: { id },
    include: { circular: true },
  });
};

const deleteJobApplicationFromDB = async (id: string) => {
  const existing = await prisma.jobApplication.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Job application not found');
  }

  await prisma.jobApplication.delete({ where: { id } });
};

export const JobApplicationService = {
  initiateJobApplicationPaymentIntoDB,
  executeJobApplicationPaymentIntoDB,
  getAllJobApplicationsFromDB,
  getJobApplicationByIdFromDB,
  deleteJobApplicationFromDB,
};
