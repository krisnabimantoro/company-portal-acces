# E2E Testing Guide

## Authentication Token Testing

File `auth.e2e-spec.ts` berisi comprehensive testing untuk authentication system dengan JWT tokens.

## Test Coverage

### 1. **User Registration Tests**

- ✅ Registrasi user baru berhasil
- ✅ Gagal dengan email duplikat
- ✅ Gagal dengan format email invalid
- ✅ Gagal dengan password lemah

### 2. **Login Tests**

- ✅ Login berhasil dan mendapat tokens di cookies
- ✅ Gagal dengan password salah
- ✅ Gagal dengan user tidak exist
- ✅ Gagal tanpa credentials

### 3. **JWT Token Authentication Tests**

- ✅ Akses protected route dengan valid token
- ✅ Gagal tanpa token
- ✅ Gagal dengan invalid token
- ✅ Gagal dengan expired token

### 4. **Token Refresh Tests**

- ✅ Refresh access token dengan valid refresh token
- ✅ Gagal tanpa refresh token
- ✅ Gagal dengan invalid refresh token

### 5. **Logout Tests**

- ✅ Logout berhasil dan clear cookies
- ✅ Gagal logout tanpa token

### 6. **CSRF Protection Tests**

- ✅ Get CSRF token

### 7. **Token Security Tests**

- ✅ Access token memiliki HttpOnly flag
- ✅ Refresh token memiliki HttpOnly flag
- ✅ Cookies memiliki SameSite flag

### 8. **Rate Limiting Tests**

- ✅ Rate limit untuk login attempts

## Running Tests

### Run all e2e tests

```bash
pnpm test:e2e
```

### Run specific test file

```bash
pnpm test:e2e auth.e2e-spec.ts
```

### Run with coverage

```bash
pnpm test:e2e --coverage
```

### Watch mode

```bash
pnpm test:e2e --watch
```

## Prerequisites

Before running tests, ensure:

1. **Database is running** - Tests akan create/delete test users
2. **Environment variables** - File `.env.test` atau `.env` harus ada
3. **Dependencies installed** - Run `pnpm install`

## Test Environment Setup

Create `.env.test` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/company_portal_test"
JWT_SECRET="test-jwt-secret"
JWT_REFRESH_SECRET="test-refresh-secret"
CSRF_SECRET="test-csrf-secret"
NODE_ENV="test"
```

## Test Database

Untuk testing, sebaiknya gunakan database terpisah:

```bash
# Create test database
createdb company_portal_test

# Run migrations
DATABASE_URL="postgresql://user:password@localhost:5432/company_portal_test" pnpm prisma migrate deploy
```

## Test Structure

```typescript
describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    // Setup application
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('Feature Group', () => {
    it('should do something', async () => {
      // Test implementation
    });
  });
});
```

## Important Notes

1. **Test Isolation**: Setiap test menggunakan unique email untuk avoid conflicts
2. **Cleanup**: Test data otomatis dihapus setelah semua tests selesai
3. **Token Storage**: Access dan refresh tokens disimpan untuk reuse dalam tests
4. **Rate Limiting**: Test rate limiting memiliki timeout lebih lama (30s)

## Common Issues

### Issue: Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Pastikan PostgreSQL running dan DATABASE_URL correct

### Issue: Test User Already Exists

```
Error: Unique constraint failed on email
```

**Solution**: Run cleanup atau gunakan unique email dengan timestamp

### Issue: Token Validation Failed

```
Error: 401 Unauthorized
```

**Solution**: Check JWT_SECRET di test environment match dengan auth service

## Best Practices

1. **Always cleanup test data** - Gunakan `afterAll` hook
2. **Use unique identifiers** - Tambahkan timestamp pada test data
3. **Test security features** - Verify HttpOnly, SameSite, Secure flags
4. **Test error cases** - Jangan hanya test happy path
5. **Mock external services** - Untuk consistent test results

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Run E2E Tests
  run: |
    pnpm install
    pnpm prisma migrate deploy
    pnpm test:e2e
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Debugging Tests

Enable verbose output:

```bash
pnpm test:e2e --verbose
```

Run single test:

```bash
pnpm test:e2e -t "should login successfully"
```

## Coverage Reports

Generate coverage report:

```bash
pnpm test:e2e --coverage
```

View report:

```bash
open coverage/lcov-report/index.html
```
