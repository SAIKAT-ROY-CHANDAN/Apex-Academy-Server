import prisma from '../../../db/db.config';
import { calculatePaginationMeta } from '../../builders/prismaBuilderQuery';

interface DueFeeQueryParams {
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
  export?: string;
  filter?: string;
  orderBy?: string;
}

const buildDueFeeWhere = (query: DueFeeQueryParams) => {
  const where: any = {
    due_amount: { gt: 0 },
  };

  // Date range filter on StudentFee.created_at (due-date range)
  if (query.fromDate || query.toDate) {
    where.created_at = {};
    if (query.fromDate) {
      const from = new Date(query.fromDate);
      if (!isNaN(from.getTime())) where.created_at.gte = from;
    }
    if (query.toDate) {
      const to = new Date(query.toDate);
      if (!isNaN(to.getTime())) {
        // include entire day
        to.setHours(23, 59, 59, 999);
        where.created_at.lte = to;
      }
    }
  }

  // Also support legacy filter JSON handling (if frontend sends filter JSON)
  let parsedFilter: Record<string, any> = {};
  if (query.filter && typeof query.filter === 'string') {
    try {
      parsedFilter = JSON.parse(query.filter);
    } catch {
      parsedFilter = {};
    }
  } else if (query.filter && typeof query.filter === 'object') {
    parsedFilter = query.filter as Record<string, any>;
  }

  // Merge direct query + parsed filter (direct takes precedence)
  const classId = query.classId || parsedFilter.classId || parsedFilter.class_id;
  const departmentId = query.departmentId || parsedFilter.departmentId || parsedFilter.department_id;
  const batchId = query.batchId || parsedFilter.batchId || parsedFilter.batch_id;
  const year = query.year || parsedFilter.year;
  const section = query.section || parsedFilter.section || parsedFilter.sectionId;

  // Build nested StudentEnrollment filters
  const enrollmentWhere: any = {};

  if (classId) {
    enrollmentWhere.academic_class_id = classId;
  }
  if (batchId) {
    enrollmentWhere.batch_id = batchId;
  }
  if (section) {
    enrollmentWhere.academic_section_id = section;
  }

  // Department and year filter via academicClass
  const academicClassWhere: any = {};
  if (departmentId) {
    academicClassWhere.department_id = departmentId;
  }
  if (year) {
    // year may be like "2nd", "2", "Year 2" — extract numeric
    const numericYear = parseInt(String(year).replace(/\D/g, ''), 10);
    if (!isNaN(numericYear)) {
      academicClassWhere.year_level = numericYear;
    } else {
      // fallback: try class_level
      const lvl = parseInt(String(year), 10);
      if (!isNaN(lvl)) academicClassWhere.year_level = lvl;
    }
  }

  if (Object.keys(academicClassWhere).length > 0) {
    enrollmentWhere.academicClass = academicClassWhere;
  }

  if (Object.keys(enrollmentWhere).length > 0) {
    where.studentEnrollment = enrollmentWhere;
  }

  // Department filter when classId not provided but departmentId alone
  // If enrollmentWhere already has academicClass.department_id, that's sufficient.
  // If departmentId but no class filter and we want to ensure enrollment has that department via join
  if (departmentId && !classId && !enrollmentWhere.academicClass) {
    where.studentEnrollment = {
      ...(where.studentEnrollment || {}),
      academicClass: { department_id: departmentId },
    };
  }

  return where;
};

const dueFeeInclude = {
  studentEnrollment: {
    include: {
      student: true,
      academicClass: {
        include: {
          program: true,
          department: true,
        },
      },
      academicSection: true,
      batch: true,
    },
  },
  feeItem: true,
} as const;

const getAllDueFeesFromDB = async (query: DueFeeQueryParams) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const take = limit;

  const where = buildDueFeeWhere(query);

  // Support searchTerm on student name
  const searchTerm = (query.searchTerm || '').trim();
  if (searchTerm) {
    where.studentEnrollment = {
      ...(where.studentEnrollment || {}),
      student: {
        ...(where.studentEnrollment?.student || {}),
        name: { contains: searchTerm },
      },
    };
  }

  const [totalItems, dueFees] = await prisma.$transaction([
    prisma.studentFee.count({ where }),
    prisma.studentFee.findMany({
      skip,
      take,
      where,
      include: dueFeeInclude,
      orderBy: { created_at: 'desc' },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: dueFees,
  };
};

const exportDueFeesFromDB = async (query: DueFeeQueryParams) => {
  const where = buildDueFeeWhere(query);

  const searchTerm = (query.searchTerm || '').trim();
  if (searchTerm) {
    where.studentEnrollment = {
      ...(where.studentEnrollment || {}),
      student: {
        ...(where.studentEnrollment?.student || {}),
        name: { contains: searchTerm },
      },
    };
  }

  const dueFees = await prisma.studentFee.findMany({
    where,
    include: dueFeeInclude,
    orderBy: { created_at: 'desc' },
  });

  return dueFees;
};

export const DueFeeService = {
  getAllDueFeesFromDB,
  exportDueFeesFromDB,
};
