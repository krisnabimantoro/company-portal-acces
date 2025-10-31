import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LeaveService {
  constructor(private prismaService: PrismaService) {}

  async create(
    createLeaveDto: CreateLeaveDto,
    employeeId: string,
    fileUrl: string | null,
  ) {
    const fromDate = new Date(createLeaveDto.from_date);
    const untilDate = new Date(createLeaveDto.until_date);

    if (isNaN(fromDate.getTime()) || isNaN(untilDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (fromDate > untilDate) {
      throw new BadRequestException(
        'From date must be before or equal to until date',
      );
    }

    const leave = await this.prismaService.leave.create({
      data: {
        user_employee_id: employeeId,
        leave_type: createLeaveDto.leave_type,
        from_date: fromDate,
        until_date: untilDate,
        note: createLeaveDto.note,
        file_url: fileUrl,
        leave_status: 'PENDING',
      },
    });

    return {
      message: 'Leave request created successfully',
      data: {
        id: leave.id,
        leave_type: leave.leave_type,
        leave_status: leave.leave_status,
        from_date: leave.from_date,
        until_date: leave.until_date,
        note: leave.note,
        file_url: leave.file_url,
        created_at: leave.created_at,
      },
    };
  }

}
