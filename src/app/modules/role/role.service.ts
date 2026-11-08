import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import { TRolePayload } from './role.type';

const createRoleIntoDB = async (payload: TRolePayload) => {
  const response = await prisma.$transaction(async (prisma) => {
    const sameNameRoleInCompany = await prisma.role.findFirst({
      where: {
        role_name: payload.role_name,
      },
    });

    if (sameNameRoleInCompany) {
      throw new Error('Role with the same name already exists');
    }

    const role = await prisma.role.create({
      data: {
        role_name: payload.role_name,
        rolePermissions: {
          createMany: {
            data: payload.permissions.map((permissionId) => ({
              permissionId,
            })),
          },
        },
      },
    });

    return role;
  });

  return response;
};

const getMyPermissionsFromDB = async (userId: string) => {
  const user = await prisma.administrator.findUnique({
    where: { id: userId },
    select: { id: true, is_active: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (!user.is_active) {
    throw new AppError(403, 'User is inactive');
  }

  const permissions = await prisma.permission.findMany({
    where: {
      rolePermissions: {
        some: {
          role: {
            userRoles: {
              some: { userId },
            },
          },
        },
      },
    },
    select: { permission: true },
    orderBy: { permission: 'asc' },
  });

  return permissions.map((item) => item.permission);
};

const getAllPermissionsFromDB = async (query: Record<string, unknown>) => {
  const { role_name } = query as { role_name?: string };
  const permissions = await prisma.permission.findMany({
    ...(role_name && {
      where: { rolePermissions: { some: { role: { role_name } } } },
    }),
    select: { permission: true, id: true },
    orderBy: { permission: 'asc' },
  });

  return permissions;
};

const getAllRolesFromDB = async () => {
  const roles = await prisma.role.findMany({
    where: {
      NOT: {
        role_name: 'Super Admin',
      },
    },
    select: {
      id: true,
      role_name: true,
      created_at: true,
      _count: { select: { rolePermissions: true } },
      rolePermissions: {
        select: { permission: { select: { permission: true } } },
      },
    },
    orderBy: { role_name: 'asc' },
  });

  return roles.map((role) => ({
    id: role.id,
    role_name: role.role_name,
    created_at: role.created_at,
    permission_count: role._count.rolePermissions,
    permissions: role.rolePermissions.map((rp) => rp.permission.permission),
  }));
};

export const roleService = {
  createRoleIntoDB,
  getMyPermissionsFromDB,
  getAllPermissionsFromDB,
  getAllRolesFromDB,
};
