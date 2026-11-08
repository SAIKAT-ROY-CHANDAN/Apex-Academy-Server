import type { LeaveType, LeaveStatus } from '../../../../generated/prisma/enums';

export type CreateStudentLeaveRequestInput = {
  student_id: string;
  leave_type: LeaveType;
  reason: string;
  start_date: string;
  end_date: string;
  status?: LeaveStatus;
};

export type UpdateStudentLeaveRequestInput = {
  leave_type?: LeaveType;
  reason?: string;
  start_date?: string;
  end_date?: string;
  status?: LeaveStatus;
};
