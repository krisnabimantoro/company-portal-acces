import { LeaveType } from './create-leave.dto';

export class UpdateLeaveDto {
  leave_type?: LeaveType;
  from_date?: string; // ISO date string: "2025-10-31"
  until_date?: string; // ISO date string: "2025-11-05"
  note?: string;
}
