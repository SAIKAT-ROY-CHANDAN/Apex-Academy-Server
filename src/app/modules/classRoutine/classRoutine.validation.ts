import z from 'zod';
import prisma from '../../../db/db.config';
import { MAX_PERIODS, DEFAULT_PERIOD_COUNT } from '../../constant/periods';

// ⚠️ এই enum ভ্যালুগুলো আপনার Prisma schema-র `DayOfWeek` enum-এর সাথে
// অক্ষরে অক্ষরে (case sensitive) মিলতে হবে। মিলিয়ে নিবেন।
const dayOfWeekEnum = z.enum([
  'SATURDAY',
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
]);

// The institute-wide period count configured in Period Settings. Clamped to
// MAX_PERIODS so a hand-edited row cannot widen the sanity cap.
const getMaxPeriodCount = async (): Promise<number> => {
  const setting = await prisma.periodSetting.findFirst({
    orderBy: { created_at: 'asc' },
  });
  const count = setting?.period_count ?? DEFAULT_PERIOD_COUNT;
  return Math.min(Math.max(count, 1), MAX_PERIODS);
};

/**
 * Room / lab number of a single routine cell.
 *
 * Optional and free-form enough for real institutes - "101", "B-12",
 * "Lab 2" all pass. An empty or whitespace-only value is collapsed to null so
 * "cleared" and "never set" are stored identically.
 */
const roomNoSchema = z
  .string()
  .trim()
  .max(20, 'Room number cannot exceed 20 characters')
  .regex(
    /^[A-Za-z0-9 /.-]*$/,
    'Room number can only contain letters, numbers, spaces, dash, slash and dot',
  )
  .optional()
  .transform((value) => (value ? value : null));

const classRoutineItemSchema = z.object({
  period_no: z
    .number({ required_error: 'Period number is required' })
    .int('Period number must be an integer')
    .positive('Period number must be positive')
    .max(MAX_PERIODS, `Period number cannot exceed ${MAX_PERIODS}`),
  day: dayOfWeekEnum,
  subject_id: z.string({ required_error: 'Subject ID is required' }),
  teacher_id: z.string({ required_error: 'Teacher ID is required' }),
  roomNo: roomNoSchema,
});

/**
 * A room number only makes sense together with a subject (and, by the same
 * rule, a teacher). A cell with neither is an empty slot that the service
 * drops entirely, so a leftover room there is simply ignored. A cell that does
 * have a teacher but no subject is a real mistake worth telling the admin
 * about, so it is rejected instead.
 */
const addRoomNoIssue = (
  item: {
    subject_id: string;
    teacher_id: string;
    roomNo?: string | null;
  },
  index: number,
  ctx: z.RefinementCtx,
) => {
  if (!item.roomNo) return;
  if (!item.subject_id && !item.teacher_id) return;
  if (item.subject_id) return;

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: `Room "${item.roomNo}" needs a subject in that period`,
    path: ['classRoutineItems', index, 'roomNo'],
  });
};

const createClassRoutineValidationSchema = z.object({
  body: z
    .object({
      academic_class_id: z.string({ required_error: 'Academic class ID is required' }),
      academic_section_id: z.string().optional(),
      batch_id: z.string().optional(),
      shift_id: z.string().optional(),
      classRoutineItems: z
        .array(classRoutineItemSchema)
        .min(1, 'At least one class routine item is required'),
    })
    .superRefine(async (data, ctx) => {
      const maxPeriods = await getMaxPeriodCount();
      // একই payload-এর ভেতরে duplicate (day + period_no) থাকলে আটকে দেওয়া হচ্ছে
      const seen = new Set<string>();
      data.classRoutineItems.forEach((item, index) => {
        if (item.period_no > maxPeriods) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Period ${item.period_no} exceeds the configured maximum of ${maxPeriods}`,
            path: ['classRoutineItems', index],
          });
        }
        const key = `${item.day}-${item.period_no}`;
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate entry for ${item.day}, period ${item.period_no}`,
            path: ['classRoutineItems', index],
          });
        }
        seen.add(key);
        addRoomNoIssue(item, index, ctx);
      });
    }),
});

const updateClassRoutineValidationSchema = z.object({
  body: z
    .object({
      academic_class_id: z.string().optional(),
      academic_section_id: z.string().optional(),
      batch_id: z.string().optional(),
      shift_id: z.string().optional(),
      classRoutineItems: z
        .array(classRoutineItemSchema)
        .min(1, 'At least one class routine item is required')
        .optional(),
    })
    .superRefine(async (data, ctx) => {
      if (!data.classRoutineItems) return;
      const maxPeriods = await getMaxPeriodCount();
      const seen = new Set<string>();
      data.classRoutineItems.forEach((item, index) => {
        if (item.period_no > maxPeriods) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Period ${item.period_no} exceeds the configured maximum of ${maxPeriods}`,
            path: ['classRoutineItems', index],
          });
        }
        const key = `${item.day}-${item.period_no}`;
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate entry for ${item.day}, period ${item.period_no}`,
            path: ['classRoutineItems', index],
          });
        }
seen.add(key);
        addRoomNoIssue(item, index, ctx);
      });
    }),
});

export const classRoutineValidation = {
  create: createClassRoutineValidationSchema,
  update: updateClassRoutineValidationSchema,
};