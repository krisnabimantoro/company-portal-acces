import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('hr/announcement')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @Roles('hr', 'admin')
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 announcements per minute
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Req() req) {
    if (!createAnnouncementDto.announcement_type) {
      throw new BadRequestException('announcement_type is required');
    }
    if (!createAnnouncementDto.title) {
      throw new BadRequestException('title is required');
    }
    if (!createAnnouncementDto.note) {
      throw new BadRequestException('note is required');
    }
    return this.announcementService.create(createAnnouncementDto, req.user.id);
  }

  @Get('list')
  @Roles('hr', 'admin')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.announcementService.findAll(pageNum, limitNum, type);
  }

  @Get(':id')
  @Roles('hr', 'admin')
  findOne(@Param('id') id: string) {
    return this.announcementService.findOne(id);
  }

  @Patch(':id')
  @Roles('hr', 'admin')
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
    @Req() req,
  ) {
    return this.announcementService.update(
      id,
      updateAnnouncementDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @Roles('hr', 'admin')
  remove(@Param('id') id: string) {
    return this.announcementService.remove(id);
  }
}
