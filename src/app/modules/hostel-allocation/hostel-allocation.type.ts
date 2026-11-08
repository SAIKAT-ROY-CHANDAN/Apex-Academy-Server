export interface ICreateHostelAllocation {
  student_id: string;
  hostel_room_id: string;
  sit?: string;
  allocated_at?: string | Date;
}

export interface IUpdateHostelAllocation {
  student_id?: string;
  hostel_room_id?: string;
  sit?: string;
  allocated_at?: string | Date;
}
