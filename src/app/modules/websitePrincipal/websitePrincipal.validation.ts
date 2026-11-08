import z from 'zod';

const websitePrincipalBodySchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    photoUrl: z.string().optional().nullable(),
    fromDate: z.string().min(1, 'From date is required').optional(),
    toDate: z.string().min(1, 'To date is required').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && to <= from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'To date must be after from date',
          path: ['toDate'],
        });
      }
    }
  });

const createWebsitePrincipalValidation = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    photoUrl: z.string().optional().nullable(),
    fromDate: z.string().min(1, 'From date is required'),
    toDate: z.string().min(1, 'To date is required'),
  }).superRefine((data, ctx) => {
    const from = new Date(data.fromDate);
    const to = new Date(data.toDate);
    if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && to <= from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'To date must be after from date',
        path: ['toDate'],
      });
    }
  }),
});

const updateWebsitePrincipalValidation = z.object({
  body: websitePrincipalBodySchema,
});

export const WebsitePrincipalValidation = {
  createWebsitePrincipalValidation,
  updateWebsitePrincipalValidation,
};
