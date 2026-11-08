import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentPromotionService } from './student-promotion.service';

const promoteStudent = catchAsync(async (req, res) => {
  const response = await StudentPromotionService.promoteStudentIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student promoted successfully',
    data: response,
  });
});

const promoteManyStudents = catchAsync(async (req, res) => {
  const response = await StudentPromotionService.promoteManyStudentsIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${response.promoted_count} student(s) promoted successfully`,
    data: response,
  });
});

export const StudentPromotionController = {
  promoteStudent,
  promoteManyStudents,
};