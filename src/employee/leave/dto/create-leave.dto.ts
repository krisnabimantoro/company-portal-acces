export enum LeaveType {
  CUTI_TAHUNAN = 'CUTI_TAHUNAN',
  CUTI_SAKIT = 'CUTI_SAKIT',
  CUTI_TANPA_GAJI = 'CUTI_TANPA_GAJI',
  LAINNYA = 'LAINNYA',
}

export class CreateLeaveDto {
  leave_type: LeaveType;
  from_date: string; // ISO date string: "2025-10-31"
  until_date: string; // ISO date string: "2025-11-05"
  note: string;
}
