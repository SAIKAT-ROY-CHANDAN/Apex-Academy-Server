export interface IPeriodTime {
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface IPeriodSetting {
  period_count: number;
  periods: IPeriodTime[] | null;
}

export interface IPeriodSettingCreate {
  period_count: number;
  periods?: IPeriodTime[];
}

export interface IPeriodSettingUpdate {
  period_count?: number;
  periods?: IPeriodTime[];
}