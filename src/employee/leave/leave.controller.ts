import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { multerConfig } from 'src/common/config/multer.config';

@Controller('employee/leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @Roles('employee', 'admin', 'hr')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  create(
    @Body() createLeaveDto: CreateLeaveDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!createLeaveDto.leave_type) {
      throw new BadRequestException('leave_type is required');
    }
    if (!createLeaveDto.from_date) {
      throw new BadRequestException('from_date is required');
    }
    if (!createLeaveDto.until_date) {
      throw new BadRequestException('until_date is required');
    }

    const fileUrl = file ? `/uploads/leave-attachments/${file.filename}` : null;
    return this.leaveService.create(createLeaveDto, req.user.id, fileUrl);
  }

  @Get('list')
  @Roles('employee', 'admin', 'hr')
  getMyLeaves(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.leaveService.getMyLeaves(
      req.user.id,
      pageNum,
      limitNum,
      status,
    );
  }

  @Get(':id')
  @Roles('employee', 'admin', 'hr')
  getLeaveDetail(@Param('id') id: string, @Req() req) {
    return this.leaveService.getLeaveDetail(id, req.user.id);
  }
}
