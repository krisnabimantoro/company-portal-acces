# 📡 API Documentation

## Base URL

```
Development: http://localhost:3040
Production: https://your-domain.com
```

## Authentication

Semua endpoint yang memerlukan autentikasi menggunakan JWT token yang disimpan dalam HTTP-only cookies.

**Cookie Names**:

- Access Token: `<hashed_cookie_name>` (generated from `jwt_access`)
- Refresh Token: `<hashed_cookie_name>` (generated from `jwt_refresh`)

## Response Format

### Success Response

```json
{
  "statusCode": 200,
  "data": { ... }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## 🔐 Authentication Endpoints

### 1. Register

Mendaftarkan user baru.

**Endpoint**: `POST /auth/register`

**Rate Limit**: 3 requests/minute

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}
```

**Validation**:

- `email`: Valid email format, required
- `password`: Minimum 8 characters, required
- `full_name`: String, required

**Success Response** (201):

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- `400`: Validation error
- `409`: Email already exists
- `429`: Too many requests

---

### 2. Login

Login dengan email dan password.

**Endpoint**: `POST /auth/login`

**Rate Limit**: 5 requests/minute

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response** (201):

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "roles": [
      {
        "id": "uuid",
        "name_role": "employee",
        "description": "Employee role"
      }
    ]
  }
}
```

**Cookies Set**:

- `access_token`: JWT token (expires in 1 hour)
- `refresh_token`: Refresh token (expires in 7 days)

**Cookie Flags**:

- `HttpOnly`: true
- `SameSite`: Strict
- `Secure`: true (production only)

**Error Responses**:

- `400`: Validation error
- `401`: Invalid credentials
- `429`: Too many requests

---

### 3. Get Current User

Mendapatkan informasi user yang sedang login.

**Endpoint**: `GET /auth/me`

**Authentication**: Required (JWT)

**Success Response** (200):

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "roles": [
    {
      "id": "uuid",
      "name_role": "employee",
      "description": "Employee role"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- `401`: Unauthorized (no token or invalid token)

---

### 4. Refresh Token

Mendapatkan access token baru menggunakan refresh token.

**Endpoint**: `POST /auth/refresh`

**Authentication**: Required (Refresh Token)

**Success Response** (201):

```json
{
  "message": "Token refreshed successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Cookies Set**:

- `access_token`: New JWT token (expires in 1 hour)
- `refresh_token`: New refresh token (expires in 7 days)

**Error Responses**:

- `401`: Unauthorized (no refresh token or invalid)

---

### 5. Logout

Logout dan menghapus cookies.

**Endpoint**: `POST /auth/logout`

**Authentication**: Required (JWT)

**Success Response** (201):

```json
{
  "message": "Logout successful"
}
```

**Cookies Cleared**:

- `access_token`
- `refresh_token`

**Error Responses**:

- `401`: Unauthorized

---

### 6. Get CSRF Token

Mendapatkan CSRF token untuk form submissions.

**Endpoint**: `GET /auth/csrf/token`

**Authentication**: Not required

**Success Response** (200):

```json
{
  "csrfToken": "random-csrf-token-string"
}
```

---

## 📅 Leave Management Endpoints

### 1. Create Leave Request

Membuat pengajuan cuti baru.

**Endpoint**: `POST /employee/leave`

**Authentication**: Required (JWT)

**Rate Limit**: 5 requests/minute

**Request Body**:

```json
{
  "leave_type": "annual",
  "start_date": "2024-01-01",
  "end_date": "2024-01-05",
  "reason": "Family vacation"
}
```

**Leave Types**:

- `annual`: Annual leave
- `sick`: Sick leave
- `emergency`: Emergency leave
- `unpaid`: Unpaid leave

**Validation**:

- `leave_type`: Required, must be valid type
- `start_date`: Required, ISO date format
- `end_date`: Required, must be after start_date
- `reason`: Required, minimum 10 characters

**Success Response** (201):

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "leave_type": "annual",
  "start_date": "2024-01-01T00:00:00.000Z",
  "end_date": "2024-01-05T00:00:00.000Z",
  "reason": "Family vacation",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- `400`: Validation error
- `401`: Unauthorized
- `429`: Too many requests

---

### 2. Get Leave History

Mendapatkan riwayat cuti user.

**Endpoint**: `GET /employee/leave`

**Authentication**: Required (JWT)

**Query Parameters**:

- `status`: Filter by status (pending, approved, rejected)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Example**: `GET /employee/leave?status=approved&page=1&limit=10`

**Success Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "leave_type": "annual",
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-01-05T00:00:00.000Z",
      "reason": "Family vacation",
      "status": "approved",
      "approved_by": "uuid",
      "approved_at": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Error Responses**:

- `401`: Unauthorized

---

### 3. Update Leave Request

Mengupdate leave request (employee dapat cancel, HR dapat approve/reject).

**Endpoint**: `PATCH /employee/leave/:id`

**Authentication**: Required (JWT)

**Request Body** (Employee):

```json
{
  "status": "cancelled"
}
```

**Request Body** (HR/Admin):

```json
{
  "status": "approved",
  "notes": "Approved"
}
```

**Success Response** (200):

```json
{
  "id": "uuid",
  "status": "approved",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden (not allowed to update)
- `404`: Leave request not found

---

## 📢 Announcement Endpoints

### 1. Create Announcement

Membuat pengumuman baru (HR/Admin only).

**Endpoint**: `POST /hr/announcement`

**Authentication**: Required (JWT - HR/Admin role)

**Rate Limit**: 10 requests/minute

**Request Body**:

```json
{
  "title": "Company Update",
  "content": "Important announcement content here...",
  "priority": "high",
  "publish_date": "2024-01-01T00:00:00.000Z"
}
```

**Priority Levels**:

- `low`: Low priority
- `medium`: Medium priority
- `high`: High priority
- `urgent`: Urgent announcement

**Validation**:

- `title`: Required, minimum 5 characters
- `content`: Required, minimum 10 characters
- `priority`: Required, valid priority level
- `publish_date`: Optional, ISO date format

**Success Response** (201):

```json
{
  "id": "uuid",
  "title": "Company Update",
  "content": "Important announcement content here...",
  "priority": "high",
  "publish_date": "2024-01-01T00:00:00.000Z",
  "created_by": "uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden (not HR/Admin role)
- `429`: Too many requests

---

### 2. Get Announcements

Mendapatkan daftar pengumuman.

**Endpoint**: `GET /hr/announcement`

**Authentication**: Required (JWT)

**Query Parameters**:

- `priority`: Filter by priority
- `unread`: Show only unread (true/false)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Example**: `GET /hr/announcement?priority=high&unread=true&page=1`

**Success Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Company Update",
      "content": "Important announcement...",
      "priority": "high",
      "publish_date": "2024-01-01T00:00:00.000Z",
      "is_read": false,
      "created_by": {
        "id": "uuid",
        "full_name": "HR Manager"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Error Responses**:

- `401`: Unauthorized

---

### 3. Mark Announcement as Read

Menandai pengumuman sudah dibaca.

**Endpoint**: `POST /hr/announcement/:id/read`

**Authentication**: Required (JWT)

**Success Response** (200):

```json
{
  "message": "Announcement marked as read",
  "announcement_id": "uuid",
  "read_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- `401`: Unauthorized
- `404`: Announcement not found

---

### 4. Update Announcement

Mengupdate pengumuman (HR/Admin only).

**Endpoint**: `PATCH /hr/announcement/:id`

**Authentication**: Required (JWT - HR/Admin role)

**Request Body**:

```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "priority": "urgent"
}
```

**Success Response** (200):

```json
{
  "id": "uuid",
  "title": "Updated Title",
  "content": "Updated content",
  "priority": "urgent",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Announcement not found

---

### 5. Delete Announcement

Menghapus pengumuman (HR/Admin only).

**Endpoint**: `DELETE /hr/announcement/:id`

**Authentication**: Required (JWT - HR/Admin role)

**Success Response** (200):

```json
{
  "message": "Announcement deleted successfully",
  "id": "uuid"
}
```

**Error Responses**:

- `401`: Unauthorized
- `403`: Forbidden
- `404`: Announcement not found

---

## 🔒 Rate Limiting

### Global Rate Limits

- **Short**: 10 requests per second
- **Medium**: 100 requests per minute
- **Long**: 1000 requests per hour

### Endpoint-Specific Limits

| Endpoint                | Limit              |
| ----------------------- | ------------------ |
| `POST /auth/login`      | 5 requests/minute  |
| `POST /auth/register`   | 3 requests/minute  |
| `POST /employee/leave`  | 5 requests/minute  |
| `POST /hr/announcement` | 10 requests/minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Rate Limit Exceeded Response (429)

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## 🛡️ Security Headers

Semua responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📝 Error Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

## 🧪 Testing dengan cURL

### Login

```bash
curl -X POST http://localhost:3040/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123"}' \
  -c cookies.txt
```

### Get Current User

```bash
curl -X GET http://localhost:3040/auth/me \
  -b cookies.txt
```

### Create Leave Request

```bash
curl -X POST http://localhost:3040/employee/leave \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "leave_type": "annual",
    "start_date": "2024-01-01",
    "end_date": "2024-01-05",
    "reason": "Family vacation"
  }'
```

---

## 📊 Postman Collection

Import collection dari `docs/postman/` untuk testing dengan Postman.

**Environment Variables**:

- `base_url`: http://localhost:3040
- `access_token`: (auto-populated after login)
