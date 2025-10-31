# 🏢 Company Portal Access

Backend API untuk sistem manajemen portal perusahaan yang dibangun dengan NestJS, PostgreSQL, dan Prisma ORM.

## 📋 Deskripsi

Company Portal Access adalah REST API yang menyediakan sistem autentikasi, manajemen karyawan, cuti, dan pengumuman untuk portal perusahaan. Aplikasi ini dilengkapi dengan fitur keamanan seperti JWT authentication, CSRF protection, dan rate limiting.

## Pattern Project

Pattern yang biasa saya gunakan adalah menggunakan Modular Architecture, dengan konsep OOP jadi saya biasa menggunakan fitur module pattern dari behaviornya nestjs

## Dokumentasi Architecture

Functional req, ERD dan information architecture
https://www.tldraw.com/f/VWXrlQslvjzNJV5-Fm_QY?d=v-904.505.2519.1468.U4OROQrJibCah1S_ApibX


## 🚀 Fitur Utama

### 🔐 Authentication & Authorization

- **JWT-based Authentication** - Access token & refresh token dengan HTTP-only cookies
- **Role-based Access Control (RBAC)** - Multi-role support (Admin, HR, Employee)
- **CSRF Protection** - Token CSRF untuk keamanan tambahan
- **Rate Limiting** - Perlindungan dari brute force attacks
  - Login: 5 requests/minute
  - Register: 3 requests/minute
  - Global: 10 req/s, 100 req/min, 1000 req/hour

### 👥 User Management

- User registration & profile management
- Role assignment (Admin, HR, Employee)
- Password encryption dengan bcrypt

### 📅 Leave Management

- Employee leave requests
- Leave approval/rejection workflow
- Leave history tracking

### 📢 Announcement System

- Create and manage company announcements
- Track announcement read status
- User-specific announcement notifications

## 🛠️ Tech Stack

- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.6.2
- **Database**: PostgreSQL
- **ORM**: Prisma 6.1.0
- **Authentication**: JWT (jsonwebtoken, @nestjs/jwt)
- **Security**:
  - bcrypt (password hashing)
  - csrf-csrf (CSRF protection)
  - @nestjs/throttler (rate limiting)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest
- **Package Manager**: pnpm

## 📁 Struktur Project

```
company-portal-acces/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── csrf/               # CSRF protection
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── entities/           # Database entities
│   │   ├── guards/             # Auth guards (JWT)
│   │   └── lib/                # Auth utilities & constants
│   ├── employee/               # Employee module
│   │   └── leave/             # Leave management
│   ├── hr/                     # HR module
│   │   └── announcement/      # Announcement system
│   ├── middleware/             # Custom middlewares
│   ├── prisma.service.ts       # Prisma ORM service
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry point
├── prisma/
│   └── schema.prisma           # Database schema
├── test/
│   ├── auth.e2e-spec.ts       # E2E tests for authentication
│   └── jest-e2e.json          # Jest E2E configuration
├── mist/
│   └── docker/                 # Docker configuration
│       ├── Dockerfile          # Production Dockerfile
│       ├── docker-compose.yml  # Docker Compose setup
│       └── .env.example        # Environment variables example
└── .github/
    └── workflows/              # CI/CD workflows
        └── docker-build-push.yml
```

## ⚙️ Prerequisites

- **Node.js**: >= 20.x
- **pnpm**: >= 9.x
- **PostgreSQL**: >= 14.x
- **Docker** (optional, untuk deployment)

## 🔧 Installation

### 1. Clone Repository

```bash
git clone https://github.com/krisnabimantoro/company-portal-acces.git
cd company-portal-acces
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Buat file `.env` di root project:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/company_portal"

# JWT Secrets
JWT_SECRET_KEY="your-secret-key-here"
JWT_REFRESH_SECRET_KEY="your-refresh-secret-key-here"

# App Configuration
APP_KEY="your-app-key-here"
NODE_ENV="development"
PORT=3040

# CSRF
CSRF_SECRET="your-csrf-secret-here"
```

