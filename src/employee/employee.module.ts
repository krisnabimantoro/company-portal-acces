import { Module } from '@nestjs/common';
import { LeaveModule } from './leave/leave.module';
import { AnnouncementModule } from './announcement/announcement.module';

@Module({
  imports: [LeaveModule, AnnouncementModule]
})
export class EmployeeModule {}
