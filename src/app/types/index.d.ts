import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & {
        id?: string;
        userType?: string;
        name?: string;
      };
    }
  }
}
