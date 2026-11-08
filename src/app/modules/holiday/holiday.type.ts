import { HolidayType } from '../../../../generated/prisma/enums';

export interface IHolidayCreate {
  title: string;
  description?: string;
  start_date: Date;
  end_date?: Date;
  holiday_type: HolidayType;
  is_active?: boolean;
}

export interface IHolidayUpdate {
  title?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  holiday_type?: HolidayType;
  is_active?: boolean;
}