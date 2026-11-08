import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { deleteFile, deleteImage } from '../../utils/deleteFile';
import bcrypt from 'bcryptjs';
import {
  CreateTeacherInput,
  TeacherPromotionInput,
  UpdateTeacherInput,
} from './teacher.type';
import { generateToken } from '../../utils/generateToken';
import configs from '../../configs';

const createTeacherIntoDB = async (payload: CreateTeacherInput) => {
  const { customSalaries, password, ...rest } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const response = await prisma.teacher.create({
    data: {
      ...rest,
      password: hashedPassword,
      ...((customSalaries && {
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
      }) as any),
    },
  });

  return response;
};

const loginTeacherIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const isTeacherExist = await prisma.teacher.findFirst({
    where: {
      email: payload.email,
    },
  });

  if (!isTeacherExist) {
    throw new Error('Teacher not found');
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    isTeacherExist.password,
  );
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const accessToken = generateToken(
    {
      id: isTeacherExist.id,
      role: 'teacher',
      email: isTeacherExist.email,
      name: isTeacherExist.full_name,
    },
    configs.jwtAccessSecret as string,
    configs.accessTokenExpiration as string,
  );

  const refreshToken = generateToken(
    {
      id: isTeacherExist.id,
      role: 'teacher',
      email: isTeacherExist.email,
      name: isTeacherExist.full_name,
    },
    configs.jwtRefreshSecret as string,
    configs.refreshTokenExpiration as string,
  );

  return {
    user: {
      id: isTeacherExist.id,
      phone: isTeacherExist.phone,
      name: isTeacherExist.full_name,
    },
    accessToken,
    refreshToken,
  };
};

const getAllTeachersFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['full_name', 'email', 'phone'],
  });

  const { program_id, ...restWhere } = where as Record<string, any>;

  const finalWhere: any = {
    ...restWhere,
    ...(program_id && {
      department: {
        ...(restWhere.department || {}),
        program_id,
      },
    }),
  };

  const [totalItems, teachers] = await prisma.$transaction([
    prisma.teacher.count({ where: finalWhere }),
    prisma.teacher.findMany({
      where: finalWhere,
      orderBy,
      skip,
      take,
      include: {
        designation: true,
        overtimeTeacherConfig: true,
        salaryAdvances: true,
        teacherOvertimes: true,
        shift: true,
        department: {
          include: {
            program: true,
          },
        },
        salary: {
          include: {
            customSalaries: true,
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: teachers,
  };
};

const getTeacherByIdFromDB = async (id: string) => {
  const response = await prisma.teacher.findUnique({
    where: {
      id,
    },
    include: {
      designation: true,
      shift: true,
      department: true,
      overtimeTeacherConfig: true,
      salaryAdvances: true,
      teacherOvertimes: true,
      salary: {
        include: {
          customSalaries: true,
        },
      },
    },
  });

  return response;
};

const updateTeacherByIdIntoDB = async (
  id: string,
  payload: UpdateTeacherInput,
) => {
  const { customSalaries, password, ...rest } = payload;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  const existingTeacher = await prisma.teacher.findUnique({
    where: { id },
  });
  const response = await prisma.teacher.update({
    where: {
      id,
    },
    data: {
      ...rest,
      ...(hashedPassword && { password: hashedPassword }),
      ...(customSalaries && {
        salary: {
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
      }),
    } as any,
  });

  if (payload.photo && existingTeacher?.photo) {
    deleteImage(existingTeacher.photo);
  }
  if (payload.nid_front && existingTeacher?.nid_front) {
    deleteImage(existingTeacher.nid_front);
  }
  if (payload.nid_back && existingTeacher?.nid_back) {
    deleteImage(existingTeacher.nid_back);
  }
  if (payload.academic_document && existingTeacher?.academic_document) {
    deleteFile(existingTeacher.academic_document);
  }
  if (
    payload.previous_institution_resign_letter &&
    existingTeacher?.previous_institution_resign_letter
  ) {
    deleteFile(existingTeacher.previous_institution_resign_letter);
  }

  return response;
};

const deleteTeacherByIdFromDB = async (id: string) => {
  const existingTeacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      salary: {
        include: { customSalaries: true },
      },
    },
  });
  const response = await prisma.teacher.delete({
    where: {
      id,
    },
  });

  if (existingTeacher?.photo) {
    deleteImage(existingTeacher.photo);
  }

  if (existingTeacher?.nid_front) {
    deleteImage(existingTeacher.nid_front);
  }

  if (existingTeacher?.nid_back) {
    deleteImage(existingTeacher.nid_back);
  }

  if (existingTeacher?.academic_document) {
    deleteFile(existingTeacher.academic_document);
  }

  if (existingTeacher?.previous_institution_resign_letter) {
    deleteFile(existingTeacher.previous_institution_resign_letter);
  }

  return response;
};

const teacherPromotionByAdmin = async (
  teacherId: string,
  payload: TeacherPromotionInput,
) => {
  const response = await prisma.teacher.update({
    where: {
      id: teacherId,
    },
    data: {
      teacher_type: payload.teacher_type,
      designation_id: payload.designation_id,
      shift_id: payload.shift_id,
    },
  });

  return response;
};

export const TeacherService = {
  createTeacherIntoDB,
  getAllTeachersFromDB,
  loginTeacherIntoDB,
  getTeacherByIdFromDB,
  updateTeacherByIdIntoDB,
  deleteTeacherByIdFromDB,
  teacherPromotionByAdmin,
};