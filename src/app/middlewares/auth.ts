import configs from '../configs';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from '../../db/db.config';

export type AuthUserType = 'administrator' | 'teacher' | 'student';

type AuthPayload = JwtPayload & {
  id?: string;
  userType?: AuthUserType;
};

type AuthInput = AuthUserType | readonly AuthUserType[];

const findUserByType = async (id: string, userType?: AuthUserType) => {
  console.log(userType,"userTypeuserType");
  
  if (userType === 'administrator') {
    return prisma.administrator.findUnique({ where: { id } });
  }

  if (userType === 'teacher') {
    return prisma.teacher.findUnique({ where: { id } });
  }

  if (userType === 'student') {
    return prisma.student.findUnique({ where: { id } });
  }

  const [administrator, teacher, student] = await Promise.all([
    prisma.administrator.findUnique({ where: { id } }),
    prisma.teacher.findUnique({ where: { id } }),
    prisma.student.findUnique({ where: { id } }),
  ]);

  return administrator ?? teacher ?? student;
};

const auth = (allowedUserTypes?: AuthInput) => {
  return catchAsync(async (req, _res, next) => {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      throw new AppError(401, 'You are not authorized to access this route');
    }

    const token = bearerToken.split(' ')[1];

    let decoded: AuthPayload;
    try {
      decoded = jwt.verify(
        token,
        configs.jwtAccessSecret as string,
      ) as AuthPayload;
    } catch {
      throw new AppError(401, 'Invalid or expired token');
    }

    const { id } = decoded;

    if (!id || typeof id !== 'string') {
      throw new AppError(401, 'Invalid token payload');
    }

    const user = await findUserByType(id, decoded.userType);
console.log( decoded.userType,"here is user ");

    if (!user) {
      throw new AppError(401, 'User no longer exists or session is invalid');
    }

    if (!user.is_active) {
      throw new AppError(403, 'User is inactive');
    }

    req.user = {
      ...decoded,
      id,
      userType:
        decoded.userType ??
        ('userRole' in user
          ? 'administrator'
          : 'full_name' in user
            ? 'teacher'
            : 'student'),
      name:
        ('name' in user && typeof user.name === 'string')
          ? user.name
          : ('full_name' in user && typeof user.full_name === 'string')
            ? user.full_name
            : decoded.name ?? undefined,
    };

    if (allowedUserTypes) {
      const allowedList = Array.isArray(allowedUserTypes)
        ? allowedUserTypes
        : [allowedUserTypes];

      if (!allowedList.includes(req.user.userType)) {
        throw new AppError(403, 'You are not authorized to access this route all');
      }
    }

    next();
  });
};

export default auth;
