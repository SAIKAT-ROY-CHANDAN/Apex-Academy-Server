import { Router } from 'express';
import { WebsiteVisionMissionController } from './websiteVisionMission.controller';
import validation from '../../middlewares/validation';
import { WebsiteVisionMissionValidation } from './websiteVisionMission.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.visionMission.create),
  validation(WebsiteVisionMissionValidation.createWebsiteVisionMissionValidation),
  WebsiteVisionMissionController.createWebsiteVisionMission,
);

router.get(
  '/',
  WebsiteVisionMissionController.getWebsiteVisionMission,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.visionMission.view),
  WebsiteVisionMissionController.getWebsiteVisionMissionById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.visionMission.edit),
  validation(WebsiteVisionMissionValidation.updateWebsiteVisionMissionValidation),
  WebsiteVisionMissionController.updateWebsiteVisionMission,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.visionMission.delete),
  WebsiteVisionMissionController.deleteWebsiteVisionMission,
);

export const WebsiteVisionMissionRoutes = router;
