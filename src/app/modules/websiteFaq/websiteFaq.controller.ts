import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WebsiteFaqService } from './websiteFaq.service';

const createWebsiteFaq = catchAsync(async (req, res) => {
  const response = await WebsiteFaqService.createWebsiteFaqIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'FAQ created successfully',
    data: response,
  });
});

const createManyWebsiteFaqs = catchAsync(async (req, res) => {
  const { items } = req.body as { items: { question: string; answer: string }[] };

  const response = await WebsiteFaqService.createManyWebsiteFaqIntoDB(items);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'FAQs created successfully',
    data: response,
  });
});

const getAllWebsiteFaqs = catchAsync(async (req, res) => {
  const response = await WebsiteFaqService.getAllWebsiteFaqsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'FAQs retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getWebsiteFaqById = catchAsync(async (req, res) => {
  const response = await WebsiteFaqService.getWebsiteFaqByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'FAQ retrieved successfully',
    data: response,
  });
});

const updateWebsiteFaq = catchAsync(async (req, res) => {
  const response = await WebsiteFaqService.updateWebsiteFaqFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'FAQ updated successfully',
    data: response,
  });
});

const deleteWebsiteFaq = catchAsync(async (req, res) => {
  await WebsiteFaqService.deleteWebsiteFaqFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'FAQ deleted successfully',
  });
});

export const WebsiteFaqController = {
  createWebsiteFaq,
  createManyWebsiteFaqs,
  getAllWebsiteFaqs,
  getWebsiteFaqById,
  updateWebsiteFaq,
  deleteWebsiteFaq,
};
