import z from 'zod';
import { NoticeType } from '../../../../generated/prisma/enums';

const createAcademicNoticeValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    noticeType: z.nativeEnum(NoticeType, {
      message: 'Invalid notice type',
    }),
    pdfUrl: z.string().optional().nullable(),
    // allow remove flag to pass through validation for multipart handling
    removePdf: z.string().optional(),
  }),
});

const updateAcademicNoticeValidation = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }).optional(),
    noticeType: z
      .nativeEnum(NoticeType, { message: 'Invalid notice type' })
      .optional(),
    pdfUrl: z.string().optional().nullable(),
    removePdf: z.string().optional(),
  }),
});

export const AcademicNoticeValidation = {
  createAcademicNoticeValidation,
  updateAcademicNoticeValidation,
};
