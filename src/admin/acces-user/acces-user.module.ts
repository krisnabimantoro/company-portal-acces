import { Module } from '@nestjs/common';
import { AccesUserService } from './acces-user.service';
import { AccesUserController } from './acces-user.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AccesUserController],
  providers: [AccesUserService, PrismaService],
})
export class AccesUserModule {}
