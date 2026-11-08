export interface DueFeeQuery {
  classId?: string;
  departmentId?: string;
  batchId?: string;
  year?: string;
  section?: string;
  fromDate?: string;
  toDate?: string;
  page?: string | number;
  limit?: string | number;
  searchTerm?: string;
}

export interface DueFeeRecord {
  id: string;
  due_amount: number;
  paid_amount: number;
  scholarship_amount: number;
  created_at: Date;
  updated_at: Date;
  studentEnrollment: {
    id: string;
    roll_number: string | null;
    registration_number: string;
    academic_class_id: string;
    academic_section_id: string | null;
    batch_id: string;
    student: {
      id: string;
      name: string;
      photo: string | null;
      father_phone: string;
      student_phone: string | null;
    };
    academicClass: {
      id: string;
      class_name: string;
      year_level: number | null;
      group: string | null;
      program_id: string | null;
      department_id: string | null;
      program: { id: string; program_name: string } | null;
      department: { id: string; department_name: string } | null;
    } | null;
    academicSection: { id: string; section_name: string } | null;
    batch: { id: string; batch_name: string } | null;
  };
  feeItem: { id: string; name: string } | null;
}
