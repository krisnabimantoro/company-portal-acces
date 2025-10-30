import { doubleCsrf } from 'csrf-csrf';

const doubleCsrfOptions = {
  getSecret: () => process.env.CSRF_SECRET || 'a-very-secret-key',
  getSessionIdentifier: (req) => {

    return req.ip || 'unknown-ip';
  },
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: false,
  },
  size: 64,

  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
};

export const { doubleCsrfProtection, generateCsrfToken } =
  doubleCsrf(doubleCsrfOptions);
