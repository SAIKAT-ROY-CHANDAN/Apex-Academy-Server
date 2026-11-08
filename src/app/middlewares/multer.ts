// middlewares/multer.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { NextFunction } from 'express';
import { uploadToCloudinary } from '../utils/cloudinary';
import configs from '../configs';
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_IMAGE_TYPES,
} from '../constant/acceptedTypes';

const IMAGE_FIELDS = new Set([
  'photo',
  'nid_front',
  'nid_back',
  'avatar',
  'logo',
  'watermark',
  'header',
  'footer',
  'hero_image',
  'glance_image_1',
  'glance_image_2',
  'glance_image_3',
  'glance_image_4',
  'outline_image_1',
  'outline_image_2',
  'outline_image_3',
  'chairman_image',
  'principal_image',
  'governing_image',
  'hod_image',
  'department_image',
  'job_image',
  'tuition_image',
  'main_image',
  'sub_one_image',
  'sub_two_image',
  'gallery_image',
  'cta_image',
  'faq_image',
  'footer_image',
  'branding_image',
  'aboutCollege',
  'managementTeam',
  'academic',
  'students',
  'gallery',
  'career',
  'noticeBoard',
  'contactUs',
  'photo',
  'principal_photo',
  'academic_program_image',
  'academic_image',
  'career_image',
  'admission_image',
  'image',
]);
const FILE_FIELDS = new Set([
  'pdf_file',
  'syllabus_file',
  'curriculum_file',
]);

// Teacher/staff documents are often uploaded as scans (jpg/png) as well as
// PDF/Word files — accept both, stored raw under public/files.
const DOCUMENT_FIELDS = new Set([
  'academic_document',
  'previous_institution_resign_letter',
]);

// Job application documents accept both images and PDF/Word files —
// processUploads decides image (WebP) vs raw file by mimetype.
const IMAGE_OR_FILE_FIELDS = new Set(['certificate', 'cv']);

const memoryStorage = multer.memoryStorage();

const isAcceptedImage = (mimetype: string) =>
  ACCEPTED_IMAGE_TYPES.includes(mimetype);
const isAcceptedFile = (mimetype: string) =>
  ACCEPTED_FILE_TYPES.includes(mimetype);

const combinedFilter = function (req: any, file: any, cb: any) {
  if (IMAGE_FIELDS.has(file.fieldname)) {
    if (isAcceptedImage(file.mimetype)) return cb(null, true);
    return cb(new Error(`Unsupported image type for ${file.fieldname}`));
  }
  if (IMAGE_OR_FILE_FIELDS.has(file.fieldname)) {
    if (isAcceptedImage(file.mimetype) || isAcceptedFile(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(`Unsupported file type for ${file.fieldname}`));
  }
  if (FILE_FIELDS.has(file.fieldname)) {
    if (isAcceptedFile(file.mimetype)) return cb(null, true);
    return cb(new Error(`Unsupported file type for ${file.fieldname}`));
  }
  if (DOCUMENT_FIELDS.has(file.fieldname)) {
    if (isAcceptedImage(file.mimetype) || isAcceptedFile(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(`Unsupported file type for ${file.fieldname}`));
  }
  return cb(new Error(`Unexpected field: ${file.fieldname}`));
};

export const upload = multer({
  storage: memoryStorage,
  fileFilter: combinedFilter,
});

export const processUploads = async (
  req: any,
  res: any,
  next: NextFunction,
) => {
  try {
    // Handle both upload.single() (req.file) and upload.fields()/upload.array() (req.files)
    const files = req.file ? { [req.file.fieldname]: [req.file] } : req.files;

    if (!files) return next();

    const hasCloudinary = Boolean(
      configs.cloudinary.cloudName &&
        configs.cloudinary.apiKey &&
        configs.cloudinary.apiSecret,
    );
    const isWorker = typeof (globalThis as any).WebSocketPair !== 'undefined';

    const processImage = async (file: Express.Multer.File) => {
      if (hasCloudinary || isWorker) {
        return await uploadToCloudinary(file.buffer);
      }
      const timestamp = Date.now();
      const filename = `${file.fieldname}-${timestamp}-${Math.round(
        Math.random() * 1e9,
      )}.webp`;
      const outputPath = path.join(process.cwd(), 'public', 'images', filename);
      await sharp(file.buffer).webp({ quality: 80 }).toFile(outputPath);
      return filename;
    };

    const saveRawFile = async (file: Express.Multer.File) => {
      if (hasCloudinary || isWorker) {
        return await uploadToCloudinary(file.buffer);
      }
      const timestamp = Date.now();
      const filename = `${file.fieldname}-${timestamp}-${Math.round(
        Math.random() * 1e9,
      )}${path.extname(file.originalname)}`;
      const outputPath = path.join(process.cwd(), 'public', 'files', filename);
      await fs.promises.writeFile(outputPath, file.buffer);
      return filename;
    };

    for (const field of Object.keys(files)) {
      const fileList = files[field];
      if (!Array.isArray(fileList)) continue;
      for (const file of fileList) {
        if (IMAGE_OR_FILE_FIELDS.has(field)) {
          // Accept either an image (→ WebP) or a raw document (PDF/Word).
          file.filename = isAcceptedImage(file.mimetype)
            ? await processImage(file)
            : await saveRawFile(file);
        } else {
          file.filename = IMAGE_FIELDS.has(field)
            ? await processImage(file)
            : await saveRawFile(file);
        }
      }
    }

    next();
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing the file',
    });
  }
};
