import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  async getMyLeaves(
    employeeId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ) {
    // Validate pagination
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      user_employee_id: employeeId,
      deleted_at: null,
    };

    if (status) {
      where.leave_status = status.toUpperCase();
    }

    // Get total count and data in parallel
    const [total, leaves] = await Promise.all([
      this.prismaService.leave.count({ where }),
      this.prismaService.leave.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          leave_type: true,
          leave_status: true,
          from_date: true,
          until_date: true,
          created_at: true,
          updated_at: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'My leaves retrieved successfully',
      data: leaves,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getLeaveDetail(leaveId: string, userId: string) {
    const leave = await this.prismaService.leave.findFirst({
      where: {
        id: leaveId,
        user_employee_id: userId, // Only get leave that belongs to this user
        deleted_at: null,
      },
      select: {
        id: true,
        leave_type: true,
        leave_status: true,
        from_date: true,
        until_date: true,
        note: true,
        file_url: true,
        created_at: true,
        updated_at: true,
        user_hr_id: true,
        hr: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException(
        'Leave request not found or you are not authorized to view it',
      );
    }

    return {
      message: 'Leave detail retrieved successfully',
      data: leave,
    };
  }
}
