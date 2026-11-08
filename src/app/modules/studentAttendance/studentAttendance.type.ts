import type {
  AttendanceStatus,
  StudentGroup,
} from '../../../../generated/prisma/enums';

export type CreateStudentAttendanceInput = {
  student_id: string;
  attendance_status: AttendanceStatus;
  teacher_id: string;
  attendance_date: string;
  subject_id?: string;
  group?: StudentGroup;
  academic_class_id?: string;
};

export type UpdateStudentAttendanceInput = {
  student_id?: string;
  attendance_status?: AttendanceStatus;
  attendance_date?: string;
  subject_id?: string;
  group?: StudentGroup;
  academic_class_id?: string;
  teacher_id?: string;
};

export type CreateManyStudentAttendanceInput = CreateStudentAttendanceInput[];

export type CreateManyStudentAttendancePayload = {
  attendances: CreateStudentAttendanceInput[];
};

export type UpdateManyStudentAttendanceInput = {
  id: string;
  attendance_status: AttendanceStatus;
}[];