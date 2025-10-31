import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AnnouncementService {
  constructor(private prismaService: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, type?: string) {
    // Validate pagination
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deleted_at: null,
    };

    if (type) {
      where.announcement_type = type.toUpperCase();
    }

    // Get total count and data in parallel
    const [total, announcements] = await Promise.all([
      this.prismaService.announcement.count({ where }),
      this.prismaService.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          announcement_type: true,
          title: true,
          note: true,
          created_at: true,
          updated_at: true,
          hr: {
            select: {
              id: true,
              full_name: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Announcements retrieved successfully',
      data: announcements,
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

  async findOne(id: string, userId: string) {
    const announcement = await this.prismaService.announcement.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      select: {
        id: true,
        announcement_type: true,
        title: true,
        note: true,
        created_at: true,
        updated_at: true,
        hr: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Check if user has already read this announcement
    const existingRead = await this.prismaService.announcementReadBy.findFirst({
      where: {
        announcement_id: id,
        user_employee_id: userId,
      },
    });

    // If not already read, mark as read
    if (!existingRead) {
      await this.prismaService.announcementReadBy.create({
        data: {
          announcement_id: id,
          user_employee_id: userId,
        },
      });
    }

    return {
      message: 'Announcement detail retrieved successfully',
      data: announcement,
    };
  }
}
