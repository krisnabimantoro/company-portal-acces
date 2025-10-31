# 👨‍💻 Development Guide

Panduan untuk developers yang ingin berkontribusi atau mengembangkan Company Portal Access.

## 📋 Table of Contents

1. [Setup Development Environment](#setup-development-environment)
2. [Code Structure](#code-structure)
3. [Database Schema](#database-schema)
4. [Adding New Features](#adding-new-features)
5. [Testing Guidelines](#testing-guidelines)
6. [Code Style](#code-style)
7. [Git Workflow](#git-workflow)
8. [Best Practices](#best-practices)

---

## Setup Development Environment

### 1. Prerequisites

- Node.js 20.x atau lebih tinggi
- pnpm 9.x
- PostgreSQL 14.x
- Visual Studio Code (recommended)
- Git

### 2. Clone & Install

```bash
git clone https://github.com/krisnabimantoro/company-portal-acces.git
cd company-portal-acces
pnpm install
```

### 3. Setup Database

```bash
# Start PostgreSQL (via Docker)
docker run --name postgres-dev \
  -e POSTGRES_USER=dev_user \
  -e POSTGRES_PASSWORD=dev_pass \
  -e POSTGRES_DB=company_portal_dev \
  -p 5432:5432 \
  -d postgres:14

# Or install PostgreSQL locally
sudo apt install postgresql postgresql-contrib
```

### 4. Environment Configuration

Buat file `.env`:

```env
DATABASE_URL="postgresql://dev_user:dev_pass@localhost:5432/company_portal_dev"
JWT_SECRET_KEY="dev-jwt-secret-key"
JWT_REFRESH_SECRET_KEY="dev-refresh-secret-key"
APP_KEY="dev-app-key"
CSRF_SECRET="dev-csrf-secret"
NODE_ENV="development"
PORT=3040
```

### 5. Database Migration

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database (optional)
pnpm prisma db seed
```

### 6. Start Development Server

```bash
pnpm run start:dev
```

Server akan running di `http://localhost:3040` dengan hot-reload enabled.

### 7. VS Code Extensions (Recommended)

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Prisma** - Prisma schema support
- **REST Client** - API testing
- **GitLens** - Git integration
- **Thunder Client** - API client

---

## Code Structure

### Project Organization

```
src/
├── auth/                       # Authentication & Authorization
│   ├── csrf/                  # CSRF protection
│   │   ├── csrf.controller.ts # CSRF token endpoint
│   │   └── csrf.controller.spec.ts
│   ├── dto/                   # Data Transfer Objects
│   │   ├── create-auth.dto.ts
│   │   ├── update-auth.dto.ts
│   │   ├── login.dto.ts
│   │   └── user.dto.ts
│   ├── entities/              # Database entities
│   │   └── auth.entity.ts
│   ├── guards/                # Auth guards
│   │   └── jwt-auth.guard.ts
│   ├── lib/                   # Utilities
│   │   └── constant.ts        # JWT constants
│   ├── auth.controller.ts     # Auth endpoints
│   ├── auth.service.ts        # Auth business logic
│   ├── auth.module.ts         # Auth module
│   └── auth.service.spec.ts   # Unit tests
│
├── employee/                   # Employee module
│   └── leave/                 # Leave management
│       ├── dto/
│       ├── entities/
│       ├── leave.controller.ts
│       ├── leave.service.ts
│       └── leave.module.ts
│
├── hr/                        # HR module
│   └── announcement/          # Announcements
│       ├── dto/
│       ├── entities/
│       ├── announcement.controller.ts
│       ├── announcement.service.ts
│       └── announcement.module.ts
│
├── middleware/                # Custom middlewares
│   └── csrf.ts               # CSRF middleware
│
├── prisma.service.ts         # Prisma ORM service
├── app.controller.ts         # App root controller
├── app.service.ts            # App root service
├── app.module.ts             # Root module
└── main.ts                   # Application entry point
```

### Module Pattern

Setiap feature module mengikuti struktur:

```
feature/
├── dto/                  # Data Transfer Objects
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── entities/             # Database entities
│   └── feature.entity.ts
├── feature.controller.ts # HTTP endpoints
├── feature.service.ts    # Business logic
├── feature.module.ts     # Module definition
└── feature.*.spec.ts     # Tests
```

---

## Database Schema

### Core Tables

#### User

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String
  full_name  String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // Relations
  roles      UserRole[]
  leaves     Leave[]
  announcements Announcement[]
}
```

#### Role

```prisma
model Role {
  id          String   @id @default(uuid())
  name_role   String   @unique
  description String?

  // Relations
  users       UserRole[]
}
```

#### Leave

```prisma
model Leave {
  id          String    @id @default(uuid())
  user_id     String
  leave_type  String
  start_date  DateTime
  end_date    DateTime
  reason      String
  status      String    @default("pending")
  approved_by String?
  approved_at DateTime?
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  // Relations
  user        User      @relation(fields: [user_id], references: [id])
}
```

### Creating Migrations

```bash
# Create new migration
pnpm prisma migrate dev --name add_field_to_table

# Reset database (development only!)
pnpm prisma migrate reset

# Apply migrations in production
pnpm prisma migrate deploy
```

### Schema Best Practices

1. **Always use UUID** for primary keys
2. **Add timestamps** (created_at, updated_at)
3. **Use descriptive names** (snake_case for columns)
4. **Add indexes** for frequently queried fields
5. **Document relations** with comments

---

## Adding New Features

### Example: Adding a New Module

#### 1. Generate Module, Service, Controller

```bash
nest g module features/example
nest g service features/example
nest g controller features/example
```

#### 2. Create DTOs

`src/features/example/dto/create-example.dto.ts`:

```typescript
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  description: string;
}
```

#### 3. Create Entity

`src/features/example/entities/example.entity.ts`:

```typescript
export class Example {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}
```

#### 4. Update Prisma Schema

`prisma/schema.prisma`:

```prisma
model Example {
  id          String   @id @default(uuid())
  name        String
  description String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}
```

```bash
pnpm prisma migrate dev --name create_example_table
```

#### 5. Implement Service

`src/features/example/example.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateExampleDto } from './dto/create-example.dto';

@Injectable()
export class ExampleService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateExampleDto) {
    return this.prisma.example.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.example.findMany();
  }

  async findOne(id: string) {
    return this.prisma.example.findUnique({
      where: { id },
    });
  }
}
```

#### 6. Implement Controller

`src/features/example/example.controller.ts`:

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';

@Controller('example')
@UseGuards(JwtAuthGuard)
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  create(@Body() createDto: CreateExampleDto) {
    return this.exampleService.create(createDto);
  }

  @Get()
  findAll() {
    return this.exampleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exampleService.findOne(id);
  }
}
```

#### 7. Update Module

`src/features/example/example.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ExampleController],
  providers: [ExampleService, PrismaService],
  exports: [ExampleService],
})
export class ExampleModule {}
```

#### 8. Register in App Module

`src/app.module.ts`:

```typescript
import { ExampleModule } from './features/example/example.module';

@Module({
  imports: [
    // ... other modules
    ExampleModule,
  ],
})
export class AppModule {}
```

---

## Testing Guidelines

### Unit Tests

#### Service Test Example

`src/features/example/example.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExampleService } from './example.service';
import { PrismaService } from '../../prisma.service';

describe('ExampleService', () => {
  let service: ExampleService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: PrismaService,
          useValue: {
            example: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an example', async () => {
    const createDto = { name: 'Test', description: 'Test desc' };
    const expected = { id: '1', ...createDto, created_at: new Date() };

    jest.spyOn(prisma.example, 'create').mockResolvedValue(expected);

    const result = await service.create(createDto);
    expect(result).toEqual(expected);
  });
});
```

### E2E Tests

#### Controller E2E Test

`test/example.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Example (e2e)', () => {
  let app: INestApplication;
  let authCookies: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth cookies
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authCookies = loginResponse.headers['set-cookie'];
  });

  afterAll(async () => {
    await app.close();
  });

  it('/example (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/example')
      .set('Cookie', authCookies)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/example (POST)', async () => {
    const createDto = {
      name: 'Test Example',
      description: 'Test Description',
    };

    const response = await request(app.getHttpServer())
      .post('/example')
      .set('Cookie', authCookies)
      .send(createDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(createDto.name);
  });
});
```

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Specific test file
pnpm test auth.service.spec.ts

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

---

## Code Style

### ESLint Configuration

Project menggunakan ESLint dengan config berikut:

```bash
# Run linter
pnpm run lint

# Fix auto-fixable issues
pnpm run lint --fix
```

### Prettier Configuration

```bash
# Format code
pnpm run format
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions/Methods**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `IPascalCase` (optional prefix I)
- **Types**: `PascalCase`

### Import Order

```typescript
// 1. Node modules
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

// 2. Local modules
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

// 3. Types/Interfaces
import type { User } from './entities/user.entity';
```

---

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `staging` - Testing environment
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

### Commit Messages

Gunakan Conventional Commits:

```
feat: add user profile endpoint
fix: resolve token refresh issue
docs: update API documentation
test: add e2e tests for auth
refactor: optimize database queries
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create Pull Request
4. Wait for CI/CD checks
5. Request code review
6. Merge after approval

```bash
# Create feature branch
git checkout -b feature/add-notification

# Make changes and commit
git add .
git commit -m "feat: add notification system"

# Push to remote
git push origin feature/add-notification

# Create PR on GitHub
```

---

## Best Practices

### 1. Error Handling

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

async findOne(id: string) {
  const user = await this.prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  return user;
}
```

### 2. Validation

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### 3. Dependency Injection

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
}
```

### 4. Async/Await

```typescript
// Good
async getUser(id: string) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  return user;
}

// Avoid
getUser(id: string) {
  return this.prisma.user.findUnique({ where: { id } })
    .then(user => user);
}
```

### 5. Environment Variables

```typescript
// Good - use ConfigService
constructor(private config: ConfigService) {
  const port = this.config.get<number>('PORT');
}

// Avoid - direct process.env
const port = process.env.PORT;
```

### 6. Security

```typescript
// Always hash passwords
const hashedPassword = await bcrypt.hash(password, 10);

// Never expose sensitive data
delete user.password;

// Use DTOs for response
return plainToClass(UserDto, user);
```

---

## Debugging

### VS Code Launch Configuration

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

### Logging

```typescript
import { Logger } from '@nestjs/common';

export class UserService {
  private readonly logger = new Logger(UserService.name);

  async create(dto: CreateUserDto) {
    this.logger.log('Creating new user');
    this.logger.debug(`User data: ${JSON.stringify(dto)}`);

    try {
      const user = await this.prisma.user.create({ data: dto });
      this.logger.log(`User created: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error.stack);
      throw error;
    }
  }
}
```

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

## Getting Help

- Create issue di GitHub
- Hubungi lead developer
- Check existing documentation
- Review similar implementations

Happy Coding! 🚀
