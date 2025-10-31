# 🧪 Testing Requirements & Guide

Panduan lengkap untuk menjalankan testing di Company Portal Access.

## 📋 Prerequisites untuk Testing

### 1. Software Requirements

- ✅ **Node.js**: >= 20.x
- ✅ **pnpm**: >= 9.x
- ✅ **PostgreSQL**: >= 14.x (untuk E2E tests)
- ✅ **Git**: Untuk clone repository

### 2. Environment Setup

#### Install Dependencies

```bash
# Clone repository (jika belum)
git clone https://github.com/krisnabimantoro/company-portal-acces.git
cd company-portal-acces

# Install semua dependencies
pnpm install
```

#### Environment Variables

Buat file `.env.test` untuk testing environment:

```env
# Database Test
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/company_portal_test"

# JWT Secrets
JWT_SECRET_KEY="test-jwt-secret-key"
JWT_REFRESH_SECRET_KEY="test-refresh-secret-key"

# App Configuration
APP_KEY="test-app-key"
NODE_ENV="test"
PORT=3041

# CSRF
CSRF_SECRET="test-csrf-secret"
```

### 3. Database Setup untuk Testing

#### Option A: PostgreSQL Local

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Buat database test
sudo -u postgres psql
```

```sql
CREATE DATABASE company_portal_test;
CREATE USER test_user WITH PASSWORD 'test_pass';
GRANT ALL PRIVILEGES ON DATABASE company_portal_test TO test_user;
\q
```

#### Option B: PostgreSQL dengan Docker

```bash
# Run PostgreSQL container untuk testing
docker run --name postgres-test \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_pass \
  -e POSTGRES_DB=company_portal_test \
  -p 5433:5432 \
  -d postgres:14

# Update DATABASE_URL di .env.test
# DATABASE_URL="postgresql://test_user:test_pass@localhost:5433/company_portal_test"
```

### 4. Database Migration untuk Testing

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Atau reset database test
pnpm prisma migrate reset
```

### 5. Test Data Setup

#### Buat User untuk E2E Testing

Untuk E2E authentication tests, perlu user dengan credentials berikut:

```json
{
  "email": "krisnabmntr@gmail.com",
  "password": "securePassword123"
}
```

**User ini harus memiliki 3 roles** (Admin, HR, Employee)

#### Cara Setup Test User

**Option A: Manual via Prisma Studio**

```bash
# Buka Prisma Studio
pnpm prisma studio

# Buat user baru dengan data:
# - email: krisnabmntr@gmail.com
# - password: (hash dari "securePassword123")
# - full_name: Test User

# Assign 3 roles ke user tersebut via UserRole table
```

**Option B: Via Database Seed Script**

Buat file `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash('securePassword123', 10);

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'krisnabmntr@gmail.com' },
    update: {},
    create: {
      email: 'krisnabmntr@gmail.com',
      password: hashedPassword,
      full_name: 'Test User',
    },
  });

  // Create roles if not exist
  const adminRole = await prisma.role.upsert({
    where: { name_role: 'admin' },
    update: {},
    create: {
      name_role: 'admin',
      description: 'Administrator role',
    },
  });

  const hrRole = await prisma.role.upsert({
    where: { name_role: 'hr' },
    update: {},
    create: {
      name_role: 'hr',
      description: 'HR role',
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name_role: 'employee' },
    update: {},
    create: {
      name_role: 'employee',
      description: 'Employee role',
    },
  });

  // Assign roles to user
  await prisma.userRole.createMany({
    data: [
      { user_id: user.id, role_id: adminRole.id },
      { user_id: user.id, role_id: hrRole.id },
      { user_id: user.id, role_id: employeeRole.id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Test user created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Update `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Jalankan seed:

```bash
pnpm prisma db seed
```

---

## 🧪 Jenis-jenis Testing

### 1. Unit Tests

**Syarat**:

- Dependencies terinstall
- Prisma Client generated

**Tidak memerlukan**:

- Database running
- Test user

**Command**:

```bash
pnpm test
```

### 2. E2E Tests (End-to-End)

**Syarat**:

- ✅ Dependencies terinstall
- ✅ Database test running
- ✅ Prisma migrations applied
- ✅ Test user dengan 3 roles sudah dibuat
- ✅ Environment variables configured

**Command**:

```bash
pnpm test:e2e
```

### 3. Test Coverage

**Syarat**: Sama dengan Unit Tests

**Command**:

```bash
pnpm test:cov
```

---

## 🚀 Menjalankan Tests

### Running All Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Specific E2E test file
pnpm test:e2e auth.e2e-spec.ts

# Test coverage
pnpm test:cov
```

### Watch Mode (Development)

```bash
# Unit tests dengan watch mode
pnpm test:watch

# E2E tests dengan watch mode
pnpm test:e2e -- --watch
```

### Debug Mode

```bash
# Debug specific test
pnpm test:debug auth.service.spec.ts
```

---

## 📝 Checklist Sebelum Menjalankan E2E Tests

Pastikan semua item berikut sudah terpenuhi:

- [ ] PostgreSQL database test sudah running
- [ ] File `.env.test` sudah dibuat dengan konfigurasi yang benar
- [ ] Dependencies sudah terinstall (`pnpm install`)
- [ ] Prisma Client sudah di-generate (`pnpm prisma generate`)
- [ ] Database migrations sudah dijalankan (`pnpm prisma migrate deploy`)
- [ ] Test user `krisnabmntr@gmail.com` sudah dibuat
- [ ] User memiliki 3 roles (admin, hr, employee)
- [ ] Port 3041 tidak digunakan oleh aplikasi lain

---

## 🔍 Verifikasi Setup

### 1. Check Database Connection

```bash
# Test koneksi ke database
psql -U test_user -d company_portal_test -h localhost

