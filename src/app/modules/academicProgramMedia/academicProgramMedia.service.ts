import prisma from '../../../db/db.config';
import { deleteImage } from '../../utils/deleteFile';
import {
  AcademicProgramMediaType,
  IAcademicProgramMediaCreate,
  normalizeSection,
} from './academicProgramMedia.type';

const createAcademicProgramMediaIntoDB = async (
  payload: IAcademicProgramMediaCreate,
) => {
  const normalizedType = String(payload.type).toUpperCase() as AcademicProgramMediaType;
  if (!Object.values(AcademicProgramMediaType).includes(normalizedType)) {
    throw new Error('Invalid media type. Must be PHOTO or VIDEO');
  }

  const section = normalizeSection(payload.section as string | undefined);

  const data: any = {
    section,
    type: normalizedType,
    title: payload.title,
    captureDate: new Date(payload.captureDate),
  };

  if (isNaN(data.captureDate.getTime())) {
    throw new Error('Invalid capture date');
  }

  if (normalizedType === 'PHOTO') {
    if (!payload.fileUrl) {
      throw new Error('Photo file is required for PHOTO type');
    }
    data.fileUrl = payload.fileUrl;
    data.videoUrl = null;
  } else {
    if (!payload.videoUrl) {
      throw new Error('Video URL is required for VIDEO type');
    }
    data.videoUrl = payload.videoUrl;
    data.fileUrl = null;
  }

  const result = await prisma.academicProgramMedia.create({ data });
  return result;
};

const getAllAcademicProgramMediaFromDB = async (query: any) => {
  const rawType = query?.type ?? query?.mediaType;
  const rawSection = query?.section;
  let where: any = {};
  if (rawSection) {
    where.section = normalizeSection(String(rawSection));
  } else if (query?.defaultSection) {
    where.section = normalizeSection(String(query.defaultSection));
  }
  if (rawType) {
    const normalized = String(rawType).toUpperCase();
    if (['PHOTO', 'VIDEO'].includes(normalized)) {
      where.type = normalized as AcademicProgramMediaType;
    }
  }

  const result = await prisma.academicProgramMedia.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return result;
};

const deleteAcademicProgramMediaFromDB = async (id: string) => {
  const existing = await prisma.academicProgramMedia.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Media not found');
  }

  if (existing.fileUrl) {
    deleteImage(existing.fileUrl);
  }

  await prisma.academicProgramMedia.delete({
    where: { id },
  });
};

const deleteAllAcademicProgramMediaFromDB = async (
  type?: string,
  section?: string,
) => {
  let where: any = {};
  if (section) {
    where.section = normalizeSection(section);
  }
  if (type) {
    const normalized = String(type).toUpperCase() as AcademicProgramMediaType;
    if (['PHOTO', 'VIDEO'].includes(normalized)) {
      where.type = normalized;
    }
  }
  const items = await prisma.academicProgramMedia.findMany({ where });
  for (const item of items) {
    if (item.fileUrl) {
      deleteImage(item.fileUrl);
    }
  }
  await prisma.academicProgramMedia.deleteMany({ where });
  return { deletedCount: items.length };
};

export const AcademicProgramMediaService = {
  createAcademicProgramMediaIntoDB,
  getAllAcademicProgramMediaFromDB,
  deleteAcademicProgramMediaFromDB,
  deleteAllAcademicProgramMediaFromDB,
};
