import { PartialType } from '@nestjs/mapped-types';
import { CreateAccesUserDto } from './create-acces-user.dto';

export class UpdateAccesUserDto extends PartialType(CreateAccesUserDto) {}
