import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IStudentFeeCreate, IStudentFeeUpdate } from './studentFee.type';

const createStudentFeeIntoDB = async (payload: IStudentFeeCreate) => {
  const existingStudentFee = await prisma.studentFee.findUnique({
    where: {
      student_enrollment_id: payload.student_enrollment_id,
    },
  });

  if (existingStudentFee) {
    throw new Error('A fee record already exists for this student enrollment');
  }

  const newStudentFee = await prisma.studentFee.create({
    data: payload,
  });

  return newStudentFee;
};

const getAllStudentFeesFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, studentFees] = await prisma.$transaction([
    prisma.studentFee.count({ where }),
    prisma.studentFee.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        studentEnrollment: true,
        feeItem: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: studentFees,
  };
};

const getStudentFeeByIdFromDB = async (studentFeeId: string) => {
  const existingStudentFee = await prisma.studentFee.findUnique({
    where: {
      id: studentFeeId,
    },
    include: {
      studentEnrollment: true,
      feeItem: true,
    },
  });

  if (!existingStudentFee) {
    throw new Error('Student fee not found');
  }

  return existingStudentFee;
};

const updateStudentFeeFromDB = async (
  studentFeeId: string,
  payload: IStudentFeeUpdate,
) => {
  const existingStudentFee = await prisma.studentFee.findUnique({
    where: {
      id: studentFeeId,
    },
  });

  if (!existingStudentFee) {
    throw new Error('Student fee not found');
  }

  const updatedStudentFee = await prisma.studentFee.update({
    where: {
      id: studentFeeId,
    },
    data: payload,
  });

  return updatedStudentFee;
};

const deleteStudentFeeFromDB = async (studentFeeId: string) => {
  const existingStudentFee = await prisma.studentFee.findUnique({
    where: {
      id: studentFeeId,
    },
  });

  if (!existingStudentFee) {
    throw new Error('Student fee not found');
  }

  await prisma.studentFee.delete({
    where: {
      id: studentFeeId,
    },
  });
};

const getStudentFeeDueWithDetailsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['student_enrollment_id'],
  });

  const feeWhere = {
    ...where,
    due_amount: {
      gt: 0,
    },
  };

  const [totalItems, studentFees] = await prisma.$transaction([
    prisma.studentFee.count({ where: feeWhere }),
    prisma.studentFee.findMany({
      skip,
      take,
      orderBy,
      where: feeWhere,
      include: {
        studentEnrollment: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                father_name: true,
                mother_name: true,
                gender: true,
              },
            },
            academicClass: {
              select: {
                class_name: true,
                group: true,
                department: {
                  select: {
                    department_name: true,
                  },
                },
              },
            },
            academicSession: {
              select: {
                session_name: true,
              },
            },
            academicSection: {
              select: {
                section_name: true,
              },
            },
            batch: {
              select: {
                batch_name: true,
              },
            },
          },
        },
        feeItem: {
          select: {
            name: true,
            amount: true,
          },
        },
      },
    }),
  ]);

  const data = studentFees.map((fee) => {
    const enrollment = fee.studentEnrollment;
    const student = enrollment?.student;
    const academicClass = enrollment?.academicClass;
    const academicSession = enrollment?.academicSession;
    const academicSection = enrollment?.academicSection;
    const batch = enrollment?.batch;
    const feeItem = fee.feeItem;

    return {
      id: fee.id,
      student_enrollment_id: fee.student_enrollment_id,
      student_name: student?.name || null,
      father_name: student?.father_name || null,
      mother_name: student?.mother_name || null,
      gender: student?.gender || null,
      class_name: academicClass?.class_name || null,
      section_name: academicSection?.section_name || null,
      batch_name: batch?.batch_name || null,
      academic_session: academicSession?.session_name || null,
      due_amount: fee.due_amount,
      scholarship_amount: fee.scholarship_amount,
      paid_amount: fee.paid_amount,
      fee_item_name: feeItem?.name || null,
      status: fee.due_amount > 0 ? 'Due' : 'Paid',
    };
  });

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data,
  };
};

export const StudentFeeService = {
  createStudentFeeIntoDB,
  getAllStudentFeesFromDB,
  getStudentFeeByIdFromDB,
  updateStudentFeeFromDB,
  deleteStudentFeeFromDB,
  getStudentFeeDueWithDetailsFromDB,
};
