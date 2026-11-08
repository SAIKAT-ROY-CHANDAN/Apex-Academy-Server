import type { Religion, TeacherType } from '../../../../generated/prisma/enums';

export interface DashboardQuery {
  startDate?: string;
  endDate?: string;
  filter?: string | Record<string, any>;
}

export interface ReligionCount {
  religion: Religion | null;
  count: number;
}

export interface ClassWiseCount {
  classId: string;
  className: string;
  count: number;
}

export interface TeacherTypeCount {
  teacherType: TeacherType;
  count: number;
}

export interface SubjectWiseCount {
  subjectId: string | null;
  subjectName: string | null;
  count: number;
}

export interface AttendanceOverview {
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

export interface LeaveOverview {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface DashboardOverview {
  summary: {
    totalStudents: number;
    totalTeachers: number;
    totalStaff: number;
    totalStudentLeaves: number;
    totalTeacherLeaves: number;
    totalStaffLeaves: number;
  };
  students: {
    gender: Record<string, number>;
    religion: ReligionCount[];
    classWise: ClassWiseCount[];
  };
  teachers: {
    gender: Record<string, number>;
    typeWise: TeacherTypeCount[];
    subjectWise: SubjectWiseCount[];
  };
  staff: {
    gender: Record<string, number>;
  };
  attendance: {
    students: AttendanceOverview;
    teachers: AttendanceOverview;
    staff: AttendanceOverview;
  };
  leaves: {
    students: LeaveOverview;
    teachers: LeaveOverview;
    staff: LeaveOverview;
  };
}