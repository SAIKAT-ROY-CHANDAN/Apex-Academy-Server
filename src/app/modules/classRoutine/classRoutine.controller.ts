import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { classRoutineService } from './classRoutine.service';

const createClassRoutine = catchAsync(async (req, res) => {
  const response = await classRoutineService.createClassRoutineIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Class routine created successfully',
    data: response,
  });
});

const getAllClassRoutines = catchAsync(async (req, res) => {
  const response = await classRoutineService.getAllClassRoutinesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Class routines retrieved successfully',
    data: response,
  });
});

const getClassRoutineById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await classRoutineService.getClassRoutineByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Class routine retrieved successfully',
    data: response,
  });
});

const updateClassRoutine = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await classRoutineService.updateClassRoutineInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Class routine updated successfully',
    data: response,
  });
});

const deleteClassRoutine = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await classRoutineService.deleteClassRoutineFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Class routine deleted successfully',
    data: response,
  });
});

const getMyClassRoutine = catchAsync(async (req: any, res) => {
  const userId = req.user?.id as string;
  const userType = req.user?.userType as string;
  if (!userId) throw new Error('Unauthorized: user id missing');

  // Teacher: filter to only periods assigned to this teacher (each item has teacher_id)
  if (userType === 'teacher') {
    const response = await classRoutineService.getClassRoutineByTeacherIdFromDB(userId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Class routine retrieved successfully',
      data: response,
    });
    return;
  }

  // Student: resolve the student's LIVE (primary) enrollment — the flag the
  // promotion flow maintains — and return the matching Program+Dept+Year+Batch
  // routine. currentClass is returned so the UI can show an explicit empty state
  // ("No routine published yet for 2nd Year") when nothing is published.
  //
  // When `academic_class_id` query param is provided (from the year-filter
  // dropdown), fetch the routine for that specific class instead.
  if (userType === 'student') {
    const academicClassIdOverride = req.query.academic_class_id as string | undefined;
    const { routines, currentClass } =
      await classRoutineService.getClassRoutineByStudentIdFromDB(
        userId,
        academicClassIdOverride,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Class routine retrieved successfully',
      data: routines,
      meta: { currentClass },
    });
    return;
  }

  // Fallback (admin or unknown) — keep previous teacher behavior for safety
  const response = await classRoutineService.getClassRoutineByTeacherIdFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Class routine retrieved successfully',
    data: response,
  });
});

export const classRoutineController = {
  createClassRoutine,
  getAllClassRoutines,
  getClassRoutineById,
  updateClassRoutine,
  deleteClassRoutine,
  getMyClassRoutine,
};