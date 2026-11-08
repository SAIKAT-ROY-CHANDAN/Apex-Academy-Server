import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteGalleryImageService } from './websiteGalleryImage.service';

const createWebsiteGalleryImage = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.gallery_image?.[0]
    ? getSingleImageUrl(req, files.gallery_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  // If uploading an image, ensure no videoUrl is stored
  if (image) {
    req.body.videoUrl = null;
  }

  delete req.body.removeImage;

  const response =
    await WebsiteGalleryImageService.createWebsiteGalleryImageIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Gallery image created successfully',
    data: response,
  });
});

const getAllWebsiteGalleryImages = catchAsync(async (req, res) => {
  const response =
    await WebsiteGalleryImageService.getAllWebsiteGalleryImagesFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gallery images retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getWebsiteGalleryImageById = catchAsync(async (req, res) => {
  const response =
    await WebsiteGalleryImageService.getWebsiteGalleryImageByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gallery image retrieved successfully',
    data: response,
  });
});

const updateWebsiteGalleryImage = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.gallery_image?.[0]
    ? getSingleImageUrl(req, files.gallery_image[0])
    : null;

  const removeImage = req.body.removeImage === 'true';

  if (image) {
    req.body.imageUrl = image;
  } else if (removeImage) {
    req.body.imageUrl = null;
  }

  delete req.body.removeImage;

  // If switching to video mode, clear imageUrl
  if (req.body.videoUrl && !image && !removeImage) {
    req.body.imageUrl = null;
  }

  // If switching to image mode, clear videoUrl
  if (image) {
    req.body.videoUrl = null;
  }

  const response =
    await WebsiteGalleryImageService.updateWebsiteGalleryImageFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gallery image updated successfully',
    data: response,
  });
});

const deleteWebsiteGalleryImage = catchAsync(async (req, res) => {
  await WebsiteGalleryImageService.deleteWebsiteGalleryImageFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Gallery image deleted successfully',
  });
});

export const WebsiteGalleryImageController = {
  createWebsiteGalleryImage,
  getAllWebsiteGalleryImages,
  getWebsiteGalleryImageById,
  updateWebsiteGalleryImage,
  deleteWebsiteGalleryImage,
};
