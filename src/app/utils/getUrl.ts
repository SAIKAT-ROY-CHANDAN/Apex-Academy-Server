import { Request } from 'express';

export const getSingleImageUrl = (
  req: Request,
  file: Express.Multer.File | undefined,
): string | null => {
  if (!file || !file.filename) return null;
  return `${req.protocol}://${req.get('host')}/images/${file.filename}`;
};

export const getMultipleImageUrls = (
  req: Request,
  files: Express.Multer.File[] | undefined,
): string[] => {
  if (!files || files.length === 0) return [];
  return files.map((file) => {
    if (!file.filename) return '';
    return `${req.protocol}://${req.get('host')}/images/${file.filename}`;
  });
};

export const getSinglePdfUrl = (
  req: Request,
  file: Express.Multer.File | undefined,
): string | null => {
  if (!file || !file.filename) return null;
  return `${req.protocol}://${req.get('host')}/files/${file.filename}`;
};

export const getMultiplePdfUrls = (
  req: Request,
  files: Express.Multer.File[] | undefined,
): string[] => {
  if (!files || files.length === 0) return [];
  return files.map((file) => {
    if (!file.filename) return '';
    return `${req.protocol}://${req.get('host')}/files/${file.filename}`;
  });
};
