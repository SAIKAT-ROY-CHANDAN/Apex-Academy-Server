import prisma from '../../../db/db.config';
import { Prisma } from '../../../../generated/prisma/client';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  ICreateHostelExpense,
  IUpdateHostelExpense,
} from './hostel-expense.type';

const expenseInclude = {
  hostelExpenseItems: true,
};

const createHostelExpenseIntoDB = async (payload: ICreateHostelExpense) => {
  const result = await prisma.hostelExpense.create({
    data: {
      expense_date: new Date(payload.expense_date),
      total_amount: payload.total_amount,
      hostelExpenseItems: {
        create: payload.hostelExpenseItems,
      },
    },
    include: expenseInclude,
  });

  return result;
};

const getAllHostelExpensesFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, hostelExpenses] = await prisma.$transaction([
    prisma.hostelExpense.count({ where }),
    prisma.hostelExpense.findMany({
      skip,
      take,
      orderBy,
      where,
      include: expenseInclude,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: hostelExpenses,
  };
};

const getHostelExpenseByIdFromDB = async (expenseId: string) => {
  const existing = await prisma.hostelExpense.findUnique({
    where: { id: expenseId },
    include: expenseInclude,
  });

  if (!existing) {
    throw new Error('Hostel expense not found');
  }

  return existing;
};

const updateHostelExpenseFromDB = async (
  expenseId: string,
  payload: IUpdateHostelExpense,
) => {
  const existing = await prisma.hostelExpense.findUnique({
    where: { id: expenseId },
  });

  if (!existing) {
    throw new Error('Hostel expense not found');
  }

  const result = await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = {};

    if (payload.expense_date !== undefined)
      updateData.expense_date = new Date(payload.expense_date);
    if (payload.total_amount !== undefined)
      updateData.total_amount = payload.total_amount;

    if (payload.hostelExpenseItems) {
      await tx.hostelExpenseItem.deleteMany({
        where: { hostel_expense_id: expenseId },
      });
      updateData.hostelExpenseItems = {
        create: payload.hostelExpenseItems,
      };
    }

    const updated = await tx.hostelExpense.update({
      where: { id: expenseId },
      data: updateData,
      include: expenseInclude,
    });

    return updated;
  });

  return result;
};

const deleteHostelExpenseFromDB = async (expenseId: string) => {
  const existing = await prisma.hostelExpense.findUnique({
    where: { id: expenseId },
  });

  if (!existing) {
    throw new Error('Hostel expense not found');
  }

  await prisma.hostelExpense.delete({
    where: { id: expenseId },
  });
};

const getHostelStudentsDueReportFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query);

  const searchConditions: Prisma.StudentWhereInput[] = [];

  if (query.searchTerm) {
    const term = query.searchTerm;
    searchConditions.push({
      OR: [
        { name: { contains: term } },
        { father_name: { contains: term } },
        { mother_name: { contains: term } },
        { email: { contains: term } },
        { student_phone: { contains: term } },
        {
          studentEnrollments: {
            some: { registration_number: { contains: term } },
          },
        },
      ],
    });
  }

  const dueFilter: Prisma.StudentWhereInput = {
    hostelFeeCollections: { some: { due_amount: { gt: 0 } } },
  };

  const combinedWhere: Prisma.StudentWhereInput = {
    AND: [where, ...searchConditions, dueFilter],
  };

  const [totalItems, students] = await prisma.$transaction([
    prisma.student.count({ where: combinedWhere }),
    prisma.student.findMany({
      skip,
      take,
      orderBy,
      where: combinedWhere,
      include: {
        hostelFeeCollections: {
          where: { due_amount: { gt: 0 } },
          select: {
            id: true,
            collection_date: true,
            total_amount: true,
            paid_amount: true,
            due_amount: true,
          },
        },
        hostelAllocations: {
          orderBy: { created_at: 'desc' },
          take: 1,
          where: { status: 'ACTIVE' },
          include: {
            hostelRoom: {
              include: {
                hostelFloor: {
                  include: {
                    hostelConfiguration: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const data = students.map((student) => ({
    id: student.id,
    name: student.name,
    father_name: student.father_name,
    mother_name: student.mother_name,
    email: student.email,
    student_phone: student.student_phone,
    gender: student.gender,
    is_residential: student.is_residential,
    due_collections: student.hostelFeeCollections,
    current_hostel_allocation: student.hostelAllocations[0] ?? null,
  }));

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data,
  };
};

export const HostelExpenseService = {
  createHostelExpenseIntoDB,
  getAllHostelExpensesFromDB,
  getHostelExpenseByIdFromDB,
  updateHostelExpenseFromDB,
  deleteHostelExpenseFromDB,
  getHostelStudentsDueReportFromDB,
};
