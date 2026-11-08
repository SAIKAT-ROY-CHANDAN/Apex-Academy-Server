import { Prisma } from '../../../../generated/prisma/client';
import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import configs from '../../configs';
import { deleteImage } from '../../utils/deleteFile';
import { generateToken } from '../../utils/generateToken';
import {
  IAdminAuthLogin,
  IAdminAuthRegister,
  IAdminAuthUpdate,
} from './adminAuth.type';
import bcrypt from 'bcryptjs';

const adminAuthLoginIntoDB = async (payload: IAdminAuthLogin) => {
  const isValidAdmin = await prisma.administrator.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!isValidAdmin) {
    throw new Error('Administrator not found with the provided email');
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    isValidAdmin.password,
  );

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  if (!isValidAdmin.is_active) {
    throw new Error('Administrator account is inactive');
  }

  const institutionCondition = await prisma.institutionConfig.findFirst({
    select: {
      is_setup_completed: true,
    },
  });
  const adminRoleCondition = await prisma.userRole.findFirst({
    where: {
      userId: isValidAdmin.id,
    },
    include: {
      role: {
        select: {
          role_name: true,
        },
      },
    },
  });

  const redirect =
    !institutionCondition?.is_setup_completed &&
    adminRoleCondition?.role?.role_name === 'Super Admin'
      ? '/setup-institution'
      : '/dashboard';

  const accessToken = generateToken(
    {
      id: isValidAdmin.id,
      email: isValidAdmin.email,
      userType: 'administrator',
      role: "admin",
      name: isValidAdmin.name,
    },
    configs.jwtAccessSecret as string,
    configs.accessTokenExpiration as string,
  );

  const refreshToken = generateToken(
    {
      id: isValidAdmin.id,
      email: isValidAdmin.email,
      userType: 'administrator',
      role: "admin",
      name: isValidAdmin.name,
    },
    configs.jwtRefreshSecret as string,
    configs.refreshTokenExpiration as string,
  );

  return {
    user: {
      id: isValidAdmin.id,
      email: isValidAdmin.email,
      name: isValidAdmin.name,
    },
    accessToken,
    refreshToken,
    redirect,
  };
};

const normalizeJsonArray = (value: unknown): unknown => {
  if (value == null) return value;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  }
  return value;
};

const addInstitutionConfig = async (
  payload: Prisma.InstitutionConfigCreateInput,
) => {
  const existingConfig = await prisma.institutionConfig.findFirst();

  if (existingConfig) {
    throw new Error('Institution configuration already exists');
  }
  const newConfig = await prisma.institutionConfig.create({
    data: {
      ...payload,
      ...(payload.active_modules != null && {
        active_modules: normalizeJsonArray(payload.active_modules) as Prisma.InputJsonValue,
      }),
      ...(payload.weekend_days != null && {
        weekend_days: normalizeJsonArray(payload.weekend_days) as Prisma.InputJsonValue,
      }),
      is_setup_completed: true,
    },
  });
  return newConfig;
};

const updateInstitutionConfig = async (
  payload: Prisma.InstitutionConfigUpdateInput,
) => {
  const existingConfig = await prisma.institutionConfig.findFirst();

  if (!existingConfig) {
    throw new Error('Institution configuration does not exist');
  }

  const sanitized: Prisma.InstitutionConfigUpdateInput = { ...payload };
  if (sanitized.active_modules != null) {
    sanitized.active_modules = normalizeJsonArray(sanitized.active_modules) as Prisma.InputJsonValue;
  }
  if (sanitized.weekend_days != null) {
    sanitized.weekend_days = normalizeJsonArray(sanitized.weekend_days) as Prisma.InputJsonValue;
  }

  const updatedConfig = await prisma.institutionConfig.update({
    where: {
      id: existingConfig.id,
    },
    data: sanitized,
  });

  return updatedConfig;
};

const getInstitutionConfig = async () => {
  const existingConfig = await prisma.institutionConfig.findFirst();

  if (!existingConfig) {
    throw new Error('Institution configuration does not exist');
  }

  return existingConfig;
};

const adminAuthRegisterIntoDB = async (payload: IAdminAuthRegister) => {
  const existingAdmin = await prisma.administrator.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingAdmin) {
    throw new Error('Administrator with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const newAdmin = await prisma.administrator.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      ...(payload.avatar && { avatar: payload.avatar }),
      userRole: {
        create: {
          roleId: payload.roleId,
        },
      },
    },
  });

  return newAdmin;
};

const updateAdminUserFromDB = async (
  adminId: string,
  payload: IAdminAuthUpdate,
) => {
  const existingAdmin = await prisma.administrator.findUnique({
    where: {
      id: adminId,
    },
  });

  if (!existingAdmin) {
    throw new Error('Administrator not found');
  }

  const updatedAdmin = await prisma.administrator.update({
    where: {
      id: adminId,
    },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.avatar && { avatar: payload.avatar }),
      ...(payload.roleId && {
        userRole: { update: { roleId: payload.roleId } },
      }),
    },
  });

  if (payload?.avatar && existingAdmin.avatar) {
    deleteImage(existingAdmin.avatar);
  }

  return updatedAdmin;
};

const getAllAdminUsersFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name', 'email'],
  });

  const [totalItems, adminUsers] = await prisma.$transaction([
    prisma.administrator.count({ where }),
    prisma.administrator.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        userRole: {
          include: {
            role: {
              select: {
                role_name: true,
                id: true,
              }
            },
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: adminUsers,
  };
};

const getAdminUserByIdFromDB = async (adminId: string) => {
  const existingAdmin = await prisma.administrator.findUnique({
    where: {
      id: adminId,
    },
  });

  if (!existingAdmin) {
    throw new Error('Administrator not found');
  }

  return existingAdmin;
};

const deleteAdminUserFromDB = async (adminId: string) => {
  const existingAdmin = await prisma.administrator.findUnique({
    where: {
      id: adminId,
    },
  });

  if (!existingAdmin) {
    throw new Error('Administrator not found');
  }

  if (existingAdmin.avatar) {
    deleteImage(existingAdmin.avatar);
  }

  await prisma.administrator.delete({
    where: {
      id: adminId,
    },
  });
};

export const AdminAuthService = {
  adminAuthLoginIntoDB,
  addInstitutionConfig,
  updateInstitutionConfig,
  adminAuthRegisterIntoDB,
  updateAdminUserFromDB,
  getAdminUserByIdFromDB,
  getAllAdminUsersFromDB,
  getInstitutionConfig,
  deleteAdminUserFromDB,
};
