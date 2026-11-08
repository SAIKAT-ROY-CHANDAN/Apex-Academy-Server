import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BulkSmsService } from './bulkSms.service';
import { ISendBulkSms } from './bulkSms.type';

const sendBulkSms = catchAsync(async (req, res) => {
  const response = await BulkSmsService.sendBulkSms(req.body as ISendBulkSms);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'SMS sent successfully',
    data: response,
  });
});

export const BulkSmsController = {
  sendBulkSms,
};
