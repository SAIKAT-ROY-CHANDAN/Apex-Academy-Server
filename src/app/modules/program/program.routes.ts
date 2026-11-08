import { Router } from 'express';
import { ProgramController } from './program.controller';
import validation from '../../middlewares/validation';
import { ProgramValidation } from './program.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.program.create),
  validation(ProgramValidation.createProgramValidation),
  ProgramController.createProgram,
);

router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.program.view),
  ProgramController.getAllPrograms,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.program.view),
  ProgramController.getProgramById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.program.edit),
  validation(ProgramValidation.updateProgramValidation),
  ProgramController.updateProgram,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.program.delete),
  ProgramController.deleteProgram,
);

export const ProgramRoutes = router;