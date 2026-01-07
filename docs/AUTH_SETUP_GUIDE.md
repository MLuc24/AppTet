# 🔐 Auth Module - Hướng dẫn Setup

## ✅ Đã hoàn thành

### 1. **Cài đặt dependencies** ✅
```bash
npm install
```

### 2. **Cập nhật .env** ✅
```env
# Database (khớp docker-compose.yml)
DATABASE_URL=postgresql://lms_user:lms_pass@localhost:5432/lms?schema=public

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Email (cấu hình sau)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@lms.com
```

### 3. **Prisma Schema** ✅
- ✅ Đã cập nhật `schema.prisma` để sử dụng schema `auth`
- ✅ Sử dụng UUID (khớp với `init.sql`)
- ✅ Mapping column names (snake_case)

---

## 🚀 Cần làm TIẾP THEO

### **Bước 1: Khởi động Docker**

```bash
# Trong thư mục root dự án
docker-compose up -d
```

Kiểm tra containers:
```bash
docker ps
```

Kết quả mong đợi:
```
lms_postgres   Up
lms_redis      Up
lms_mongodb    Up
kafka          Up
zookeeper      Up
```

---

### **Bước 2: Tạo bảng Auth trong database**

**Option A: Sử dụng Prisma Migrate (Khuyến nghị)**

```bash
cd apps/backend-api

# Tạo migration từ schema
npx prisma migrate dev --name init_auth_tables --schema=src/infrastructure/database/prisma/schema.prisma

# Generate Prisma Client (đã làm rồi)
npx prisma generate --schema=src/infrastructure/database/prisma/schema.prisma
```

**Option B: Thêm vào `init.sql` (Nếu muốn quản lý bằng SQL thuần)**

Thêm vào file `infrastructure/postgres/init.sql`:

```sql
-- Auth Tables
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_token_expires TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_token_expires TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON auth.refresh_tokens(token_hash);
```

Sau đó:
```bash
docker-compose down -v
docker-compose up -d
```

---

### **Bước 3: Prisma Studio (Xem database)**

```bash
npx prisma studio --schema=src/infrastructure/database/prisma/schema.prisma
```

Mở: http://localhost:5555

---

### **Bước 4: Chạy backend server**

```bash
cd apps/backend-api
npm run start:dev
```

Swagger API Docs: http://localhost:3000/api

---

## 📚 Kiến trúc đã implement

```
apps/backend-api/src/
├── domain/                      # 🟢 BUSINESS LOGIC (Framework-agnostic)
│   ├── entities/
│   │   ├── user.entity.ts       # User domain với business rules
│   │   └── refresh-token.entity.ts
│   ├── ports/                   # Interfaces (Dependency Inversion)
│   │   ├── user-repository.port.ts
│   │   ├── refresh-token-repository.port.ts
│   │   ├── token-service.port.ts
│   │   ├── hash-service.port.ts
│   │   └── email-service.port.ts
│   ├── errors/
│   │   └── auth.errors.ts       # Custom domain exceptions
│   └── events/
│       ├── user-registered.event.ts
│       ├── password-reset-requested.event.ts
│       └── user-logged-in.event.ts
│
├── infrastructure/              # 🔧 TECHNICAL IMPLEMENTATIONS
│   ├── database/
│   │   ├── prisma/
│   │   │   └── schema.prisma    # ✅ Sử dụng schema "auth"
│   │   └── repositories/
│   │       ├── user.repository.ts          # Prisma implementation
│   │       └── refresh-token.repository.ts
│   ├── auth/
│   │   ├── jwt-token.service.ts   # JWT implementation
│   │   └── bcrypt-hash.service.ts # Bcrypt implementation
│   └── email/
│       └── email.service.ts       # Email implementation (stub)
│
├── modules/                     # 🌐 APPLICATION LAYER
│   └── auth/
│       ├── auth.controller.ts   # 9 REST endpoints
│       ├── auth.service.ts      # Orchestration (350 LOC)
│       ├── auth.module.ts       # DI container
│       ├── auth.dto.ts          # Request/Response DTOs
│       ├── auth.types.ts        # Constants
│       └── strategies/
│           └── jwt.strategy.ts  # Passport JWT
│
└── common/                      # 🛡️ SHARED UTILITIES
    ├── guards/
    │   ├── auth.guard.ts        # Global JWT guard
    │   └── role.guard.ts        # Role-based access
    └── decorators/
        ├── public.decorator.ts  # @Public()
        ├── current-user.decorator.ts  # @CurrentUser()
        └── roles.decorator.ts   # @Roles('ADMIN')
```

