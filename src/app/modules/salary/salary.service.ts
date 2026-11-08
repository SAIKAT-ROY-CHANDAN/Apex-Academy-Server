import prisma from '../../../db/db.config';

export const calculateTeacherSalary = async (teacherId: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: {
      id: teacherId,
    },
    include: {
      salary: {
        include: {
          customSalaries: true,
        },
      },
    },
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  const customSalary =
    teacher.salary?.customSalaries.reduce(
      (sum, item) => sum + item.salary_amount,
      0,
    ) ?? 0;

  return {
    netSalary: customSalary,
  };
};

export const calculateStaffBaseSalary = async (staffId: string) => {
  const staff = await prisma.staff.findUnique({
    where: {
      id: staffId,
    },
    include: {
      salary: {
        include: {
          customSalaries: true,
        },
      },
    },
  });

  if (!staff) {
    throw new Error('Staff not found');
  }

  const customSalary =
    staff.salary?.customSalaries.reduce(
      (sum, item) => sum + item.salary_amount,
      0,
    ) ?? 0;

  return {
    netSalary: customSalary,
  };
};

export const SalaryService = {
  calculateTeacherSalary,
  calculateStaffBaseSalary,
};
