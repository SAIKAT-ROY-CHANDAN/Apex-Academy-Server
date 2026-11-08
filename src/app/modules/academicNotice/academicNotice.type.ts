import { NoticeType } from '../../../../generated/prisma/enums';

export interface IAcademicNoticeCreate {
  title: string;
  noticeType: NoticeType;
  pdfUrl?: string | null;
}

export interface IAcademicNoticeUpdate {
  title?: string;
  noticeType?: NoticeType;
  pdfUrl?: string | null;
}
