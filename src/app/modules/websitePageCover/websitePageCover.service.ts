import prisma from '../../../db/db.config';
import { PAGE_COVER_KEYS, PageCoverKey, PageCoverMap } from './websitePageCover.type';

const getAllPageCoversFromDB = async (): Promise<PageCoverMap> => {
  const rows = await prisma.websitePageCover.findMany();

  const map: PageCoverMap = {};
  for (const key of PAGE_COVER_KEYS) {
    map[key] = null;
  }

  for (const row of rows) {
    const key = row.pageKey as PageCoverKey;
    if ((PAGE_COVER_KEYS as readonly string[]).includes(key)) {
      map[key] = row.imageUrl;
    }
  }

  return map;
};

const upsertPageCoversIntoDB = async (
  payload: PageCoverMap,
): Promise<PageCoverMap> => {
  const entries = Object.entries(payload).filter(
    ([key, url]) =>
      (PAGE_COVER_KEYS as readonly string[]).includes(key) &&
      typeof url === 'string' &&
      url.length > 0,
  ) as [PageCoverKey, string][];

  if (entries.length === 0) {
    throw new Error('No valid cover images provided');
  }

  for (const [pageKey, imageUrl] of entries) {
    await prisma.websitePageCover.upsert({
      where: { pageKey },
      update: { imageUrl },
      create: { pageKey, imageUrl },
    });
  }

  return getAllPageCoversFromDB();
};

const deleteAllPageCoversFromDB = async (): Promise<PageCoverMap> => {
  await prisma.websitePageCover.deleteMany({});
  return getAllPageCoversFromDB();
};

export const WebsitePageCoverService = {
  getAllPageCoversFromDB,
  upsertPageCoversIntoDB,
  deleteAllPageCoversFromDB,
};
