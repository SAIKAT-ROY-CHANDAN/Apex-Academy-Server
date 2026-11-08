import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteCtaBannerService } from './websiteCtaBanner.service';

const createWebsiteCtaBanner = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.cta_image?.[0]
    ? getSingleImageUrl(req, files.cta_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response =
    await WebsiteCtaBannerService.createWebsiteCtaBannerIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website CTA banner created successfully',
    data: response,
  });
});

const getWebsiteCtaBanner = catchAsync(async (req, res) => {
  const response = await WebsiteCtaBannerService.getWebsiteCtaBannerFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website CTA banner retrieved successfully',
    data: response,
  });
});

const getWebsiteCtaBannerById = catchAsync(async (req, res) => {
  const response =
    await WebsiteCtaBannerService.getWebsiteCtaBannerByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website CTA banner retrieved successfully',
    data: response,
  });
});

const updateWebsiteCtaBanner = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.cta_image?.[0]
    ? getSingleImageUrl(req, files.cta_image[0])
    : null;

  if (image) {
    req.body.imageUrl = image;
  } else if (req.body.removeImage === 'true') {
    req.body.imageUrl = null;
  }

  delete req.body.removeImage;

  const response =
    await WebsiteCtaBannerService.updateWebsiteCtaBannerFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website CTA banner updated successfully',
    data: response,
  });
});

const deleteWebsiteCtaBanner = catchAsync(async (req, res) => {
  await WebsiteCtaBannerService.deleteWebsiteCtaBannerFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website CTA banner deleted successfully',
  });
});

export const WebsiteCtaBannerController = {
  createWebsiteCtaBanner,
  getWebsiteCtaBanner,
  getWebsiteCtaBannerById,
  updateWebsiteCtaBanner,
  deleteWebsiteCtaBanner,
};
