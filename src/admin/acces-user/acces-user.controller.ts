import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AccesUserService } from './acces-user.service';
import { CreateAccesUserDto } from './dto/create-acces-user.dto';
import { UpdateAccesUserDto } from './dto/update-acces-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('admin/acces-user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccesUserController {
  constructor(private readonly accesUserService: AccesUserService) {}

  @Post()
  create(@Body() createAccesUserDto: CreateAccesUserDto) {
    return this.accesUserService.create(createAccesUserDto);
  }

  @Get('list-users')
  @Roles('admin')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.accesUserService.findAll(pageNumber, limitNumber, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accesUserService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccesUserDto: UpdateAccesUserDto,
  ) {
    return this.accesUserService.update(+id, updateAccesUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accesUserService.remove(+id);
  }
}
