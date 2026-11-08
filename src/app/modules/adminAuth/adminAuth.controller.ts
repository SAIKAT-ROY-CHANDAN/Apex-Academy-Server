import catchAsync from '../../utils/catchAsync';
import { getSingleImageUrl } from '../../utils/getUrl';
import sendResponse from '../../utils/sendResponse';
import { AdminAuthService } from './adminAuth.service';

const adminAuthLogin = catchAsync(async (req, res) => {
  const response = await AdminAuthService.adminAuthLoginIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin logged in successfully',
    data: {
      user: response.user,
      redirect: response.redirect,
    },
    token: {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    },
  });
});

const addInstitutionConfig = catchAsync(async (req, res) => {
  const response = await AdminAuthService.addInstitutionConfig(req.body);


  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Institution configuration added successfully',
    data: response,
  });
});

const updateInstitutionConfig = catchAsync(async (req, res) => {
  const response = await AdminAuthService.updateInstitutionConfig(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Institution configuration updated successfully',
    data: response,
  });
});

const getInstitutionConfig = catchAsync(async (req, res) => {
  const response = await AdminAuthService.getInstitutionConfig();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Institution configuration retrieved successfully',
    data: response,
  });
});

const adminAuthRegister = catchAsync(async (req, res) => {
  const avatarFile = req.file ? getSingleImageUrl(req, req.file) : null;
  if (avatarFile) {
    req.body.avatar = avatarFile;
  }

  const response = await AdminAuthService.adminAuthRegisterIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Admin registered successfully',
    data: response,
  });
});

const getAllAdminUsers = catchAsync(async (req, res) => {
  const response = await AdminAuthService.getAllAdminUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin users retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getAdminUserById = catchAsync(async (req, res) => {
  const response = await AdminAuthService.getAdminUserByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin user retrieved successfully',
    data: response,
  });
});

const updateAdminUser = catchAsync(async (req, res) => {
  const avatarFile = req.file ? getSingleImageUrl(req, req.file) : null;
  if (avatarFile) {
    req.body.avatar = avatarFile;
  }

  const response = await AdminAuthService.updateAdminUserFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin user updated successfully',
    data: response,
  });
});

const deleteAdminUser = catchAsync(async (req, res) => {
  await AdminAuthService.deleteAdminUserFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin user deleted successfully',
  });
});

export const AdminAuthController = {
  adminAuthLogin,
  addInstitutionConfig,
  updateInstitutionConfig,
  getAllAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  adminAuthRegister,
  getInstitutionConfig,
};
