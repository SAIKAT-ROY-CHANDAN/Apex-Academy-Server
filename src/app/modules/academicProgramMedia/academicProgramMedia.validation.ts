import z from 'zod';

const createAcademicProgramMediaValidation = z.object({
  body: z
    .object({
      section: z.string().optional().nullable(),
      type: z.enum(['PHOTO', 'VIDEO', 'photo', 'video']),
      title: z.string().min(1, 'Title is required'),
      captureDate: z.string().min(1, 'Capture date is required'),
      videoUrl: z.string().optional().nullable(),
      fileUrl: z.string().optional().nullable(),
    })
    .superRefine((data, ctx) => {
      const normalized = String(data.type).toUpperCase();
      if (normalized === 'VIDEO') {
        if (!data.videoUrl || String(data.videoUrl).trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Video URL is required for video type',
            path: ['videoUrl'],
          });
        } else {
          try {
            // Allow empty? Already checked. Validate URL format loosely.
            new URL(String(data.videoUrl));
          } catch {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Video URL must be a valid URL',
              path: ['videoUrl'],
            });
          }
        }
      }
      // For PHOTO, file validation is handled by multer/controller — no extra check here.
    }),
});

export const AcademicProgramMediaValidation = {
  createAcademicProgramMediaValidation,
};
