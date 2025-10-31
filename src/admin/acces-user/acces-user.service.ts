import { Injectable } from '@nestjs/common';
import { CreateAccesUserDto } from './dto/create-acces-user.dto';
import { UpdateAccesUserDto } from './dto/update-acces-user.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccesUserService {
  constructor(private prismaService: PrismaService) {}

  create(createAccesUserDto: CreateAccesUserDto) {
    return 'This action adds a new accesUser';
  }

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

  findOne(id: number) {
    return `This action returns a #${id} accesUser`;
  }

  update(id: number, updateAccesUserDto: UpdateAccesUserDto) {
    return `This action updates a #${id} accesUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} accesUser`;
  }
}
