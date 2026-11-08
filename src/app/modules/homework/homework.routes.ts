import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { HomeworkValidation } from './homework.validation';
import { HomeworkController } from './homework.controller';

const router = Router();

router.post(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.homework.create),
  validation(HomeworkValidation.createHomeworkValidation),
  HomeworkController.createHomework,
);

router.get(
  '/',
  auth(['administrator', 'teacher',"student"]),
  // permission(permissions.academics.homework.view),
  HomeworkController.getAllHomeworks,
);

// Student accessible route - allows students to view homework for their class
router.get(
  '/student/my-homework',
  auth('student'),
  HomeworkController.getMyHomework,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  // permission(permissions.academics.homework.view),
  HomeworkController.getHomeworkById,
);

router.put(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.homework.edit),
  validation(HomeworkValidation.updateHomeworkValidation),
  HomeworkController.updateHomeworkById,
);

router.delete(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.homework.delete),
  HomeworkController.deleteHomeworkById,
);

export const HomeworkRoutes = router;