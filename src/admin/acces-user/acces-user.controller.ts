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
  Req,
} from '@nestjs/common';
import { AccesUserService } from './acces-user.service';
import { CreateAccesUserDto } from './dto/create-acces-user.dto';
import { UpdateAccesUserDto } from './dto/update-acces-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RemoveRoleDto } from './dto/remove-role.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('admin/acces-user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccesUserController {
  constructor(private readonly accesUserService: AccesUserService) {}

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

  @Post('assign-role')
  @Roles('admin')
  assignRole(@Body() assignRoleDto: AssignRoleDto, @Req() req) {
    return this.accesUserService.assignRole(assignRoleDto, req.user.id);
  }

  @Delete('remove-role')
  @Roles('admin')
  removeRole(@Body() removeRoleDto: RemoveRoleDto) {
    return this.accesUserService.removeRole(removeRoleDto);
  }
}
