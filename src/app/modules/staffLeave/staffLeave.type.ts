import type {
  LeaveStatus,
  LeaveType,
} from '../../../../generated/prisma/enums';

export type CreateStaffLeaveInput = {
  staff_id: string;
  leave_start_date: string;
  leave_end_date: string;
  leave_type: LeaveType;
  leave_application: string;
  leave_status?: LeaveStatus;
};

export type UpdateStaffLeaveInput = {
  leave_start_date?: string;
  leave_end_date?: string;
  leave_type?: LeaveType;
  leave_application?: string;
  leave_status?: LeaveStatus;
};
