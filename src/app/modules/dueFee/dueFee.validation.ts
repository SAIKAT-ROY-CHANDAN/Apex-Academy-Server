import z from 'zod';

const getDueFeesValidation = z.object({
  query: z.object({
    classId: z.string().optional(),
    departmentId: z.string().optional(),
    batchId: z.string().optional(),
    year: z.string().optional(),
    section: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    searchTerm: z.string().optional(),
    export: z.string().optional(),
  }),
});

export const DueFeeValidation = {
  getDueFeesValidation,
};
