import { Router } from 'express';
import { AcademicProgramMediaController } from './academicProgramMedia.controller';
import validation from '../../middlewares/validation';
import { AcademicProgramMediaValidation } from './academicProgramMedia.validation';
import auth from '../../middlewares/auth';
import { processUploads, upload } from '../../middlewares/multer';

function createMediaRouter(defaultSection?: string) {
  const r = Router();

  // Inject default section when caller omits ?section= (used by legacy /academic-programs/media)
  const injectDefaultSection = (req: any, _res: any, next: any) => {
    if (defaultSection && !req.query.section) {
      req.query.section = defaultSection;
    }
    if (defaultSection) {
      req.defaultSection = defaultSection;
    }
    next();
  };

  // Public list — supports ?section=academic-programs|co-curriculum-activities&type=photo|video
  r.get(
    '/',
    injectDefaultSection,
    AcademicProgramMediaController.getAllAcademicProgramMedia,
  );

  r.post(
    '/',
    auth('administrator'),
    upload.fields([
      { name: 'academic_program_image', maxCount: 1 },
      { name: 'academic_image', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
    processUploads,
    (req: any, _res: any, next: any) => {
      if (defaultSection && !req.body.section) {
        req.body.section = defaultSection;
        req.defaultSection = defaultSection;
      }
      next();
    },
    validation(
      AcademicProgramMediaValidation.createAcademicProgramMediaValidation,
    ),
    AcademicProgramMediaController.createAcademicProgramMedia,
  );

  r.delete(
    '/',
    auth('administrator'),
    injectDefaultSection,
    AcademicProgramMediaController.deleteAllAcademicProgramMedia,
  );

  r.delete(
    '/:id',
    auth('administrator'),
    AcademicProgramMediaController.deleteAcademicProgramMedia,
  );

  return r;
}

// Legacy path — defaults to ACADEMIC_PROGRAMS when section not supplied (backwards compat)
export const AcademicProgramMediaRoutes = createMediaRouter('academic-programs');

// Unified path — section must be supplied via ?section= or body.section; no default injection
export const WebsiteSectionMediaRoutes = createMediaRouter();

export { createMediaRouter };
