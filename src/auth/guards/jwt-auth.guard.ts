import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { jwtConstants } from '../lib/constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const jwt = request.cookies[jwtConstants.accessTokenCookieName];
    if (jwt) {
      request.headers.authorization = `Bearer ${jwt}`;
    }

    return request;
  }
}
