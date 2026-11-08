import type { AttendanceStatus } from '../../../../generated/prisma/enums';

export type CreateStaffAttendanceInput = {
  staff_id: string;
  attendance_status: AttendanceStatus;
  check_in_time: string;
  check_out_time?: string;
};

export type UpdateStaffAttendanceInput = {
  attendance_status?: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
};

export type TAttendanceStatus = {
  isCheckIn: boolean;
  checkInId?: string;
  isCheckOut: boolean;
};