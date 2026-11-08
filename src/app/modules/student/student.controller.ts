import catchAsync from '../../utils/catchAsync';
import { getSingleImageUrl } from '../../utils/getUrl';
import sendResponse from '../../utils/sendResponse';
import { StudentService } from './student.service';

const studentLogin = catchAsync(async (req, res) => {
  const response = await StudentService.studentLoginIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student logged in successfully',
    data: {
      user: response.user,
    },
    token: {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    },
  });
});
const createStudent = catchAsync(async (req, res) => {
  const photoFile = req.file ? getSingleImageUrl(req, req.file) : null;
  if (photoFile) {
    req.body.photo = photoFile;
  }

  const response = await StudentService.createStudentIntoDB(req.body);
  const hasNestedRecords = Boolean(
    response.enrollment ||
    response.studentFeeCollection ||
    response.hostelAllocation ||
    response.hostelFeeCollection,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: hasNestedRecords
      ? 'Student and related records created successfully'
      : 'Student created successfully',
    data: response,
  });
});
const registerStudent = catchAsync(async (req, res) => {
  const photoFile = req.file ? getSingleImageUrl(req, req.file) : null;
  if (photoFile) {
    req.body.photo = photoFile;
  }

  await StudentService.registerStudentIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message:
      'Your application has been submitted successfully. It is now pending approval by the administration.',
    data: null,
  });
});

const getPendingStudents = catchAsync(async (req, res) => {
  const response = await StudentService.getPendingStudentsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Pending student registrations retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const approveStudent = catchAsync(async (req, res) => {
  await StudentService.approveStudentIntoDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student application approved successfully',
    data: null,
  });
});

const rejectStudent = catchAsync(async (req, res) => {
  await StudentService.rejectStudentIntoDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student application rejected successfully',
    data: null,
  });
});
const feeCollection = catchAsync(async (req, res) => {
  const collectedBy = req.user?.name ?? req.user?.id ?? 'unknown';
  const response = await StudentService.feeCollectionIntoDB(
    req.body,
    collectedBy,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student fee collection created successfully',
    data: response,
  });
});

const getAllStudents = catchAsync(async (req, res) => {
  const response = await StudentService.getAllStudentsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Students retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getStudentsByClassIdAndSectionId = catchAsync(async (req, res) => {
  const { academic_class_id, academic_section_id } = req.query;
  const response = await StudentService.getStudentsByClassIdAndSectionIdFromDB({
    academic_class_id: academic_class_id as string,
    ...(academic_section_id
      ? { academic_section_id: academic_section_id as string }
      : null),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Students retrieved successfully',
    data: response,
  });
});

const sendClassMessage = catchAsync(async (req, res) => {
  const response = await StudentService.sendClassMessageIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Message sent to class students successfully',
    data: response,
  });
});

const selfStudentFeeCollection = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const response = await StudentService.selfStudentFeeCollectionIntoDB(
    studentId,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student fee collection created successfully',
    data: response,
  });
});
const selfStudentDueFeeCollection = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const response = await StudentService.selfStudentDueFeeCollectionIntoDB(
    studentId,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student fee collection successfully',
    data: response,
  });
});

const getStudentDueFee = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const response = await StudentService.getStudentDueFeeFromDB(studentId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Students Due Fee retrieved successfully',
    data: response,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const response = await StudentService.getMyProfileFromDB(studentId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student profile retrieved successfully',
    data: response,
  });
});

const adminDuePayment = catchAsync(async (req, res) => {
  const adminId = req.user?.name ?? req.user?.id ?? 'unknown';
  const response = await StudentService.adminDuePaymentIntoDB(
    adminId,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment recorded successfully',
    data: response,
  });
});

const initiateStudentBkashPayment = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const response = await StudentService.initiateStudentBkashPayment(studentId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'bKash payment initiated successfully',
    data: response,
  });
});

const executeStudentBkashPayment = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const { paymentID } = req.body;
  const response = await StudentService.executeStudentBkashPayment(
    paymentID,
    studentId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee paid successfully via bKash',
    data: response,
  });
});

const searchStudents = catchAsync(async (req, res) => {
  const response = await StudentService.searchStudentsFromDB(
    req.query.query as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Students retrieved successfully',
    data: response,
  });
});

const getStudentById = catchAsync(async (req, res) => {
  const response = await StudentService.getStudentByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student retrieved successfully',
    data: response,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const photoFile = req.file ? getSingleImageUrl(req, req.file) : null;
  if (photoFile) {
    req.body.photo = photoFile;
  }

  const response = await StudentService.updateStudentFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student updated successfully',
    data: response,
  });
});

const deleteStudent = catchAsync(async (req, res) => {
  await StudentService.deleteStudentFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student deleted successfully',
  });
});

export const StudentController = {
  createStudent,
  registerStudent,
  getPendingStudents,
  approveStudent,
  rejectStudent,
  getAllStudents,
  searchStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  studentLogin,
  feeCollection,
  getStudentDueFee,
  getMyProfile,
  adminDuePayment,
  selfStudentFeeCollection,
  selfStudentDueFeeCollection,
  getStudentsByClassIdAndSectionId,
  sendClassMessage,
  initiateStudentBkashPayment,
  executeStudentBkashPayment,
};
