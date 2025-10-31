import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Patch,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Controller('hr/leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('list')
  @Roles('hr', 'admin')
  getAllLeaves(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('full_name') fullName?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.leaveService.getAllLeaves(pageNum, limitNum, status, fullName);
  }

  @Get(':id')
  @Roles('hr', 'admin')
  getLeaveDetail(@Param('id') id: string) {
    return this.leaveService.getLeaveDetail(id);
  }

  @Patch(':id/status')
  @Roles('hr', 'admin')
  updateLeaveStatus(
    @Param('id') id: string,
    @Body() updateLeaveStatusDto: UpdateLeaveStatusDto,
    @Req() req,
  ) {
    return this.leaveService.updateLeaveStatus(
      id,
      updateLeaveStatusDto.leave_status,
      req.user.id,
    );
  }
}
