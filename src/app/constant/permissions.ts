const createCrudPermission = <const T extends string>(model: T) =>
  ({
    create: `${model}.create`,
    view: `${model}.view`,
    edit: `${model}.edit`,
    delete: `${model}.delete`,
  }) as const;

const createManagePermission = <const T extends string>(model: T) =>
  ({
    manage: `${model}.manage`,
  }) as const;

const administration = {
  administrator: createCrudPermission('administrator'),
  role: createCrudPermission('role'),
  userRole: createCrudPermission('userRole'),
  permission: createCrudPermission('permission'),
  rolePermission: createCrudPermission('rolePermission'),
} as const;

const settings = {
  institutionConfig: createCrudPermission('institutionConfig'),
  institutionInvoiceSetting: createCrudPermission('institutionInvoiceSetting'),
  holiday: createCrudPermission('holiday'),
  academicNotice: createCrudPermission('academicNotice'),
  academicSyllabus: createCrudPermission('academicSyllabus'),
  academicTuition: createCrudPermission('academicTuition'),
  academicFacilities: createCrudPermission('academicFacilities'),
} as const;

const academics = {
  feeType: createCrudPermission('feeType'),
  feeItem: createCrudPermission('feeItem'),
  shift: createManagePermission('shift'),
  designation: createCrudPermission('designation'),
  designationBasedSalary: createCrudPermission('designationBasedSalary'),
  customSalary: createCrudPermission('customSalary'),
  overtimeTeacherConfig: createCrudPermission('overtimeTeacherConfig'),
  overtimeStaffConfig: createCrudPermission('overtimeStaffConfig'),
  academicSession: createCrudPermission('academicSession'),
  program: createCrudPermission('program'),
  department: createCrudPermission('department'),
  academicClass: createCrudPermission('academicClass'),
  academicSection: createCrudPermission('academicSection'),
  subject: createCrudPermission('subject'),
  academicClassSubject: createCrudPermission('academicClassSubject'),
  batch: createCrudPermission('batch'),
  examConfig: createCrudPermission('examConfig'),
  examSchedule: createCrudPermission('examSchedule'),
  gradeSystem: createCrudPermission('gradeSystem'),
  gradeScale: createCrudPermission('gradeScale'),
  classRoutine: createCrudPermission('classRoutine'),
  classRoutineItem: createCrudPermission('classRoutineItem'),
  homework: createCrudPermission('homework'),
} as const;

const students = {
  student: createCrudPermission('student'),
  studentEnrollment: createCrudPermission('studentEnrollment'),
  studentFee: createCrudPermission('studentFee'),
  studentFeeCollection: createCrudPermission('studentFeeCollection'),
  studentFeeCollectionItem: createCrudPermission('studentFeeCollectionItem'),
  idCardGenerateLog: createCrudPermission('idCardGenerateLog'),
  admitCardLog: createCrudPermission('admitCardLog'),
  studentExamResult: createCrudPermission('studentExamResult'),
  studentAttendance: createCrudPermission('studentAttendance'),
  studentLibraryMember: createCrudPermission('studentLibraryMember'),
  studentLeaveRequest: createCrudPermission('studentLeaveRequest'),
  studentApproval: createManagePermission('studentApproval'),
} as const;

const teachers = {
  teacher: createCrudPermission('teacher'),
  teacherAttendance: createCrudPermission('teacherAttendance'),
  teacherLeaveRequest: createCrudPermission('teacherLeaveRequest'),
  teacherOvertime: createCrudPermission('teacherOvertime'),
  teacherResignation: createCrudPermission('teacherResignation'),
  teacherPayroll: createCrudPermission('teacherPayroll'),
  salaryAdvance: createCrudPermission('salaryAdvance'),
} as const;

const staff = {
  staff: createCrudPermission('staff'),
  staffAttendance: createCrudPermission('staffAttendance'),
  staffLeave: createCrudPermission('staffLeave'),
  staffOvertime: createCrudPermission('staffOvertime'),
  staffResignation: createCrudPermission('staffResignation'),
  staffPayroll: createCrudPermission('staffPayroll'),
} as const;

