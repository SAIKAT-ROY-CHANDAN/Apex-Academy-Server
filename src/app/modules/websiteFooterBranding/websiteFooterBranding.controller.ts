import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteFooterBrandingService } from './websiteFooterBranding.service';

const createWebsiteFooterBranding = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const footerImage = files?.footer_image?.[0]
    ? getSingleImageUrl(req, files.footer_image[0])
    : null;
  const brandingImage = files?.branding_image?.[0]
    ? getSingleImageUrl(req, files.branding_image[0])
    : null;

  if (footerImage) req.body.footerImage = footerImage;
  if (brandingImage) req.body.brandingImage = brandingImage;

  const response =
    await WebsiteFooterBrandingService.createWebsiteFooterBrandingIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website footer branding created successfully',
    data: response,
  });
});

const getWebsiteFooterBranding = catchAsync(async (req, res) => {
  const response =
    await WebsiteFooterBrandingService.getWebsiteFooterBrandingFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website footer branding retrieved successfully',
    data: response,
  });
});

const getWebsiteFooterBrandingById = catchAsync(async (req, res) => {
  const response =
    await WebsiteFooterBrandingService.getWebsiteFooterBrandingByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website footer branding retrieved successfully',
    data: response,
  });
});

const updateWebsiteFooterBranding = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const footerImage = files?.footer_image?.[0]
    ? getSingleImageUrl(req, files.footer_image[0])
    : null;
  const brandingImage = files?.branding_image?.[0]
    ? getSingleImageUrl(req, files.branding_image[0])
    : null;

  if (footerImage) {
    req.body.footerImage = footerImage;
  } else if (req.body.removeFooterImage === 'true') {
    req.body.footerImage = null;
  }

  if (brandingImage) {
    req.body.brandingImage = brandingImage;
  } else if (req.body.removeBrandingImage === 'true') {
    req.body.brandingImage = null;
  }

  delete req.body.removeFooterImage;
  delete req.body.removeBrandingImage;

  const response =
    await WebsiteFooterBrandingService.updateWebsiteFooterBrandingFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website footer branding updated successfully',
    data: response,
  });
});

const deleteWebsiteFooterBranding = catchAsync(async (req, res) => {
  await WebsiteFooterBrandingService.deleteWebsiteFooterBrandingFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website footer branding deleted successfully',
  });
});

export const WebsiteFooterBrandingController = {
  createWebsiteFooterBranding,
  getWebsiteFooterBranding,
  getWebsiteFooterBrandingById,
  updateWebsiteFooterBranding,
  deleteWebsiteFooterBranding,
};