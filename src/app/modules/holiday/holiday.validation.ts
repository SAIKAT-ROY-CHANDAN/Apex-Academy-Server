import z from 'zod';
import { HolidayType } from '../../../../generated/prisma/enums';

const createHolidayValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    start_date: z.coerce.date({ message: 'Invalid start date' }),
    end_date: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.coerce.date({ message: 'Invalid end date' }).optional(),
    ),
    holiday_type: z.nativeEnum(HolidayType, {
       message: 'Invalid holiday type',
    }),
    is_active: z.boolean().optional(),
  }),
});

const updateHolidayValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }).optional(),
    description: z.string().optional(),
    start_date: z.coerce.date({ message: 'Invalid start date' }).optional(),
    end_date: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.coerce.date({ message: 'Invalid end date' }).optional(),
    ),
    holiday_type: z
      .nativeEnum(HolidayType, { message: 'Invalid holiday type' })
      .optional(),
    is_active: z.boolean().optional(),
  }),
});

export const HolidayValidation = {
  createHolidayValidation,
  updateHolidayValidation,
};