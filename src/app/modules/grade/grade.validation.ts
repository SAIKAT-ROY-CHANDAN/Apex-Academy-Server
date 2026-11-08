import z from 'zod';

const studentResultValidationSchema = z
  .object({
    body: z.object({
      obtainMarks: z.number({ required_error: 'obtainMarks is required' }).min(0, 'obtainMarks must be non-negative'),
      totalMarks: z.number({ required_error: 'totalMarks is required' }).min(0, 'totalMarks must be positive'),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.body.obtainMarks > data.body.totalMarks) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'obtainMarks cannot exceed totalMarks',
        path: ['body', 'obtainMarks'],
      });
    }
  });

const createGradeScaleValidationSchema = z.object({
  body: z.object({
    minPercent: z.number({ required_error: 'minPercent is required' }).min(0).max(100),
    maxPercent: z.number({ required_error: 'maxPercent is required' }).min(0).max(100),
    letterGrade: z.string({ required_error: 'letterGrade is required' }).min(1, 'letterGrade cannot be empty'),
    gradePoint: z.number({ required_error: 'gradePoint is required' }).min(0),
    institutionId: z.string().optional().nullable(),
  }),
}).superRefine((data, ctx) => {
  if (data.body.minPercent > data.body.maxPercent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'minPercent cannot exceed maxPercent',
      path: ['body', 'minPercent'],
    });
  }
});

const updateGradeScaleValidationSchema = z.object({
  body: z.object({
    minPercent: z.number().min(0).max(100).optional(),
    maxPercent: z.number().min(0).max(100).optional(),
    letterGrade: z.string().min(1).optional(),
    gradePoint: z.number().min(0).optional(),
    institutionId: z.string().optional().nullable(),
  }),
});

export const gradeValidation = {
  studentResult: studentResultValidationSchema,
  createGradeScale: createGradeScaleValidationSchema,
  updateGradeScale: updateGradeScaleValidationSchema,
};
