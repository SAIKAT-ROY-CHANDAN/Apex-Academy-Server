import type { AttendanceStatus } from '../../../../generated/prisma/enums';

export type CreateTeacherAttendanceInput = {
  teacher_id: string;
  attendance_status: AttendanceStatus;
  check_in_time: string;
  check_out_time?: string;
};

export type UpdateTeacherAttendanceInput = {
  attendance_status?: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
};
export type TAttendanceStatus = {
  isCheckIn: boolean;
  checkInId?: string;
  isCheckOut: boolean;
};