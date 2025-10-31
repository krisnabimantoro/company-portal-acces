import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Authentication Token API (e2e)', () => {
  let app: INestApplication;
  let authCookies: string[] = [];

  const loginCredentials = {
    email: 'krisnabmntr@gmail.com',
    password: 'securePassword123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should login successfully and return access token in cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginCredentials)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty(
        'email',
        loginCredentials.email,
      );
      expect(response.body.user).toHaveProperty('roles');
      expect(response.body.user.roles).toHaveLength(3);

      // Extract cookies from response
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);
      expect(cookies.length).toBeGreaterThan(0);

      // Store cookies for next tests
      authCookies = cookies;
    });

    it('should fail with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginCredentials.email,
          password: 'wrongPassword',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me - Token Authentication', () => {
    it('should access protected route with valid access token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', authCookies)
        .expect(200);

      expect(response.body).toHaveProperty('email', loginCredentials.email);
      expect(response.body).toHaveProperty('roles');
      expect(Array.isArray(response.body.roles)).toBe(true);
      expect(response.body.roles).toHaveLength(3);
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', ['invalid_cookie=invalid_value'])
        .expect(401);
    });
  });

  describe('POST /auth/refresh - Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', authCookies)
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'Token refreshed successfully',
      );
      expect(response.body).toHaveProperty('user');

      // Should return new tokens in cookies
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);
      expect(cookies.length).toBeGreaterThan(0);

      // Update cookies for next tests
      authCookies = cookies;
    });

    it('should fail without refresh token', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should fail with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', ['invalid_cookie=invalid_value'])
        .expect(401);
    });
  });

  describe('POST /auth/logout - Token Invalidation', () => {
    it('should logout and clear cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', authCookies)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Logout successful');

      // Cookies should be cleared
      const cookies = response.headers['set-cookie'];
      if (cookies && Array.isArray(cookies)) {
        // Check if cookies have been cleared (Max-Age=0 or empty values)
        const hasExpiredCookies = cookies.some(
          (cookie: string) =>
            cookie.includes('Max-Age=0') || cookie.includes('=;'),
        );
        expect(hasExpiredCookies).toBe(true);
      }
    });

    it('should fail to logout without token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });

  describe('Token Security', () => {
    let securityTestCookies: string[] = [];

    beforeAll(async () => {
      // Login again to get fresh tokens for security tests
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginCredentials);

      securityTestCookies = response.headers[
        'set-cookie'
      ] as unknown as string[];
    });

    it('should have httpOnly flag on cookies', async () => {
      expect(securityTestCookies).toBeDefined();
      expect(Array.isArray(securityTestCookies)).toBe(true);

      // At least one cookie should have HttpOnly flag
      const hasHttpOnlyCookie = securityTestCookies.some((cookie: string) =>
        cookie.includes('HttpOnly'),
      );
      expect(hasHttpOnlyCookie).toBe(true);
    });

    it('should have SameSite flag on cookies', async () => {
      expect(securityTestCookies).toBeDefined();
      expect(Array.isArray(securityTestCookies)).toBe(true);

      // At least one cookie should have SameSite flag
      const hasSameSiteCookie = securityTestCookies.some((cookie: string) =>
        cookie.includes('SameSite'),
      );
      expect(hasSameSiteCookie).toBe(true);
    });

    it('should verify user has 3 roles', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', securityTestCookies)
        .expect(200);

      expect(response.body.roles).toHaveLength(3);
      expect(Array.isArray(response.body.roles)).toBe(true);
    });
  });

  describe('CSRF Token', () => {
    it('should get CSRF token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/csrf/token')
        .expect(200);

      expect(response.body).toHaveProperty('csrfToken');
      expect(response.body.csrfToken).toBeTruthy();
    });
  });
});