---

## 🔥 9 API Endpoints đã sẵn sàng

### **Public Routes** (Không cần JWT)
```http
POST   /api/auth/register          # Đăng ký + gửi email xác thực
POST   /api/auth/login             # Login (kiểm tra emailVerified)
GET    /api/auth/verify-email      # Xác thực email qua token
POST   /api/auth/forgot-password   # Quên mật khẩu (gửi email)
POST   /api/auth/reset-password    # Reset mật khẩu qua token
POST   /api/auth/refresh           # Refresh access token
```

### **Protected Routes** (Cần JWT)
```http
POST   /api/auth/change-password   # Đổi mật khẩu (cần oldPassword)
POST   /api/auth/logout            # Logout (xóa refresh token)
GET    /api/auth/profile           # Lấy thông tin user
```

---

## ✅ Đặc điểm nổi bật

### 1. **Email Verification theo yêu cầu** ✅
- Register → Gửi email với verification token
- Login → Check `emailVerified = true` mới cho phép
- Token expire sau 24h

### 2. **Clean Architecture** ✅
- Domain Layer: Không phụ thuộc framework
- Ports/Adapters: Dễ dàng thay thế ORM (Prisma → TypeORM)
- Test-friendly: Mock repositories dễ dàng

### 3. **Security Best Practices** ✅
- Bcrypt hash passwords (10 rounds)
- JWT với access (15m) + refresh tokens (7d)
- Token rotation khi refresh
- Cascade delete refresh tokens

### 4. **Prisma với PostgreSQL Schemas** ✅
- Sử dụng `@@schema("auth")` để tách biệt
- UUID với `uuid_generate_v4()`
- Snake_case column names
- Indexes tối ưu

---

## 🐛 Troubleshooting

### **Docker không chạy**
```bash
# Windows: Mở Docker Desktop
# Kiểm tra
docker ps
```

### **Database connection failed**
```bash
# Test connection
docker exec -it lms_postgres psql -U lms_user -d lms -c '\dt auth.*'
```

### **Prisma errors**
```bash
# Re-generate client
npx prisma generate --schema=src/infrastructure/database/prisma/schema.prisma

# Reset database (cẩn thận: xóa data!)
npx prisma migrate reset --schema=src/infrastructure/database/prisma/schema.prisma
```

---

## 📖 Tài liệu tham khảo

- [AUTH_CHECKLIST.md](./AUTH_CHECKLIST.md) - Chi tiết implementation
- [BACKEND_GUIDELINES.md](./BACKEND_GUIDELINES.md) - Chuẩn kiến trúc
- [DATABASE_SETUP.md](../infrastructure/DATABASE_SETUP.md) - Docker setup

---

## 🚧 TODO (Tương lai)

- [ ] Implement Google OAuth Strategy
- [ ] Cấu hình email service thực (Gmail/SendGrid)
- [ ] Rate limiting cho endpoints
- [ ] Email templates (HTML/CSS)
- [ ] Refresh token rotation tracking
- [ ] 2FA (Two-Factor Authentication)
- [ ] Session management (Redis)

---

## 🎉 **Kết luận**

Auth module đã sẵn sàng với:
- ✅ 9 endpoints RESTful
- ✅ Email verification workflow
- ✅ Clean Architecture
- ✅ Prisma + PostgreSQL schema "auth"
- ✅ JWT + Refresh tokens
- ✅ Guards & Decorators

**Chỉ cần:** Khởi động Docker → Run migrate → Start server! 🚀