### 4. Database Setup

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed database
pnpm prisma db seed
```

### 5. Run Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

Server akan berjalan di `http://localhost:3040`

## 🧪 Testing

> **📖 Dokumentasi Lengkap**: Lihat [TESTING.md](docs/TESTING.md) untuk panduan lengkap testing

### Prerequisites untuk Testing

- PostgreSQL test database running
- Test user dengan credentials:
  - Email: `krisnabmntr@gmail.com`
  - Password: `securePassword123`
  - **Harus memiliki 3 roles** (Admin, HR, Employee)

### Setup Test Database

```bash
# Via Docker
docker run --name postgres-test \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_pass \
  -e POSTGRES_DB=company_portal_test \
  -p 5433:5432 -d postgres:14

# Generate Prisma Client & Run Migrations
pnpm prisma generate
pnpm prisma migrate deploy

# Seed test data (buat test user)
pnpm prisma db seed
```

### Running Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Specific E2E test
pnpm test:e2e auth.e2e-spec.ts

# Test coverage
pnpm run test:cov

# Watch mode
pnpm test:watch
```

### E2E Test Results

```
✓ Authentication Token API (14 tests)
  ✓ POST /auth/login (2 tests)
  ✓ GET /auth/me (3 tests)
  ✓ POST /auth/refresh (3 tests)
  ✓ POST /auth/logout (2 tests)
  ✓ Token Security (3 tests)
  ✓ CSRF Token (1 test)
```

## 📚 API Documentation

### Authentication Endpoints

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response**: Sets HTTP-only cookies (`access_token`, `refresh_token`)

#### Get Current User

```http
GET /auth/me
Cookie: access_token=<token>
```

#### Refresh Token

```http
POST /auth/refresh
Cookie: refresh_token=<token>
```

#### Logout

```http
POST /auth/logout
Cookie: access_token=<token>
```

#### Get CSRF Token

```http
GET /auth/csrf/token
```

### Leave Management Endpoints

#### Create Leave Request

```http
POST /employee/leave
Cookie: access_token=<token>
Content-Type: application/json

{
  "leave_type": "annual",
  "start_date": "2024-01-01",
  "end_date": "2024-01-05",
  "reason": "Family vacation"
}
```

#### Get Leave History

```http
GET /employee/leave
Cookie: access_token=<token>
```

### Announcement Endpoints

#### Create Announcement (HR/Admin only)

```http
POST /hr/announcement
Cookie: access_token=<token>
Content-Type: application/json

{
  "title": "Company Update",
  "content": "Important announcement content",
  "priority": "high"
}
```

#### Get Announcements

```http
GET /hr/announcement
Cookie: access_token=<token>
```

## 🐳 Docker Deployment

### Build & Run dengan Docker Compose

```bash
cd mist/docker

# Copy environment file
cp .env.example /root/dot/.env

# Edit environment variables
nano /root/dot/.env

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -f mist/docker/Dockerfile -t company-portal-api .

# Run container
docker run -p 3040:3040 \
  --env-file /root/dot/.env \
  -v /root/dot/uploads:/usr/src/app/uploads \
  company-portal-api
