import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LeaveService {
  constructor(private prismaService: PrismaService) {}

  async getAllLeaves(
    page: number = 1,
    limit: number = 10,
    status?: string,
    fullName?: string,
  ) {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null,
    };

    if (status) {
      where.leave_status = status.toUpperCase();
    }

    if (fullName) {
      where.employee = {
        full_name: {
          contains: fullName,
          mode: 'insensitive',
        },
      };
    }

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
          note: true,
          created_at: true,
          updated_at: true,
          employee: {
            select: {
              full_name: true,
            },
          },
          hr: {
            select: {
              full_name: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'All leaves retrieved successfully',
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

  async getLeaveDetail(leaveId: string) {
    const leave = await this.prismaService.leave.findFirst({
      where: {
        id: leaveId,
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
        employee: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone_number: true,
          },
        },
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
      throw new NotFoundException('Leave request not found');
    }

    if (leave.leave_status === 'PENDING') {
      await this.prismaService.leave.update({
        where: { id: leaveId },
        data: {
          leave_status: 'UNDER_REVIEW' as any,
        },
      });

      leave.leave_status = 'UNDER_REVIEW' as any;
    }

    return {
      message: 'Leave detail retrieved successfully',
      data: leave,
    };
  }

  async updateLeaveStatus(
    leaveId: string,
    newStatus: string,
    hrUserId: string,
  ) {
    // Check if leave exists
    const leave = await this.prismaService.leave.findFirst({
      where: {
        id: leaveId,
        deleted_at: null,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    // Validate status value
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'];
    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      );
    }

    // Update leave status and set HR user
    await this.prismaService.leave.update({
      where: { id: leaveId },
      data: {
        leave_status: newStatus as any,
        user_hr_id: hrUserId,
      },
    });

    return {
      message: `Leave request ${newStatus.toLowerCase()} successfully`,
    };
  }
}
