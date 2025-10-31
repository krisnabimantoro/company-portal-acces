import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CsrfController } from './csrf/csrf.controller';
import { PrismaService } from 'src/prisma.service';
import { LocalStrategy } from './strategys/local.strategy';
import { JwtStrategy } from './strategys/jwt.strategy';
import { jwtConstants } from './lib/constant';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret || 'defaultAccessSecretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, CsrfController],
  providers: [AuthService, PrismaService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
