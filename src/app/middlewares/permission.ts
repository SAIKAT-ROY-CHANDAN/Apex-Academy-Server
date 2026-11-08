import { NextFunction, Request, Response } from 'express';
import prisma from '../../db/db.config';

type PermissionInput = string | readonly string[];

export function permission(permissionInput: PermissionInput) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id as string | undefined;

      const isTeacher = req.user?.role === 'teacher' || (req.user as any)?.userType === 'teacher';
      const isStudent = req.user?.role === 'student' || (req.user as any)?.userType === 'student';

      if(isTeacher || isStudent) {
        next();
        return;
      }

      const requiredPermissions = Array.isArray(permissionInput)
        ? permissionInput
        : [permissionInput];

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      const hasPermission = await prisma.administrator.findFirst({
        where: {
          id: userId,
          is_active: true,
          userRole: {
            is: {
              role: {
                rolePermissions: {
                  some: {
                    permission: {
                      permission: {
                        in: requiredPermissions,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        select: { id: true },
      });

      if (!hasPermission) {
        return res.status(403).json({
          message: 'Insufficient permissions',
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
