export type BulkSmsTarget =
  | 'ALL_STUDENTS'
  | 'STUDENT'
  | 'BATCH'
  | 'CLASS'
  | 'SHIFT'
  | 'MANUAL';

export interface ISendBulkSms {
  message: string;
  target: BulkSmsTarget;
  targetId?: string;
  batchId?: string;
  phoneNumbers?: string[];
}
