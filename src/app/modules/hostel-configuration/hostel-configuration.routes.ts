import { Router } from 'express';
import { HostelConfigurationController } from './hostel-configuration.controller';
import validation from '../../middlewares/validation';
import { HostelConfigurationValidation } from './hostel-configuration.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/create-building',
  auth('administrator'),
  permission(permissions.hostel.hostelConfiguration.create),
  validation(HostelConfigurationValidation.createHostelWithFloorsValidation),
  HostelConfigurationController.createHostelWithFloors,
);

router.post(
  '/assign-rooms',
  auth('administrator'),
  permission(permissions.hostel.hostelRoom.create),
  validation(HostelConfigurationValidation.assignRoomsToFloorValidation),
  HostelConfigurationController.assignRoomsToFloor,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.hostel.hostelConfiguration.view),
  HostelConfigurationController.getAllHostelConfigurations,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelConfiguration.view),
  HostelConfigurationController.getHostelConfigurationById,
);

router.get(
  '/floor/:floorId',
  auth('administrator'),
  permission(permissions.hostel.hostelFloor.view),
  HostelConfigurationController.getHostelFloorById,
);

router.get(
  '/room/:roomId',
  auth('administrator'),
  permission(permissions.hostel.hostelRoom.view),
  HostelConfigurationController.getHostelRoomById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelConfiguration.edit),
  validation(HostelConfigurationValidation.updateHostelConfigurationValidation),
  HostelConfigurationController.updateHostelConfiguration,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelConfiguration.delete),
  HostelConfigurationController.deleteHostelConfiguration,
);

export const HostelConfigurationRoutes = router;
