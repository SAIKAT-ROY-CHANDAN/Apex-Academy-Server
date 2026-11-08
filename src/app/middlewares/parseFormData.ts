/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware to parse JSON strings in form data
 * Form data sends nested objects/arrays as JSON strings, this middleware parses them back
 */
const parseFormData = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      fields.forEach((field) => {
        if (req.body[field] && typeof req.body[field] === 'string') {
          try {
            req.body[field] = JSON.parse(req.body[field]);
          } catch (error:any) {
            console.log(error);
            // If parsing fails, keep the original value
            console.log(`Failed to parse field: ${field}`);
          }
        }
      });
    }
    next();
  };
};

export default parseFormData;
