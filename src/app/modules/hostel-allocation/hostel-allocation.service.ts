import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { HostelAllocationStatus } from '../../../../generated/prisma/enums';
import {
  ICreateHostelAllocation,
  IUpdateHostelAllocation,
} from './hostel-allocation.type';

const syncResidentialStatus = async (studentId: string) => {
  const activeAllocationCount = await prisma.hostelAllocation.count({
    where: {
      student_id: studentId,
      status: HostelAllocationStatus.ACTIVE,
    },
  });

  await prisma.student.update({
    where: { id: studentId },
    data: { is_residential: activeAllocationCount > 0 },
  });
};

const createHostelAllocationIntoDB = async (payload: ICreateHostelAllocation) => {
  const existingStudent = await prisma.student.findUnique({
    where: { id: payload.student_id },
  });

  if (!existingStudent) {
    throw new AppError(404, 'Student not found');
  }

  const existingHostelRoom = await prisma.hostelRoom.findUnique({
    where: { id: payload.hostel_room_id },
  });

  if (!existingHostelRoom) {
    throw new AppError(404, 'Hostel room not found');
  }

  const activeAllocation = await prisma.hostelAllocation.findFirst({
    where: {
      student_id: payload.student_id,
      status: HostelAllocationStatus.ACTIVE,
    },
  });

  if (activeAllocation) {
    throw new AppError(
      400,
      'Student already has an active allocation. Use the edit option to relocate them instead.',
    );
  }

  const [result] = await prisma.$transaction([
    prisma.hostelAllocation.create({
      data: {
        student_id: payload.student_id,
        hostel_room_id: payload.hostel_room_id,
        sit: payload.sit ?? null,
        allocated_at: payload.allocated_at
          ? new Date(payload.allocated_at)
          : new Date(),
      },
      include: {
        student: true,
        hostelRoom: true,
      },
    }),
    prisma.student.update({
      where: { id: payload.student_id },
      data: { is_residential: true },
    }),
  ]);

  return result;
};

const getAllHostelAllocationsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, hostelAllocations] = await prisma.$transaction([
    prisma.hostelAllocation.count({ where }),
    prisma.hostelAllocation.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        student: true,
        hostelRoom: {
          include: {
            hostelFloor: {
              include: {
                hostelConfiguration: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: hostelAllocations,
  };
};

const getHostelAllocationByIdFromDB = async (id: string) => {
  const result = await prisma.hostelAllocation.findUniqueOrThrow({
    where: { id },
    include: {
      student: true,
      hostelRoom: {
        include: {
          hostelFloor: {
            include: {
              hostelConfiguration: true,
            },
          },
        },
      },
    },
  });

  return result;
};

/**
 * Updates an allocation. When the ACTIVE allocation's room or sit changes,
 * the current stay is closed (status = RELOCATED, released_at = now) and a
 * new ACTIVE stay is created for the target room/sit, preserving history.
 */
const updateHostelAllocationFromDB = async (
  allocationId: string,
  payload: IUpdateHostelAllocation,
) => {
  const existingAllocation = await prisma.hostelAllocation.findUnique({
    where: { id: allocationId },
  });

  if (!existingAllocation) {
    throw new AppError(404, 'Hostel allocation not found');
  }

  if (existingAllocation.status !== HostelAllocationStatus.ACTIVE) {
    throw new AppError(400, 'Only active allocations can be updated');
  }

  if (payload.student_id && payload.student_id !== existingAllocation.student_id) {
    throw new AppError(
      400,
      'Changing the allocated student is not supported. Remove the allocation and allocate the other student instead.',
    );
  }

  const targetRoomId = payload.hostel_room_id ?? existingAllocation.hostel_room_id;
  const targetSit =
    payload.sit !== undefined ? payload.sit : existingAllocation.sit;
  const roomChanged = targetRoomId !== existingAllocation.hostel_room_id;
  const sitChanged =
    payload.sit !== undefined && payload.sit !== existingAllocation.sit;

  if (payload.hostel_room_id) {
    const existingHostelRoom = await prisma.hostelRoom.findUnique({
      where: { id: targetRoomId },
    });

    if (!existingHostelRoom) {
      throw new AppError(404, 'Hostel room not found');
    }
  }

  if (payload.sit !== undefined) {
    const occupiedSit = await prisma.hostelAllocation.findFirst({
      where: {
        hostel_room_id: targetRoomId,
        sit: payload.sit,
        status: HostelAllocationStatus.ACTIVE,
        id: { not: allocationId },
      },
    });

    if (occupiedSit) {
      throw new AppError(400, 'The selected sit is already occupied');
    }
  }

  if (!roomChanged && !sitChanged) {
    const updatedAllocation = await prisma.hostelAllocation.update({
      where: { id: allocationId },
      data: {
        allocated_at: payload.allocated_at
          ? new Date(payload.allocated_at)
          : existingAllocation.allocated_at,
      },
      include: {
        student: true,
        hostelRoom: true,
      },
    });

    return updatedAllocation;
  }

  const [, newAllocation] = await prisma.$transaction([
    prisma.hostelAllocation.update({
      where: { id: allocationId },
      data: {
        status: HostelAllocationStatus.RELOCATED,
        released_at: new Date(),
      },
    }),
    prisma.hostelAllocation.create({
      data: {
        student_id: existingAllocation.student_id,
        hostel_room_id: targetRoomId,
        sit: targetSit ?? null,
        allocated_at: payload.allocated_at
          ? new Date(payload.allocated_at)
          : new Date(),
      },
      include: {
        student: true,
        hostelRoom: true,
      },
    }),
  ]);

  return newAllocation;
};

/**
 * Checks a student out: closes the ACTIVE stay and frees the seat without
 * deleting history. Toggles is_residential off when no active stays remain.
 */
const checkoutHostelAllocationFromDB = async (allocationId: string) => {
  const existingAllocation = await prisma.hostelAllocation.findUnique({
    where: { id: allocationId },
    include: { student: true },
  });

  if (!existingAllocation) {
    throw new AppError(404, 'Hostel allocation not found');
  }

  if (existingAllocation.status !== HostelAllocationStatus.ACTIVE) {
    throw new AppError(400, 'Allocation is not active');
  }

  const [checkedOutAllocation] = await prisma.$transaction([
    prisma.hostelAllocation.update({
      where: { id: allocationId },
      data: {
        status: HostelAllocationStatus.CHECKED_OUT,
        released_at: new Date(),
      },
    }),
    prisma.student.update({
      where: { id: existingAllocation.student_id },
      data: { is_residential: false },
    }),
  ]);

  return checkedOutAllocation;
};

/**
 * Returns the full stay history (including the active stay) for a student,
 * ordered oldest first.
 */
const getStudentAllocationHistoryFromDB = async (studentId: string) => {
  const existingStudent = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!existingStudent) {
    throw new AppError(404, 'Student not found');
  }

  const allocations = await prisma.hostelAllocation.findMany({
    where: { student_id: studentId },
    orderBy: { created_at: 'asc' },
    include: {
      hostelRoom: {
        include: {
          hostelFloor: {
            include: {
              hostelConfiguration: true,
            },
          },
        },
      },
    },
  });

  return allocations;
};

const deleteHostelAllocationFromDB = async (allocationId: string) => {
  const existingAllocation = await prisma.hostelAllocation.findUnique({
    where: { id: allocationId },
  });

  if (!existingAllocation) {
    throw new AppError(404, 'Hostel allocation not found');
  }

  await prisma.$transaction([
    prisma.hostelAllocation.delete({
      where: { id: allocationId },
    }),
    prisma.student.update({
      where: { id: existingAllocation.student_id },
      data: { is_residential: false },
    }),
  ]);

  await syncResidentialStatus(existingAllocation.student_id);
};

const getAllocatedHostelStudentsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name', 'father_name', 'mother_name', 'email'],
  });

  const hostelWhere = {
    ...where,
    // Only students with at least one ACTIVE hostel allocation.
    hostelAllocations: {
      some: { status: HostelAllocationStatus.ACTIVE },
    },
  };

  const [totalItems, students] = await prisma.$transaction([
    prisma.student.count({ where: hostelWhere }),
    prisma.student.findMany({
      skip,
      take,
      orderBy,
      where: hostelWhere,
      select: {
        id: true,
        name: true,
        studentEnrollments: {
          where: { is_primary: true },
          orderBy: { created_at: 'desc' },
          take: 1, // primary enrollment (promotion-safe)
          select: {
            academicClass: {
              select: {
                class_name: true,
                group: true,
                department: {
                  select: { department_name: true },
                },
              },
            },
            batch: { select: { batch_name: true } },
            academicSection: { select: { section_name: true } },
            academicSession: { select: { session_name: true } },
          },
        },
        hostelAllocations: {
          where: { status: HostelAllocationStatus.ACTIVE },
          orderBy: { created_at: 'desc' },
          take: 1, // current active stay
          select: {
            id: true,
            sit: true,
            allocated_at: true,
            hostelRoom: {
              select: {
                id: true,
                hostel_room_number: true,
                hostelFloor: {
                  select: {
                    id: true,
                    hostel_floor_number: true,
                    hostelConfiguration: {
                      select: {
                        id: true,
                        building_name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const data = students.map((student) => {
    const enrollment = student.studentEnrollments[0];
    const allocation = student.hostelAllocations[0];
    const room = allocation?.hostelRoom;
    const floor = room?.hostelFloor;
    const building = floor?.hostelConfiguration;

    return {
      id: student.id,
      name: student.name,
      allocation_id: allocation?.id ?? null,
      sit: allocation?.sit ?? null,
      allocated_at: allocation?.allocated_at ?? null,
      class_name: enrollment?.academicClass?.class_name ?? null,
      department_name:
        enrollment?.academicClass?.department?.department_name ??
        enrollment?.academicClass?.group ??
        null,
      batch_name: enrollment?.batch?.batch_name ?? null,
      year_name: enrollment?.academicSession?.session_name ?? null,
      section_name: enrollment?.academicSection?.section_name ?? null,
      building_id: building?.id ?? null,
      building_name: building?.building_name ?? null,
      floor_id: floor?.id ?? null,
      floor_number: floor?.hostel_floor_number ?? null,
      room_id: room?.id ?? null,
      hostel_room_number: room?.hostel_room_number ?? null,
    };
  });

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data,
  };
};

export const HostelAllocationService = {
  createHostelAllocationIntoDB,
  getAllHostelAllocationsFromDB,
  getHostelAllocationByIdFromDB,
  updateHostelAllocationFromDB,
  checkoutHostelAllocationFromDB,
  getStudentAllocationHistoryFromDB,
  deleteHostelAllocationFromDB,
  getAllocatedHostelStudentsFromDB,
};