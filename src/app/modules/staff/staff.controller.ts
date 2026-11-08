import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl, getSinglePdfUrl } from '../../utils/getUrl';
import { StaffService } from './staff.service';

const createStaff = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const photo = files?.photo?.[0]
    ? getSingleImageUrl(req, files.photo[0])
    : null;
  const nidFront = files?.nid_front?.[0]
    ? getSingleImageUrl(req, files.nid_front[0])
    : null;
  const nidBack = files?.nid_back?.[0]
    ? getSingleImageUrl(req, files.nid_back[0])
    : null;
  const academicDocument = files?.academic_document?.[0]
    ? getSinglePdfUrl(req, files.academic_document[0])
    : null;
  const previousInstitutionResignLetter = files
    ?.previous_institution_resign_letter?.[0]
    ? getSinglePdfUrl(req, files.previous_institution_resign_letter[0])
    : null;

  if (photo) req.body.photo = photo;
  if (nidFront) req.body.nid_front = nidFront;
  if (nidBack) req.body.nid_back = nidBack;
  if (academicDocument) req.body.academic_document = academicDocument;
  if (previousInstitutionResignLetter)
    req.body.previous_institution_resign_letter =
      previousInstitutionResignLetter;

  const response = await StaffService.createStaffIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Staff created successfully',
    data: response,
  });
});

const getAllStaff = catchAsync(async (req, res) => {
  const { meta, data } = await StaffService.getAllStaffFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff retrieved successfully',
    meta,
    data,
  });
});

const getStaffById = catchAsync(async (req, res) => {
  const response = await StaffService.getStaffByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff retrieved successfully',
    data: response,
  });
});

const updateStaffById = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const photo = files?.photo?.[0]
    ? getSingleImageUrl(req, files.photo[0])
    : null;
  const nidFront = files?.nid_front?.[0]
    ? getSingleImageUrl(req, files.nid_front[0])
    : null;
  const nidBack = files?.nid_back?.[0]
    ? getSingleImageUrl(req, files.nid_back[0])
    : null;
  const academicDocument = files?.academic_document?.[0]
    ? getSinglePdfUrl(req, files.academic_document[0])
    : null;
  const previousInstitutionResignLetter = files
    ?.previous_institution_resign_letter?.[0]
    ? getSinglePdfUrl(req, files.previous_institution_resign_letter[0])
    : null;

  if (photo) req.body.photo = photo;
  if (nidFront) req.body.nid_front = nidFront;
  if (nidBack) req.body.nid_back = nidBack;
  if (academicDocument) req.body.academic_document = academicDocument;
  if (previousInstitutionResignLetter)
    req.body.previous_institution_resign_letter =
      previousInstitutionResignLetter;

  const response = await StaffService.updateStaffByIdIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff updated successfully',
    data: response,
  });
});

const deleteStaffById = catchAsync(async (req, res) => {
  const response = await StaffService.deleteStaffByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff deleted successfully',
    data: response,
  });
});

export const StaffController = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaffById,
  deleteStaffById,
};
