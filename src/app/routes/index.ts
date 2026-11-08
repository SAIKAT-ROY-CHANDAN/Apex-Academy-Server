import { Router } from 'express';
import { TModuleRoute } from '../types/moduleRoute.type';
import { AdminAuthRoutes } from '../modules/adminAuth/adminAuth.routes';
import { RoleRoute } from '../modules/role/role.routes';
import { AcademicClassRoutes } from '../modules/academicClass/academicclass.routes';
import { AcademicClassSubjectRoutes } from '../modules/academicClassSubject/academicClassSubject.routes';
import { FeeTypeRoutes } from '../modules/feeType/feeType.routes';
import { FeeItemRoutes } from '../modules/feeItem/feeItem.routes';
import { StudentRoutes } from '../modules/student/student.routes';
import { StudentEnrollmentRoutes } from '../modules/studentEnrollment/studentEnrollment.routes';
import { StudentPromotionRoutes } from '../modules/student-promotion/student-promotion.routes';
import { StudentFeeRoutes } from '../modules/studentFee/studentFee.routes';
import {
  StudentFeeCollectionItemEditRoutes,
  StudentFeeCollectionItemRoutes,
} from '../modules/studentFeeCollectionItem/studentFeeCollectionItem.routes';
import { StudentFeeCollectionRoutes } from '../modules/studentFeecollection/studentFeeCollection.routes';
import { IDCardGenerateLogRoutes } from '../modules/idCardGenerateLog/idCardGenerateLog.routes';
import { ProgramRoutes } from '../modules/program/program.routes';
import { DepartmentRoutes } from '../modules/department/department.routes';
import { BatchRoutes } from '../modules/batch/batch.routes';
import { ShiftRoutes } from '../modules/shift/shift.routes';
import { TeacherRoutes } from '../modules/teacher/teacher.routes';
import { StaffRoutes } from '../modules/staff/staff.routes';
import { StaffAttendanceRoutes } from '../modules/staffAttendance/staffAttendance.routes';
import { StaffLeaveRoutes } from '../modules/staffLeave/staffLeave.routes';
import { OvertimeStaffConfigRoutes } from '../modules/overtimeStaffConfig/overtimeStaffConfig.routes';
import { StaffOvertimeRoutes } from '../modules/staffOvertime/staffOvertime.routes';
import { StaffResignationRoutes } from '../modules/staffResignation/staffResignation.routes';
import { StaffPayrollRoutes } from '../modules/staffPayroll/staffPayroll.routes';
import { HolidayRoutes } from '../modules/holiday/holiday.routes';
import { AcademicSessionRoutes } from '../modules/accademicSession/accademicSession.routes';
import { SubjectRoutes } from '../modules/subject/subject.routes';
import { AcademicSectionRoutes } from '../modules/academicSection/academicSection.routes';
import { OvertimeTeacherConfigRoutes } from '../modules/overtimeTeacherConfig/overtimeTeacherConfig.routes';
import { TeacherAttendanceRoutes } from '../modules/teacherAttendance/teacherAttendance.routes';
import { TeacherOvertimeRoutes } from '../modules/teacherOvertime/teacherOvertime.routes';
import { DesignationRoutes } from '../modules/designation/designation.routes';
import { SalaryAdvanceRoutes } from '../modules/salaryAdvance/salaryAdvance.routes';
import { TeacherPayrollRoutes } from '../modules/teacherPayroll/teacherPayroll.routes';
import { HostelConfigurationRoutes } from '../modules/hostel-configuration/hostel-configuration.routes';
import { HostelAllocationRoutes } from '../modules/hostel-allocation/hostel-allocation.routes';
import { HostelFeeCollectionRoutes } from '../modules/hostel-fee-collection/hostel-fee-collection.routes';
import { HostelExpenseRoutes } from '../modules/hostel-expense/hostel-expense.routes';
import { TeacherLeaveRequestRoutes } from '../modules/teacherLeaveRequest/teacherLeaveRequest.routes';
import { AdmitCardLogRoutes } from '../modules/admitCardLog/admitCardLog.routes';
import { ClassRoutineRoutes } from '../modules/classRoutine/classRoutine.routes';
import { PeriodSettingRoutes } from '../modules/periodSetting/periodSetting.routes';
import { StudentExamResultRoutes } from '../modules/studentExamResult/studentExamResult.routes';
import { ExamScheduleRoutes } from '../modules/examSchedule/examSchedule.routes';
import { ExamConfigRoutes } from '../modules/examConfig/examConfig.routes';
import { GradeSystemRoutes } from '../modules/gradeSystem/gradeSystem.routes';
import { GradeRoutes } from '../modules/grade/grade.routes';
import { DepositRoutes } from '../modules/deposit/deposit.routes';
import { DepositTypeRoutes } from '../modules/depositType/depositType.routes';
import { ExpenseRoutes } from '../modules/expense/expense.routes';
import { ExpenseTypeRoutes } from '../modules/expenseType/expenseType.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { HomeworkRoutes } from '../modules/homework/homework.routes';
import { StudentAttendanceRoutes } from '../modules/studentAttendance/studentAttendance.routes';
import { TeacherResignationRoutes } from '../modules/teacherResignation/teacherResignation.routes';
import { InstitutionInvoiceSettingRoutes } from '../modules/institutionInvoiceSetting/institutionInvoiceSetting.routes';
import { ReportRoutes } from '../modules/report/report.routes';
import { HostelDashboardSummaryRoutes } from '../modules/hostelDashboardSummary/hostelDashboardSummary.routes';
import { StudentLeaveRequestRoutes } from '../modules/studentLeaveRequest/studentLeaveRequest.routes';
import { WebsiteHeroSectionRoutes } from '../modules/websiteHeroSection/websiteHeroSection.routes';
import { WebsiteCollegeAtGlanceRoutes } from '../modules/websiteCollegeAtGlance/websiteCollegeAtGlance.routes';
import { WebsiteHistoricalOutlineRoutes } from '../modules/websiteHistoricalOutline/websiteHistoricalOutline.routes';
import { WebsiteVisionMissionRoutes } from '../modules/websiteVisionMission/websiteVisionMission.routes';
import { WebsiteChairmanMessageRoutes } from '../modules/websiteChairmanMessage/websiteChairmanMessage.routes';
import { WebsitePrincipalMessageRoutes } from '../modules/websitePrincipalMessage/websitePrincipalMessage.routes';
import { WebsiteGoverningBodyRoutes } from '../modules/websiteGoverningBody/websiteGoverningBody.routes';
import { WebsiteHeadOfDepartmentRoutes } from '../modules/websiteHeadOfDepartment/websiteHeadOfDepartment.routes';
import { WebsiteJobCircularRoutes } from '../modules/websiteJobCircular/websiteJobCircular.routes';
import { JobApplicationRoutes } from '../modules/jobApplication/jobApplication.routes';
import { WebsiteCurriculumRoutes } from '../modules/websiteCurriculum/websiteCurriculum.routes';
import { WebsiteDepartmentRoutes } from '../modules/websiteDepartment/websiteDepartment.routes';
import { AcademicNoticeRoutes } from '../modules/academicNotice/academicNotice.routes';
import { AcademicSyllabusRoutes } from '../modules/academicSyllabus/academicSyllabus.routes';
import { AcademicTuitionRoutes } from '../modules/academicTuition/academicTuition.routes';
import { AcademicFacilitiesRoutes } from '../modules/academicFacilities/academicFacilities.routes';
import { WebsiteGalleryImageRoutes } from '../modules/websiteGalleryImage/websiteGalleryImage.routes';
import { WebsiteCtaBannerRoutes } from '../modules/websiteCtaBanner/websiteCtaBanner.routes';
import { WebsiteFaqSectionRoutes } from '../modules/websiteFaqSection/websiteFaqSection.routes';
import { WebsiteFaqRoutes } from '../modules/websiteFaq/websiteFaq.routes';
import { WebsiteContactUsRoutes } from '../modules/websiteContactUs/websiteContactUs.routes';
import { WebsiteFooterBrandingRoutes } from '../modules/websiteFooterBranding/websiteFooterBranding.routes';
import { WebsiteCareerDevelopmentProgrammeRoutes } from '../modules/websiteCareerDevelopmentProgramme/websiteCareerDevelopmentProgramme.routes';
import { WebsiteCareerDevelopmentApplicationRoutes } from '../modules/websiteCareerDevelopmentApplication/websiteCareerDevelopmentApplication.routes';
import { CareerDevelopmentsRoutes } from '../modules/careerDevelopments/careerDevelopments.routes';
import { AdmissionProgramRoutes } from '../modules/admissionProgram/admissionProgram.routes';
import {
  AcademicProgramMediaRoutes,
  WebsiteSectionMediaRoutes,
} from '../modules/academicProgramMedia/academicProgramMedia.routes';
import { WebsitePageCoverRoutes } from '../modules/websitePageCover/websitePageCover.routes';
import { WebsitePrincipalRoutes } from '../modules/websitePrincipal/websitePrincipal.routes';
import { DueFeeRoutes } from '../modules/dueFee/dueFee.routes';
import { BulkSmsRoutes } from '../modules/bulkSms/bulkSms.routes';

