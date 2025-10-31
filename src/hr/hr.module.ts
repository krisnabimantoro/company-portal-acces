import { Module } from '@nestjs/common';
import { LeaveModule } from './leave/leave.module';

@Module({
  imports: [LeaveModule]
})
export class HrModule {}
