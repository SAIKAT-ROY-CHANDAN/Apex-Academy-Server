import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsitePrincipalService } from './websitePrincipal.service';

const createWebsitePrincipal = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const photo = files?.photo?.[0]
    ? getSingleImageUrl(req, files.photo[0])
    : files?.principal_photo?.[0]
      ? getSingleImageUrl(req, files.principal_photo[0])
      : null;

  if (photo) req.body.photoUrl = photo;

  const response = await WebsitePrincipalService.createWebsitePrincipalIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Principal created successfully',
    data: response,
  });
});

const getAllWebsitePrincipals = catchAsync(async (req, res) => {
  const response = await WebsitePrincipalService.getAllWebsitePrincipalsFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Principals retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getWebsitePrincipalById = catchAsync(async (req, res) => {
  const response = await WebsitePrincipalService.getWebsitePrincipalByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Principal retrieved successfully',
    data: response,
  });
});

const updateWebsitePrincipal = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const photo = files?.photo?.[0]
    ? getSingleImageUrl(req, files.photo[0])
    : files?.principal_photo?.[0]
      ? getSingleImageUrl(req, files.principal_photo[0])
      : null;

  if (photo) {
    req.body.photoUrl = photo;
  } else if (req.body.removeImage === 'true' || req.body.removePhoto === 'true') {
    req.body.photoUrl = null;
  }

  delete req.body.removeImage;
  delete req.body.removePhoto;

  const response = await WebsitePrincipalService.updateWebsitePrincipalFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Principal updated successfully',
    data: response,
  });
});

const deleteWebsitePrincipal = catchAsync(async (req, res) => {
  await WebsitePrincipalService.deleteWebsitePrincipalFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Principal deleted successfully',
  });
});

export const WebsitePrincipalController = {
  createWebsitePrincipal,
  getAllWebsitePrincipals,
  getWebsitePrincipalById,
  updateWebsitePrincipal,
  deleteWebsitePrincipal,
};
