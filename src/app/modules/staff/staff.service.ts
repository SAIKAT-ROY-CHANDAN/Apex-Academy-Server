import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { deleteFile, deleteImage } from '../../utils/deleteFile';
import { CreateStaffInput, UpdateStaffInput } from './staff.type';
import bcrypt from 'bcryptjs';

const createStaffIntoDB = async (payload: CreateStaffInput) => {
  const { customSalaries, ...rest } = payload;
  const response = await prisma.staff.create({
    data: {
      ...rest,
      ...(customSalaries && {
        salary: {
          create: {
            total_amount: customSalaries.reduce(
              (acc, salary) => acc + Number(salary.salary_amount),
              0,
            ),
            customSalaries: {
              createMany: {
                data: customSalaries.map((salary) => ({
                  salary_component: salary.salary_component,
                  salary_amount: Number(salary.salary_amount),
                })),
              },
            },
          },
        },
      }),
    } as any,
  });

  return response;
};

const getAllStaffFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['full_name', 'email', 'phone'],
  });

  const [totalItems, staffs] = await prisma.$transaction([
    prisma.staff.count({ where }),
    prisma.staff.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        designation: true,
        salary: {
          include: {
            customSalaries: true
          }
        },
        overtimeStaffConfigs: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: staffs,
  };
};

const getStaffByIdFromDB = async (id: string) => {
  const response = await prisma.staff.findUnique({
    where: {
      id,
    },
    include: {
      designation: true,
      salary: {
        include: {
          customSalaries: true
        }
      },
      overtimeStaffConfigs: true,
    },
  });

  return response;
};

const updateStaffByIdIntoDB = async (id: string, payload: UpdateStaffInput) => {
  const { customSalaries, password, ...rest } = payload;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  const existingStaff = await prisma.staff.findUnique({
    where: { id },
    include: { salary: true },
  });
  const response = await prisma.staff.update({
    where: {
      id,
    },
    data: {
      ...rest,
      ...(hashedPassword && { password: hashedPassword }),
      ...(customSalaries && {
        salary: {
          // salary is a to-one relation: upsert the row (it may not exist
          // if the staff was created without salary components), then
          // replace its custom salary items.
          upsert: {
            create: {
              total_amount: customSalaries.reduce(
                (acc, salary) => acc + Number(salary.salary_amount),
                0,
              ),
              customSalaries: {
                createMany: {
                  data: customSalaries.map((salary) => ({
                    salary_component: salary.salary_component,
                    salary_amount: Number(salary.salary_amount),
                  })),
                },
              },
            },
            update: {
              total_amount: customSalaries.reduce(
                (acc, salary) => acc + Number(salary.salary_amount),
                0,
              ),
              customSalaries: {
                deleteMany: {},
                createMany: {
                  data: customSalaries.map((salary) => ({
                    salary_component: salary.salary_component,
                    salary_amount: Number(salary.salary_amount),
                  })),
                },
              },
            },
          },
        },
      }),
    } as any,
  });

  if (payload.photo && existingStaff?.photo) {
    deleteImage(existingStaff.photo);
  }
  if (payload.nid_front && existingStaff?.nid_front) {
    deleteImage(existingStaff.nid_front);
  }
  if (payload.nid_back && existingStaff?.nid_back) {
    deleteImage(existingStaff.nid_back);
  }
  if (payload.academic_document && existingStaff?.academic_document) {
    deleteFile(existingStaff.academic_document);
  }
  if (
    payload.previous_institution_resign_letter &&
    existingStaff?.previous_institution_resign_letter
  ) {
    deleteFile(existingStaff.previous_institution_resign_letter);
  }

  return response;
};

const deleteStaffByIdFromDB = async (id: string) => {
  const existingStaff = await prisma.staff.findUnique({
    where: { id },
    include: {
      salary: {
        include: { customSalaries: true },
      },
    },
  });
  const response = await prisma.staff.delete({
    where: {
      id,
    },
  });

  if (existingStaff?.photo) {
    deleteImage(existingStaff.photo);
  }

  if (existingStaff?.nid_front) {
    deleteImage(existingStaff.nid_front);
  }

  if (existingStaff?.nid_back) {
    deleteImage(existingStaff.nid_back);
  }

  if (existingStaff?.academic_document) {
    deleteFile(existingStaff.academic_document);
  }

  if (existingStaff?.previous_institution_resign_letter) {
    deleteFile(existingStaff.previous_institution_resign_letter);
  }

  return response;
};

export const StaffService = {
  createStaffIntoDB,
  getAllStaffFromDB,
  getStaffByIdFromDB,
  updateStaffByIdIntoDB,
  deleteStaffByIdFromDB,
};
