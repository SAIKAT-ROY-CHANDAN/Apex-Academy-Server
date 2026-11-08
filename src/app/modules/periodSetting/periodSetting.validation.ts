import z from 'zod';
import { MAX_PERIODS } from '../../constant/periods';

const periodTimeSchema = z.object({
  periodNumber: z.number().int().positive().max(MAX_PERIODS),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

const periodSettingBodyShape = {
  period_count: z.coerce
    .number({ required_error: 'Number of periods is required' })
    .int('Number of periods must be an integer')
    .min(1, 'Number of periods must be at least 1')
    .max(MAX_PERIODS, `Number of periods cannot exceed ${MAX_PERIODS}`),
  periods: z.array(periodTimeSchema).optional(),
};

type PeriodSettingBody = z.infer<z.ZodObject<typeof periodSettingBodyShape>>;

const validatePeriodSetting = (
  data: Partial<PeriodSettingBody>,
  ctx: z.RefinementCtx,
) => {
  if (!data.periods) return;

  const seen = new Set<number>();
  for (const period of data.periods) {
    if (seen.has(period.periodNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['periods'],
        message: `Duplicate times for period ${period.periodNumber}`,
      });
    }
    seen.add(period.periodNumber);

    if (
      data.period_count !== undefined &&
      period.periodNumber > data.period_count
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['periods'],
        message: `Times given for period ${period.periodNumber} but only ${data.period_count} periods are configured`,
      });
    }

    if (period.endTime <= period.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['periods'],
        message: `Period ${period.periodNumber}: end time must be after start time`,
      });
    }
  }

  const ordered = [...data.periods].sort((a, b) => a.periodNumber - b.periodNumber);
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i].startTime < ordered[i - 1].endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['periods'],
        message: `Period ${ordered[i].periodNumber} overlaps with period ${ordered[i - 1].periodNumber}`,
      });
      break;
    }
  }
};

const createPeriodSettingValidationSchema = z.object({
  body: z
    .object(periodSettingBodyShape)
    .superRefine(validatePeriodSetting),
});

const updatePeriodSettingValidationSchema = z.object({
  body: z
    .object(periodSettingBodyShape)
    .partial()
    .superRefine(validatePeriodSetting),
});

export const periodSettingValidation = {
  create: createPeriodSettingValidationSchema,
  update: updatePeriodSettingValidationSchema,
};