# Atau via Docker
docker exec -it postgres-test psql -U test_user -d company_portal_test
```

### 2. Check Test User

```bash
# Via Prisma Studio
pnpm prisma studio

# Atau via SQL
psql -U test_user -d company_portal_test -c "
  SELECT u.email, u.full_name, r.name_role
  FROM \"User\" u
  JOIN \"UserRole\" ur ON u.id = ur.user_id
  JOIN \"Role\" r ON ur.role_id = r.id
  WHERE u.email = 'krisnabmntr@gmail.com';
"
```

Expected output:

```
        email         | full_name | name_role
----------------------+-----------+-----------
 krisnabmntr@gmail.com | Test User | admin
 krisnabmntr@gmail.com | Test User | hr
 krisnabmntr@gmail.com | Test User | employee
```

### 3. Check Prisma Schema

```bash
# Format schema
pnpm prisma format

# Validate schema
pnpm prisma validate
```

### 4. Test Database Connectivity

```bash
# Create quick test script
cat > test-db.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);

    const testUser = await prisma.user.findUnique({
      where: { email: 'krisnabmntr@gmail.com' },
      include: { roles: { include: { role: true } } }
    });

    if (testUser) {
      console.log('✅ Test user found');
      console.log(`👤 Name: ${testUser.full_name}`);
      console.log(`📧 Email: ${testUser.email}`);
      console.log(`🔑 Roles: ${testUser.roles.length}`);
    } else {
      console.log('❌ Test user NOT found');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
EOF

node test-db.js
rm test-db.js
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Database Connection Error

**Error**: `Can't reach database server`

**Solution**:

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Or check Docker container
docker ps | grep postgres-test
docker start postgres-test
```

### Issue 2: Prisma Client Not Generated

**Error**: `Cannot find module '.prisma/client'`

**Solution**:

```bash
pnpm prisma generate
```

### Issue 3: Migration Error

**Error**: `Migration failed to apply`

**Solution**:

```bash
# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Or apply specific migration
pnpm prisma migrate deploy
```

### Issue 4: Test User Not Found

**Error**: E2E test fails with 401 Unauthorized

**Solution**:

```bash
# Run seed script to create test user
pnpm prisma db seed

# Or create manually via Prisma Studio
pnpm prisma studio
```

### Issue 5: Port Already in Use

**Error**: `Port 3041 already in use`

**Solution**:

```bash
# Find process using port
lsof -i :3041

# Kill process
kill -9 <PID>

# Or change port in .env.test
```

### Issue 6: Cookie Parser Error

**Error**: `Cannot read properties of undefined`

**Solution**:

- Pastikan `cookie-parser` sudah terinstall
- Check bahwa test setup includes `app.use(cookieParser())`

---

## 📊 Test Structure

### Authentication E2E Tests (auth.e2e-spec.ts)

Total: **14 tests**

1. **POST /auth/login** (2 tests)
   - Login success with valid credentials
   - Login failure with invalid credentials

2. **GET /auth/me** (3 tests)
   - Access with valid token
   - Access without token
   - Access with invalid token

3. **POST /auth/refresh** (3 tests)
   - Refresh with valid token
   - Refresh without token
   - Refresh with invalid token

4. **POST /auth/logout** (2 tests)
   - Logout success
   - Logout without token

5. **Token Security** (3 tests)
   - HttpOnly flag verification
   - SameSite flag verification
   - User roles verification

6. **CSRF Token** (1 test)
   - Get CSRF token

---

## 🎯 Expected Test Results

```bash
$ pnpm test:e2e auth.e2e-spec.ts

 PASS  test/auth.e2e-spec.ts
  Authentication Token API (e2e)
    POST /auth/login
      ✓ should login successfully and return access token in cookie
      ✓ should fail with invalid credentials
    GET /auth/me - Token Authentication
      ✓ should access protected route with valid access token
      ✓ should fail without token
      ✓ should fail with invalid token
    POST /auth/refresh - Token Refresh
      ✓ should refresh access token with valid refresh token
      ✓ should fail without refresh token
      ✓ should fail with invalid refresh token
    POST /auth/logout - Token Invalidation
      ✓ should logout and clear cookies
      ✓ should fail to logout without token
    Token Security
      ✓ should have httpOnly flag on cookies
      ✓ should have SameSite flag on cookies
      ✓ should verify user has 3 roles
    CSRF Token
      ✓ should get CSRF token

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        4.244 s
```

---

## 🔧 Troubleshooting Commands

```bash
# Clear node_modules dan reinstall
rm -rf node_modules
pnpm install

# Clear Prisma cache
rm -rf node_modules/.prisma
pnpm prisma generate

# Reset test database
pnpm prisma migrate reset

# Check environment variables
cat .env.test

# Test database connectivity
pnpm prisma studio

# Check for running processes
ps aux | grep node
ps aux | grep postgres

# Check port usage
netstat -tulpn | grep 3041
```

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)

---

## ✅ Quick Start Checklist

Untuk pertama kali menjalankan testing:

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database (pilih salah satu)
# Via Docker:
docker run --name postgres-test -e POSTGRES_USER=test_user -e POSTGRES_PASSWORD=test_pass -e POSTGRES_DB=company_portal_test -p 5433:5432 -d postgres:14

# Via Local PostgreSQL:
sudo -u postgres createdb company_portal_test

# 3. Setup environment
cp .env.example .env.test
# Edit .env.test sesuai konfigurasi

# 4. Generate Prisma Client
pnpm prisma generate

# 5. Run migrations
pnpm prisma migrate deploy

# 6. Seed test data
pnpm prisma db seed

# 7. Run tests
pnpm test:e2e
```

**Selamat! Tests siap dijalankan! 🎉**
