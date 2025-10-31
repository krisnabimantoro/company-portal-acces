export enum LeaveStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateLeaveStatusDto {
  leave_status: LeaveStatus;
}
