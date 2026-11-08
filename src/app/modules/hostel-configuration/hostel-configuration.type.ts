export interface IHostelFloor {
  hostel_floor_number: number;
  hostel_total_rooms: number;
}

export interface ICreateHostelWithFloors {
  building_name: string;
  total_floors: number;
  floors: IHostelFloor[];
}

export interface IRoomAssign {
  id?: string;
  hostel_room_number: string;
  available_sits: number;
}

export interface IAssignRoomsToFloor {
  hostel_floor_id?: string;
  hostel_configuration_id?: string;
  floor_number?: number;
  total_rooms?: number;
  rooms: IRoomAssign[];
}

export interface IUpdateHostelConfiguration {
  building_name?: string;
  total_floors?: number;
}
