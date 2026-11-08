import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = <T extends Record<string, unknown>>(
  payload: T,
  secret: string,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn,
  } as SignOptions);
};
