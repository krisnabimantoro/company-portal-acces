import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CsrfController } from './csrf/csrf.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AuthController, CsrfController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
