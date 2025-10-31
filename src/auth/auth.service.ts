import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';

import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './lib/constant';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(userDto: UserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: userDto.email,
      },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (userDto.phone_number) {
      const existingPhone = await this.prismaService.user.findUnique({
        where: {
          phone_number: userDto.phone_number,
        },
      });
      if (existingPhone) {
        throw new ConflictException(
          'User with this phone number already exists',
        );
      }
    }

    const saltOrRounds = 10;
    const password = userDto.password;
    const hash = await bcrypt.hash(password, saltOrRounds);

    const user = await this.prismaService.user.create({
      data: {
        ...userDto,
        password: hash,
      },
    });
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
          where: {
            deleted_at: null,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.roles || user.roles.length === 0) {
      throw new UnauthorizedException(
        'User does not have any assigned role, please contact admin',
      );
    }

    const invalidRole = user.roles.find((ur) => !ur.role || !ur.role.name_role);
    if (invalidRole) {
      throw new UnauthorizedException('User has an invalid role');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const userRoles = user.roles.map((ur) => ur.role.name_role);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: userRoles,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET_KEY,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        roles: userRoles,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          jwtConstants.refreshSecret || process.env.JWT_REFRESH_SECRET_KEY,
      });

      // Get user from database to ensure user still exists and has valid roles
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: true,
            },
            where: {
              deleted_at: null,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.roles || user.roles.length === 0) {
        throw new UnauthorizedException('User does not have any assigned role');
      }

      // Get updated user roles
      const userRoles = user.roles.map((ur) => ur.role.name_role);

      // Create new payload with updated roles
      const newPayload = {
        sub: user.id,
        email: user.email,
        roles: userRoles,
      };

      // Generate new access token
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1h',
      });

      // Generate new refresh token
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
        secret:
          jwtConstants.refreshSecret || process.env.JWT_REFRESH_SECRET_KEY,
      });

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          roles: userRoles,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

}
