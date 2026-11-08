/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IAssignRoomsToFloor,
  IUpdateHostelConfiguration,
} from './hostel-configuration.type';

const createHostelConfigurationIntoDB = async (payload: any) => {
  const result = await prisma.hostelConfiguration.create({
    data: {
      building_name: payload.building_name,
      total_floors: payload.total_floors,
      hostelFloors: {
        create: Array.from({ length: payload.total_floors }, (_, i) => ({
          hostel_floor_number: i + 1,
          hostel_total_rooms: 0,
        })),
      },
    },
    include: {
      hostelFloors: true,
    },
  });

  return result;
};

const assignRoomsToFloorIntoDB = async (payload: IAssignRoomsToFloor) => {
  let floor = payload.hostel_floor_id
    ? await prisma.hostelFloor.findUnique({
        where: { id: payload.hostel_floor_id },
        include: { hostelRooms: { select: { id: true } } },
      })
    : null;

  if (!floor) {
    if (!payload.hostel_configuration_id || !payload.floor_number) {
      throw new Error('Hostel floor not found');
    }

    const config = await prisma.hostelConfiguration.findUnique({
      where: { id: payload.hostel_configuration_id },
      include: { hostelFloors: true },
    });

    if (!config) throw new Error('Hostel configuration not found');

    const existingNumber = config.hostelFloors.some(
      (f) => f.hostel_floor_number === payload.floor_number,
    );

    if (existingNumber) {
      throw new Error('Hostel floor not found');
    }

    floor = await prisma.hostelFloor.create({
      data: {
        hostel_configuration_id: payload.hostel_configuration_id,
        hostel_floor_number: payload.floor_number,
        hostel_total_rooms: 0,
      },
      include: { hostelRooms: true },
    });
  }

  if (!floor) {
    throw new Error('Hostel floor not found');
  }

  const incomingIds = payload.rooms
    .map((room) => room.id)
    .filter((id): id is string => !!id);
  const existingIds = floor.hostelRooms.map((room) => room.id);
  const roomsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

  await prisma.$transaction(async (tx) => {
    if (roomsToDelete.length > 0) {
      await tx.hostelRoom.deleteMany({
        where: {
          id: { in: roomsToDelete },
        },
      });
    }

    for (const room of payload.rooms) {
      if (room.id) {
        await tx.hostelRoom.update({
          where: {
            id: room.id,
          },
          data: {
            hostel_room_number: room.hostel_room_number,
            available_sits: room.available_sits,
            hostel_floor_id: floor.id,
          },
        });
      } else {
        await tx.hostelRoom.create({
          data: {
            hostel_room_number: room.hostel_room_number,
            available_sits: room.available_sits,
            hostel_floor_id: floor.id,
          },
        });
      }
    }

    await tx.hostelFloor.update({
      where: {
        id: floor.id,
      },
      data: {
        hostel_total_rooms: payload.rooms.length,
      },
    });
  });

  return {
    hostelFloorId: floor.id,
    totalRooms: payload.rooms.length,
  };
};

const getAllHostelConfigurationsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['building_name'],
  });

  const [totalItems, hostelConfigurations] = await prisma.$transaction([
    prisma.hostelConfiguration.count({ where }),
    prisma.hostelConfiguration.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        hostelFloors: {
          include: {
            hostelRooms: true,
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: hostelConfigurations,
  };
};

const getHostelConfigurationByIdFromDB = async (id: string) => {
  const result = await prisma.hostelConfiguration.findUniqueOrThrow({
    where: { id },
    include: {
      hostelFloors: {
        include: { hostelRooms: true },
        orderBy: { hostel_floor_number: "asc" },
      },
    },
  });

  return {
    ...result,
    hostelFloors: result.hostelFloors.map((floor) => ({
      id: floor.id,
      hostel_configuration_id: floor.hostel_configuration_id,
      floor_number: floor.hostel_floor_number,
      total_rooms: floor.hostel_total_rooms,
      hostelRooms: floor.hostelRooms,
    })),
  };
};

const getHostelFloorByIdFromDB = async (floorId: string) => {
  const existingFloor = await prisma.hostelFloor.findUnique({
    where: {
      id: floorId,
    },
    include: {
      hostelRooms: true,
      hostelConfiguration: true,
    },
  });

  if (!existingFloor) {
    throw new Error('Hostel floor not found');
  }

  return existingFloor;
};

const getHostelRoomByIdFromDB = async (roomId: string) => {
  const existingRoom = await prisma.hostelRoom.findUnique({
    where: {
      id: roomId,
    },
    include: {
      hostelFloor: {
        include: {
          hostelConfiguration: true,
        },
      },
    },
  });

  if (!existingRoom) {
    throw new Error('Hostel room not found');
  }

  return existingRoom;
};

const updateHostelConfigurationFromDB = async (
  hostelConfigId: string,
  payload: IUpdateHostelConfiguration,
) => {
  const existingHostelConfig = await prisma.hostelConfiguration.findUnique({
    where: {
      id: hostelConfigId,
    },
  });

  if (!existingHostelConfig) {
    throw new Error('Hostel configuration not found');
  }

  const updatedHostelConfig = await prisma.hostelConfiguration.update({
    where: {
      id: hostelConfigId,
    },
    data: payload,
  });

  return updatedHostelConfig;
};

const deleteHostelConfigurationFromDB = async (hostelConfigId: string) => {
  const existingHostelConfig = await prisma.hostelConfiguration.findUnique({
    where: {
      id: hostelConfigId,
    },
  });

  if (!existingHostelConfig) {
    throw new Error('Hostel configuration not found');
  }

  await prisma.hostelConfiguration.delete({
    where: {
      id: hostelConfigId,
    },
  });
};

export const HostelConfigurationService = {
  createHostelConfigurationIntoDB,
  assignRoomsToFloorIntoDB,
  getAllHostelConfigurationsFromDB,
  getHostelConfigurationByIdFromDB,
  getHostelFloorByIdFromDB,
  getHostelRoomByIdFromDB,
  updateHostelConfigurationFromDB,
  deleteHostelConfigurationFromDB,
};
