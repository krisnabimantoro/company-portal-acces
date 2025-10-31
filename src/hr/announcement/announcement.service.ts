import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AnnouncementService {
  constructor(private prismaService: PrismaService) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, hrUserId: string) {
    // Validate announcement type
    const validTypes = ['URGENT', 'DAILY'];
    if (!validTypes.includes(createAnnouncementDto.announcement_type)) {
      throw new BadRequestException(
        `Invalid announcement type. Must be one of: ${validTypes.join(', ')}`,
      );
    }

    const announcement = await this.prismaService.announcement.create({
      data: {
        user_hr_id: hrUserId,
        announcement_type: createAnnouncementDto.announcement_type as any,
        title: createAnnouncementDto.title,
        note: createAnnouncementDto.note,
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

    return {
      message: 'Announcement created successfully',
      data: announcement,
    };
  }

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

  async findOne(id: string) {
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
        reads: {
          select: {
            id: true,
            created_at: true,
            employee: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return {
      message: 'Announcement detail retrieved successfully',
      data: announcement,
    };
  }

  async update(
    id: string,
    updateAnnouncementDto: UpdateAnnouncementDto,
    hrUserId: string,
  ) {
    const existingAnnouncement =
      await this.prismaService.announcement.findFirst({
        where: {
          id,
          deleted_at: null,
        },
      });

    if (!existingAnnouncement) {
      throw new NotFoundException('Announcement not found');
    }

    if (updateAnnouncementDto.announcement_type) {
      const validTypes = ['URGENT', 'DAILY'];
      if (!validTypes.includes(updateAnnouncementDto.announcement_type)) {
        throw new BadRequestException(
          `Invalid announcement type. Must be one of: ${validTypes.join(', ')}`,
        );
      }
    }

    const updateData: any = {
      user_hr_id: hrUserId,
    };

    if (updateAnnouncementDto.announcement_type) {
      updateData.announcement_type = updateAnnouncementDto.announcement_type;
    }

    if (updateAnnouncementDto.title) {
      updateData.title = updateAnnouncementDto.title;
    }

    if (updateAnnouncementDto.note) {
      updateData.note = updateAnnouncementDto.note;
    }

    await this.prismaService.announcement.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Announcement updated successfully',
    };
  }

  async remove(id: string) {
    const existingAnnouncement =
      await this.prismaService.announcement.findFirst({
        where: {
          id,
          deleted_at: null,
        },
      });

    if (!existingAnnouncement) {
      throw new NotFoundException('Announcement not found');
    }

    await this.prismaService.announcement.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });

    return {
      message: 'Announcement deleted successfully',
    };
  }
}
