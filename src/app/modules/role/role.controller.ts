import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { roleService } from './role.service';

const createRole = catchAsync(async (req, res) => {
  const response = await roleService.createRoleIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Role created successfully',
    data: response,
  });
});

const getAllPermissions = catchAsync(async (req, res) => {
  const userId = req.user?.id as string;
  const response = await roleService.getMyPermissionsFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Permissions retrieved successfully',
    data: response,
  });
});

const getPermissions = catchAsync(async (req, res) => {
  const response = await roleService.getAllPermissionsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All permissions retrieved successfully',
    data: response,
  });
});

const getAllRoles = catchAsync(async (req, res) => {
  const response = await roleService.getAllRolesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All roles retrieved successfully',
    data: response,
  });
});

export const roleController = {
  createRole,
  getAllPermissions,
  getPermissions,
  getAllRoles,
};