const finance = {
  payrollCycle: createCrudPermission('payrollCycle'),
  payrollPayment: createCrudPermission('payrollPayment'),
  expenseType: createCrudPermission('expenseType'),
  expense: createCrudPermission('expense'),
  expenseItem: createCrudPermission('expenseItem'),
  depositType: createCrudPermission('depositType'),
  deposit: createCrudPermission('deposit'),
  depositItem: createCrudPermission('depositItem'),
} as const;

const hostel = {
  hostelConfiguration: createCrudPermission('hostelConfiguration'),
  hostelFloor: createCrudPermission('hostelFloor'),
  hostelRoom: createCrudPermission('hostelRoom'),
  hostelAllocation: createCrudPermission('hostelAllocation'),
  hostelFeeCollection: createCrudPermission('hostelFeeCollection'),
  hostelFeeCollectionItem: createCrudPermission('hostelFeeCollectionItem'),
  mealCollection: createCrudPermission('mealCollection'),
  hostelExpense: createCrudPermission('hostelExpense'),
  hostelExpenseItem: createCrudPermission('hostelExpenseItem'),
} as const;

const quarter = {
  quarterConfiguration: createCrudPermission('quarterConfiguration'),
  quarterFloor: createCrudPermission('quarterFloor'),
  quarterFlat: createCrudPermission('quarterFlat'),
  quarterAllocation: createCrudPermission('quarterAllocation'),
  quarterRentCollection: createCrudPermission('quarterRentCollection'),
  quarterExpense: createCrudPermission('quarterExpense'),
  quarterExpenseItem: createCrudPermission('quarterExpenseItem'),
} as const;

const transport = {
  vehicleDriver: createCrudPermission('vehicleDriver'),
  vehicleConfiguration: createCrudPermission('vehicleConfiguration'),
  vehicleChecking: createCrudPermission('vehicleChecking'),
  vehicleExpense: createCrudPermission('vehicleExpense'),
  vehicleExpenseItem: createCrudPermission('vehicleExpenseItem'),
  vehicleVendor: createCrudPermission('vehicleVendor'),
  vendorVehicleConfiguration: createCrudPermission(
    'vendorVehicleConfiguration',
  ),
  vendorVehicleChecking: createCrudPermission('vendorVehicleChecking'),
  vendorVehicleExpense: createCrudPermission('vendorVehicleExpense'),
  vendorVehicleExpenseItem: createCrudPermission('vendorVehicleExpenseItem'),
} as const;

const library = {
  bookShelfConfiguration: createCrudPermission('bookShelfConfiguration'),
  bookCategory: createCrudPermission('bookCategory'),
  book: createCrudPermission('book'),
  membershipFeeCollection: createCrudPermission('membershipFeeCollection'),
  borrowedBook: createCrudPermission('borrowedBook'),
  libraryExpense: createCrudPermission('libraryExpense'),
  libraryExpenseItem: createCrudPermission('libraryExpenseItem'),
  libraryDeposit: createCrudPermission('libraryDeposit'),
} as const;

const complaints = {
  complaint: createCrudPermission('complaint'),
} as const;

const feedback = {
  feedbackForm: createCrudPermission('feedbackForm'),
  feedbackQuestion: createCrudPermission('feedbackQuestion'),
  feedbackResponse: createCrudPermission('feedbackResponse'),
  feedbackAnswer: createCrudPermission('feedbackAnswer'),
} as const;

const communications = {
  bulkSms: createManagePermission('bulkSms'),
} as const;

const website = {
  galleryImage: createCrudPermission('galleryImage'),
  footerBranding: createCrudPermission('footerBranding'),
  careerDevelopments: createCrudPermission('careerDevelopments'),
  admissionProgram: createCrudPermission('admissionProgram'),
  websiteCurriculum: createCrudPermission('websiteCurriculum'),
} as const;

export const permissions = {
  administration,
  settings,
  academics,
  students,
  teachers,
  staff,
  finance,
  hostel,
  quarter,
  transport,
  library,
  complaints,
  feedback,
  communications,
  website,
} as const;

type PermissionValue<T> = T extends string
  ? T
  : T extends readonly unknown[]
    ? PermissionValue<T[number]>
    : T extends object
      ? PermissionValue<T[keyof T]>
      : never;

export type Permission = PermissionValue<typeof permissions>;

const collectPermissions = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectPermissions(item));
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap((item) => collectPermissions(item));
  }

  return [];
};

export const allPermissions = collectPermissions(permissions) as Permission[];
