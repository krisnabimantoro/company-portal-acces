import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CsrfController } from './csrf/csrf.controller';

@Module({
  controllers: [AuthController, CsrfController],
  providers: [AuthService],
})
export class AuthModule {}
