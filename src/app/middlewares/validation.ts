import { ZodTypeAny } from 'zod';
import catchAsync from '../utils/catchAsync';

const validation = (schema: ZodTypeAny) => {
  return catchAsync(async (req, res, next) => {
    req.body = req.body || {};
    const parsedData = await schema.parseAsync({
      body: req.body,
    });

    req.body = parsedData.body;

    next();
  });
};

export default validation;