const router = Router();

const moduleRoutes: TModuleRoute[] = [
  {
    path: '/admin-auth',
    route: AdminAuthRoutes,
  },
  {
    path: '/role',
    route: RoleRoute,
  },
  {
    path: '/designation',
    route: DesignationRoutes,
  },
  {
    path: '/academic-class',
    route: AcademicClassRoutes,
  },
  {
    path: '/subject',
    route: SubjectRoutes,
  },
  {
    path: '/academic-section',
    route: AcademicSectionRoutes,
  },
  {
    path: '/academic-session',
    route: AcademicSessionRoutes,
  },
  {
    path: '/academic-class-subject',
    route: AcademicClassSubjectRoutes,
  },
  {
    path: '/fee-type',
    route: FeeTypeRoutes,
  },
  {
    path: '/fee-item',
    route: FeeItemRoutes,
  },
  {
    path: '/student',
    route: StudentRoutes,
  },
  {
    path: '/student-enrollment',
    route: StudentEnrollmentRoutes,
  },
  {
    path: '/student-promotion',
    route: StudentPromotionRoutes,
  },
  {
    path: '/student-fee',
    route: StudentFeeRoutes,
  },
  {
    path: '/due-fee',
    route: DueFeeRoutes,
  },
  {
    path: '/student-fee-collection-item',
    route: StudentFeeCollectionItemRoutes,
  },
  {
    path: '/student-fee-collection-item-edit',
    route: StudentFeeCollectionItemEditRoutes,
  },
  {
    path: '/student-fee-collection',
    route: StudentFeeCollectionRoutes,
  },
  {
    path: '/id-card-generate-log',
    route: IDCardGenerateLogRoutes,
  },
  {
    path: '/program',
    route: ProgramRoutes,
  },
  {
    path: '/department',
    route: DepartmentRoutes,
  },
  {
    path: '/batch',
    route: BatchRoutes,
  },
  {
    path: '/shift',
    route: ShiftRoutes,
  },
  {
    path: '/teacher',
    route: TeacherRoutes,
  },
  {
    path: '/teacher-resignation',
    route: TeacherResignationRoutes,
  },
  {
    path: '/teacher-attendance',
    route: TeacherAttendanceRoutes,
  },
  {
    path: '/teacher-overtime',
    route: TeacherOvertimeRoutes,
  },
  {
    path: '/overtime-teacher-config',
    route: OvertimeTeacherConfigRoutes,
  },
  {
    path: '/teacher-leave-request',
    route: TeacherLeaveRequestRoutes,
  },
  {
    path: '/staff',
    route: StaffRoutes,
  },
  {
    path: '/teacher-overtime',
    route: TeacherOvertimeRoutes,
  },
  {
    path: '/salary-advance',
    route: SalaryAdvanceRoutes,
  },
  {
    path: '/teacher-payroll',
    route: TeacherPayrollRoutes,
  },
  {
    path: '/staff-attendance',
    route: StaffAttendanceRoutes,
  },
  {
    path: '/staff-leave',
    route: StaffLeaveRoutes,
  },
  {
    path: '/overtime-staff-config',
    route: OvertimeStaffConfigRoutes,
  },
  {
    path: '/overtime-teacher-config',
    route: OvertimeTeacherConfigRoutes,
  },
  {
    path: '/staff-overtime',
    route: StaffOvertimeRoutes,
  },
  {
    path: '/staff-resignation',
    route: StaffResignationRoutes,
  },
  // Dev 3 - Finance Routes
  {
    path: '/expense-type',
    route: ExpenseTypeRoutes,
  },
  {
    path: '/expense',
    route: ExpenseRoutes,
  },
  {
    path: '/deposit-type',
    route: DepositTypeRoutes,
  },
  {
    path: '/deposit',
    route: DepositRoutes,
  },
  {
    path: '/grade-system',
    route: GradeSystemRoutes,
  },
  {
    path: '/grade',
    route: GradeRoutes,
  },
  // Dev 3 - Exam & Routine Routes
  {
    path: '/exam-config',
    route: ExamConfigRoutes,
  },
  {
    path: '/exam-schedule',
    route: ExamScheduleRoutes,
  },
  {
    path: '/student-exam-result',
    route: StudentExamResultRoutes,
  },
  {
    path: '/class-routine',
    route: ClassRoutineRoutes,
  },
  {
    path: '/period-setting',
    route: PeriodSettingRoutes,
  },
  {
    path: '/admit-card-log',
    route: AdmitCardLogRoutes,
  },
  {
    path: '/staff-payroll',
    route: StaffPayrollRoutes,
  },
  {
    path: '/hostel-configuration',
    route: HostelConfigurationRoutes,
  },
  {
    path: '/hostel-allocation',
    route: HostelAllocationRoutes,
  },
  {
    path: '/hostel-fee-collection',
    route: HostelFeeCollectionRoutes,
  },
  {
    path: '/hostel-expense',
    route: HostelExpenseRoutes,
    // Dev 3 - Finance Routes
  },
  {
    path: '/expense-type',
    route: ExpenseTypeRoutes,
  },
  {
    path: '/expense',
    route: ExpenseRoutes,
  },
  {
    path: '/deposit-type',
    route: DepositTypeRoutes,
  },
  {
    path: '/deposit',
    route: DepositRoutes,
  },
  {
    path: '/grade-system',
    route: GradeSystemRoutes,
  },
  {
    path: '/grade',
    route: GradeRoutes,
  },
  // Dev 3 - Exam & Routine Routes
  {
    path: '/exam-config',
    route: ExamConfigRoutes,
  },
  {
    path: '/exam-schedule',
    route: ExamScheduleRoutes,
  },
  {
    path: '/student-exam-result',
    route: StudentExamResultRoutes,
  },
  {
    path: '/class-routine',
    route: ClassRoutineRoutes,
  },
  {
    path: '/admit-card-log',
    route: AdmitCardLogRoutes,
  },
  {
    path: '/holiday',
    route: HolidayRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/homework',
    route: HomeworkRoutes,
  },
  {
    path: '/student-attendance',
    route: StudentAttendanceRoutes,
  },
  {
    path: '/institution-invoice-setting',
    route: InstitutionInvoiceSettingRoutes,
  },
  {
    path: '/report',
    route: ReportRoutes,
  },
  {
    path: '/hostel-dashboard-summary',
    route: HostelDashboardSummaryRoutes,
  },
  {
    path: '/student-leave-request',
    route: StudentLeaveRequestRoutes,
  },
  {
    path: '/website-hero-section',
    route: WebsiteHeroSectionRoutes,
  },
  {
    path: '/website-college-at-glance',
    route: WebsiteCollegeAtGlanceRoutes,
  },
  {
    path: '/website-historical-outline',
    route: WebsiteHistoricalOutlineRoutes,
  },
  {
    path: '/website-vision-mission',
    route: WebsiteVisionMissionRoutes,
  },
  {
    path: '/website-chairman-message',
    route: WebsiteChairmanMessageRoutes,
  },
  {
    path: '/website-principal-message',
    route: WebsitePrincipalMessageRoutes,
  },
  {
    path: '/website-governing-body',
    route: WebsiteGoverningBodyRoutes,
  },
  {
    path: '/website-head-of-department',
    route: WebsiteHeadOfDepartmentRoutes,
  },
  {
    path: '/website-department',
    route: WebsiteDepartmentRoutes,
  },
  {
    path: '/website-job-circular',
    route: WebsiteJobCircularRoutes,
  },
  {
    path: '/job-application',
    route: JobApplicationRoutes,
  },
  {
    path: '/website-curriculum',
    route: WebsiteCurriculumRoutes,
  },
  {
    path: '/academic-notice',
    route: AcademicNoticeRoutes,
  },
  {
    path: '/academic-syllabus',
    route: AcademicSyllabusRoutes,
  },
  {
    path: '/academic-tuition',
    route: AcademicTuitionRoutes,
  },
  {
    path: '/academic-facilities',
    route: AcademicFacilitiesRoutes,
  },
  {
    path: '/website-gallery-image',
    route: WebsiteGalleryImageRoutes,
  },
  {
    path: '/website-cta-banner',
    route: WebsiteCtaBannerRoutes,
  },
  {
    path: '/website-faq-section',
    route: WebsiteFaqSectionRoutes,
  },
  {
    path: '/website-faq',
    route: WebsiteFaqRoutes,
  },
  {
    path: '/website-contact-us',
    route: WebsiteContactUsRoutes,
  },
  {
    path: '/website-footer-branding',
    route: WebsiteFooterBrandingRoutes,
  },
  {
    path: '/website-career-development-programme',
    route: WebsiteCareerDevelopmentProgrammeRoutes,
  },
  {
    path: '/website-career-development-application',
    route: WebsiteCareerDevelopmentApplicationRoutes,
  },
  {
    path: '/career-developments',
    route: CareerDevelopmentsRoutes,
  },
  {
    path: '/admission-program',
    route: AdmissionProgramRoutes,
  },
  {
    path: '/website-settings/page-cover',
    route: WebsitePageCoverRoutes,
  },
  {
    path: '/website-settings/principals',
    route: WebsitePrincipalRoutes,
  },
  {
    path: '/academic-programs/media',
    route: AcademicProgramMediaRoutes,
  },
  {
    path: '/website-settings/media',
    route: WebsiteSectionMediaRoutes,
  },
  {
    path: '/bulk-sms',
    route: BulkSmsRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
