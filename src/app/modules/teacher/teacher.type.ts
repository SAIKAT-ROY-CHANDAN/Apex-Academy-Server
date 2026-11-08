import type {
    Gender,
    AcademicQualification,
    TeacherType,
    AdministrativePosition,
} from '../../../../generated/prisma/enums';

export type CustomSalaryInput = {
    salary_component: string;
    salary_amount: number;
};

export type CreateTeacherInput = {
    full_name: string;
    email?: string;
    phone: string;
    bkash_number?: string;
    address?: string;
    gender: Gender;
    last_qualification: AcademicQualification;
    nid_front?: string;
    nid_back?: string;
    shift_id?: string;
    department_id?: string;
    subject_id?: string;
    teacher_type: TeacherType;
    administrative_position?: AdministrativePosition;
    designation_id: string;
    password: string;
    customSalaries?: CustomSalaryInput[];
    photo?: string;
    academic_document: string;
    previous_institution_resign_letter?: string;
}

export type UpdateTeacherInput = {
    full_name?: string;
    email?: string;
    phone?: string;
    bkash_number?: string;
    address?: string;
    gender?: Gender;
    last_qualification?: AcademicQualification;
    nid_front?: string;
    nid_back?: string;
    shift_id?: string;
    department_id?: string;
    subject_id?: string;
    teacher_type?: TeacherType;
    administrative_position?: AdministrativePosition;
    password?: string;
    designation_id?: string;
    customSalaries?: CustomSalaryInput[];
    photo?: string;
    academic_document?: string;
    previous_institution_resign_letter?: string;
}

export type TeacherPromotionInput = {
    teacher_type: TeacherType;
    designation_id: string;
    shift_id?: string;
}