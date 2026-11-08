import type {
  LeaveType,
  LeaveStatus,
} from '../../../../generated/prisma/enums';

export type CreateTeacherLeaveRequestInput = {
  teacher_id: string;
  leave_start_date: string;
  leave_end_date: string;
  leave_type: LeaveType;
  leave_application: string;
  leave_status?: LeaveStatus;
};

export type UpdateTeacherLeaveRequestInput = {
  leave_start_date?: string;
  leave_end_date?: string;
  leave_type?: LeaveType;
  leave_application?: string;
  leave_status?: LeaveStatus;
};