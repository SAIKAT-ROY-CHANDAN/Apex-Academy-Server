import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsitePageCoverService } from './websitePageCover.service';
import { PAGE_COVER_KEYS, PageCoverKey, PageCoverMap } from './websitePageCover.type';

const getAllPageCovers = catchAsync(async (req, res) => {
  const result = await WebsitePageCoverService.getAllPageCoversFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Page covers retrieved successfully',
    data: result,
  });
});

const upsertPageCovers = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const payload: PageCoverMap = {};

  for (const key of PAGE_COVER_KEYS) {
    const file = files?.[key]?.[0];
    if (file) {
      const url = getSingleImageUrl(req, file);
      if (url) {
        payload[key as PageCoverKey] = url;
      }
    }
  }

  if (Object.keys(payload).length === 0) {
    throw new Error('No cover images provided. Please upload at least one image.');
  }

  const result = await WebsitePageCoverService.upsertPageCoversIntoDB(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Page covers saved successfully',
    data: result,
  });
});

const deleteAllPageCovers = catchAsync(async (req, res) => {
  const result = await WebsitePageCoverService.deleteAllPageCoversFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All page covers removed successfully',
    data: result,
  });
});

export const WebsitePageCoverController = {
  getAllPageCovers,
  upsertPageCovers,
  deleteAllPageCovers,
};
