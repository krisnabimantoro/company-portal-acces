import * as crypto from 'crypto';

const createHashedCookieName = (name: string): string => {
  return crypto
    .createHash('sha256')
    .update(name + (process.env.APP_KEY || 'defaultKey'))
    .digest('hex')
    .substring(0, 16);
};

export const jwtConstants = {
  secret: process.env.JWT_SECRET_KEY,
  refreshSecret: process.env.JWT_REFRESH_SECRET_KEY,
  accessTokenCookieName: createHashedCookieName('jwt_access'),
  refreshTokenCookieName: createHashedCookieName('jwt_refresh'),
};
