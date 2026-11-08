import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IAcademicSectionCreate, IAcademicSectionUpdate } from './academicSection.type';


const createAcademicSectionIntoDB = async (
  payload: IAcademicSectionCreate,
) => {
  const newAcademicSection = await prisma.academicSection.create({
    data: payload,
  });

  return newAcademicSection;
};

const getAllAcademicSectionsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['section_name'],
  });

  const [totalItems, academicSections] = await prisma.$transaction([
    prisma.academicSection.count({ where }),
    prisma.academicSection.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        academicClass: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: academicSections,
  };
};

const getAcademicSectionByIdFromDB = async (academicSectionId: string) => {
  const existingAcademicSection = await prisma.academicSection.findUnique({
    where: {
      id: academicSectionId,
    },
    include: {
      academicClass: true,
    },
  });

  if (!existingAcademicSection) {
    throw new Error('Academic section not found');
  }

  return existingAcademicSection;
};

const updateAcademicSectionFromDB = async (
  academicSectionId: string,
  payload: IAcademicSectionUpdate,
) => {
  const existingAcademicSection = await prisma.academicSection.findUnique({
    where: {
      id: academicSectionId,
    },
  });

  if (!existingAcademicSection) {
    throw new Error('Academic section not found');
  }

  const updatedAcademicSection = await prisma.academicSection.update({
    where: {
      id: academicSectionId,
    },
    data: payload,
  });

  return updatedAcademicSection;
};

const deleteAcademicSectionFromDB = async (academicSectionId: string) => {
  const existingAcademicSection = await prisma.academicSection.findUnique({
    where: {
      id: academicSectionId,
    },
  });

  if (!existingAcademicSection) {
    throw new Error('Academic section not found');
  }

  await prisma.academicSection.delete({
    where: {
      id: academicSectionId,
    },
  });
};

const getFilteredSectionsForExamFromDB = async (query: {
  programId?: string;
  departmentId?: string;
  classId?: string;
  program_id?: string;
  department_id?: string;
  class_id?: string;
  academic_class_id?: string;
}) => {
  const programId = query.programId ?? query.program_id;
  const departmentId = query.departmentId ?? query.department_id;
  const classId = query.classId ?? query.class_id ?? query.academic_class_id;

  if (!programId || !departmentId) {
    throw new Error('programId and departmentId are required');
  }

  const where: Record<string, unknown> = {
    academicClass: {
      program_id: programId,
      department_id: departmentId,
      ...(classId ? { id: classId } : {}),
    },
  };

  const sections = await prisma.academicSection.findMany({
    where: where as never,
    orderBy: { section_name: 'asc' },
    select: { id: true, section_name: true },
  });

  // Distinct by section_name alphabetically, keep first id per name
  const seen = new Set<string>();
  const distinct: Array<{ id: string; name: string }> = [];
  for (const s of sections) {
    const name = (s as { section_name: string }).section_name;
    if (!seen.has(name)) {
      seen.add(name);
      distinct.push({ id: (s as { id: string }).id, name });
    }
  }

  // Already sorted by section_name asc, distinct preserves order
  return distinct;
};

export const AcademicSectionService = {
  createAcademicSectionIntoDB,
  getAllAcademicSectionsFromDB,
  getFilteredSectionsForExamFromDB,
  getAcademicSectionByIdFromDB,
  updateAcademicSectionFromDB,
  deleteAcademicSectionFromDB,
};