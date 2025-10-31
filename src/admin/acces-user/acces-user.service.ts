import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAccesUserDto } from './dto/create-acces-user.dto';
import { UpdateAccesUserDto } from './dto/update-acces-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccesUserService {
  constructor(private prismaService: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    // Ensure page and limit are positive numbers
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, Math.min(100, limit)); // Max 100 items per page
    const skip = (pageNumber - 1) * limitNumber;

    // Build where condition
    const whereCondition: Prisma.UserWhereInput = {
      deleted_at: null, // Only active users
    };

    // Add search condition if search parameter is provided
    if (search) {
      whereCondition.full_name = {
        contains: search,
        mode: 'insensitive', // Case-insensitive search
      };
    }

    // Execute count and findMany in parallel for better performance
    const [totalUsers, users] = await Promise.all([
      this.prismaService.user.count({
        where: whereCondition,
      }),
      this.prismaService.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          email: true,
          full_name: true,
          phone_number: true,
          created_at: true,
          updated_at: true,
          roles: {
            where: {
              deleted_at: null, // Only active roles
            },
            select: {
              role: {
                select: {
                  id: true,
                  name_role: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: skip,
        take: limitNumber,
      }),
    ]);

    // Transform the response to a cleaner format
    const data = users.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: user.roles.map((ur) => ur.role.name_role),
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    return {
      data,
      pagination: {
        total: totalUsers,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async assignRole(assignRoleDto: AssignRoleDto, adminUserId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: assignRoleDto.user_id },
      include: {
        roles: {
          where: { deleted_at: null },
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.deleted_at) {
      throw new BadRequestException('Cannot assign role to deleted user');
    }

    const role = await this.prismaService.role.findUnique({
      where: { id: assignRoleDto.role_id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.deleted_at) {
      throw new BadRequestException('Cannot assign deleted role');
    }

    const existingRole = user.roles.find(
      (ur) => ur.role_id === assignRoleDto.role_id,
    );

    if (existingRole) {
      throw new ConflictException('User already has this role');
    }

    await this.prismaService.userRole.create({
      data: {
        user_id: assignRoleDto.user_id,
        role_id: assignRoleDto.role_id,
        create_by_user_id: adminUserId,
      },
    });

    return {
      message: 'Role assigned successfully',
    };
  }
}
