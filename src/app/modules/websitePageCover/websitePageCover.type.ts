export const PAGE_COVER_KEYS = [
  'aboutCollege',
  'managementTeam',
  'academic',
  'students',
  'gallery',
  'career',
  'noticeBoard',
  'contactUs',
] as const;

export type PageCoverKey = (typeof PAGE_COVER_KEYS)[number];

export const PAGE_COVER_KEY_LABEL: Record<PageCoverKey, string> = {
  aboutCollege: 'About College',
  managementTeam: 'Management Team & Administration',
  academic: 'Academic',
  students: 'Students',
  gallery: 'Gallery',
  career: 'Career',
  noticeBoard: 'Notice Board',
  contactUs: 'Contact Us',
};

export interface IWebsitePageCover {
  id: string;
  pageKey: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PageCoverMap = Partial<Record<PageCoverKey, string | null>>;