```

## 🚀 CI/CD Pipeline

Project ini menggunakan GitHub Actions untuk automated deployment.

### Workflow

1. **Build**: Build Docker image dan push ke registry
2. **Deploy**: SSH ke server dan deploy menggunakan docker-compose

### Trigger

- Push ke branch `staging` atau `main`
- Push tag dengan format `v*.*.*`

### Setup GitHub Secrets

Tambahkan secrets berikut di GitHub repository:

```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password
SSH_HOST                 # Server IP/hostname
SSH_USERNAME             # SSH username
SSH_PRIVATE_KEY          # SSH private key
```

## 🔒 Security Features

### Authentication

- ✅ JWT tokens dengan expiry (1 hour access, 7 days refresh)
- ✅ HTTP-only cookies (XSS protection)
- ✅ SameSite cookies (CSRF protection)
- ✅ Secure flag di production

### Rate Limiting

- ✅ Global: 10 req/s, 100 req/min, 1000 req/hour
- ✅ Login: 5 requests/minute
- ✅ Register: 3 requests/minute
- ✅ Leave creation: 5 requests/minute

### Data Protection

- ✅ Password hashing dengan bcrypt
- ✅ CSRF token validation
- ✅ Input validation dengan class-validator
- ✅ SQL injection protection (Prisma ORM)

## 📊 Database Schema

### Main Tables

- **User**: User accounts dan credentials
- **Role**: User roles (Admin, HR, Employee)
- **UserRole**: Many-to-many relationship user-role
- **Leave**: Employee leave requests
- **Announcement**: Company announcements
- **AnnouncementReadBy**: Tracking read status

### Migrations

```bash
# Create new migration
pnpm prisma migrate dev --name migration_name

# Apply migrations
pnpm prisma migrate deploy

# Reset database (development only!)
pnpm prisma migrate reset
```

## 🛠️ Development

### Code Style

Project menggunakan ESLint dan Prettier untuk code formatting:

```bash
# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Debug Mode

```bash
# Run with debug
pnpm run start:debug
```

### Prisma Studio

Untuk visualisasi database:

```bash
pnpm prisma studio
```

Buka browser di `http://localhost:5555`

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Environment Variables

| Variable                 | Description                  | Default       | Required |
| ------------------------ | ---------------------------- | ------------- | -------- |
| `DATABASE_URL`           | PostgreSQL connection string | -             | ✅       |
| `JWT_SECRET_KEY`         | Secret for access token      | -             | ✅       |
| `JWT_REFRESH_SECRET_KEY` | Secret for refresh token     | -             | ✅       |
| `APP_KEY`                | Application encryption key   | -             | ✅       |
| `CSRF_SECRET`            | CSRF protection secret       | -             | ✅       |
| `NODE_ENV`               | Environment mode             | `development` | ❌       |
| `PORT`                   | Application port             | `3040`        | ❌       |

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Pastikan PostgreSQL running
sudo systemctl status postgresql

# Test koneksi
psql -U your_user -d company_portal -h localhost
```

### Prisma Client Error

```bash
# Regenerate Prisma Client
pnpm prisma generate

# Reset database jika diperlukan
pnpm prisma migrate reset
```

### Port Already in Use

```bash
# Cari process yang menggunakan port
lsof -i :3040

# Kill process
kill -9 <PID>
```

### Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout dan login kembali
```

## 📈 Performance Tips

1. **Database Indexing**: Pastikan index sudah optimal di Prisma schema
2. **Connection Pooling**: Configure PostgreSQL connection pool
3. **Caching**: Implementasi Redis untuk session & cache (future enhancement)
4. **Load Balancing**: Gunakan Nginx untuk reverse proxy & load balancing
5. **Monitoring**: Setup logging & monitoring (Winston, PM2, DataDog)

## 🗺️ Roadmap

- [ ] Implementasi Redis untuk caching
- [ ] Websocket untuk real-time notifications
- [ ] File upload untuk profile pictures
- [ ] Advanced leave approval workflow
- [ ] Email notifications
- [ ] Audit logging
- [ ] API documentation dengan Swagger
- [ ] Integration tests dengan database seeding

## 📄 License

Project ini menggunakan MIT License.

## � Documentation

Dokumentasi lengkap tersedia di folder `docs/`:

- **[API.md](docs/API.md)** - API endpoints, request/response format, authentication
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Panduan deployment ke production
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Panduan untuk developers
- **[TESTING.md](docs/TESTING.md)** - Panduan lengkap testing & requirements

## �👥 Team

- **Developer**: Krisna Bimantoro
- **Repository**: [github.com/krisnabimantoro/company-portal-acces](https://github.com/krisnabimantoro/company-portal-acces)
