# Auth Module Implementation Checklist

**Version:** 1.0  
**Target:** Authentication & Authorization for LMS Platform  
**Tech Stack:** NestJS + JWT + Passport + Google OAuth + Redis + PostgreSQL

---

## 📋 OVERVIEW

Module auth cung cấp đầy đủ chức năng xác thực và phân quyền cho hệ thống:

- ✅ Register (đăng ký với email/password)
- ✅ Login (đăng nhập email/password)
- ✅ Login with Google OAuth 2.0
- ✅ Forgot Password (reset password qua email)
- ✅ Reset Password
- ✅ Refresh Token (làm mới access token)
- ✅ Logout
- ✅ Change Password (đổi mật khẩu khi đã đăng nhập)
- ✅ Email Verification (xác thực email)

---

## 🏗️ ARCHITECTURE (Tuân thủ BACKEND_GUIDELINES.md)

### Domain Layer (Framework-Agnostic)

```
domain/
  entities/
    ✅ user.entity.ts                    # User domain entity
    ✅ refresh-token.entity.ts           # Refresh token entity
  ports/
    ✅ user-repository.port.ts           # Interface cho user repo
    ✅ token-service.port.ts             # Interface cho JWT/token
    ✅ hash-service.port.ts              # Interface cho bcrypt
    ✅ email-service.port.ts             # Interface cho email
  errors/
    ✅ auth.errors.ts                    # Domain errors (InvalidCredentials, etc.)
  events/
    ✅ user-registered.event.ts          # Event khi user đăng ký
    ✅ password-reset-requested.event.ts # Event forgot password
```

### Infrastructure Layer (Adapters)

```
infrastructure/
  database/
    repositories/
      ✅ user.repository.ts              # Prisma implementation
      ✅ refresh-token.repository.ts     # Prisma implementation
  auth/
    ✅ jwt.service.ts                    # JWT service implementation
    ✅ bcrypt.service.ts                 # Hash service implementation
    ✅ google-oauth.service.ts           # Google OAuth adapter
  email/
    ✅ email.service.ts                  # Email service (Resend/SendGrid)
  cache/
    ✅ redis-rate-limit.service.ts       # Rate limiting
```

### Application Layer (Modules)

```
modules/auth/
  ✅ auth.controller.ts                  # REST endpoints
  ✅ auth.service.ts                     # Orchestration service
  ✅ auth.dto.ts                         # All DTOs (request/response)
  ✅ auth.module.ts                      # Module definition
  ✅ auth.types.ts                       # Constants, enums, types
  strategies/
    ✅ jwt.strategy.ts                   # Passport JWT strategy
    ✅ google.strategy.ts                # Passport Google strategy
```

### Common (Shared)

```
common/
  guards/
    ✅ auth.guard.ts                     # JWT auth guard (đã có)
    ✅ role.guard.ts                     # Role-based guard (đã có)
  decorators/
    ✅ public.decorator.ts               # @Public() cho public routes
    ✅ current-user.decorator.ts         # @CurrentUser() lấy user từ request
    ✅ roles.decorator.ts                # @Roles('admin')
  pipes/
    ✅ validation.pipe.ts                # Global validation (đã có)
```

---

## 📦 DEPENDENCIES CẦN CÀI ĐẶT

```bash
# Core auth
npm install @nestjs/passport passport passport-jwt passport-google-oauth20
npm install @nestjs/jwt bcryptjs

# Types
npm install -D @types/passport-jwt @types/passport-google-oauth20 @types/bcryptjs

# Email (chọn 1)
npm install resend  # hoặc @sendgrid/mail

# Validation
npm install class-validator class-transformer

# Redis (đã có)
npm install ioredis
```

---

## 🗄️ DATABASE SCHEMA (Prisma)

### User Model

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  username          String?   @unique
  passwordHash      String?   # null nếu login bằng Google
  firstName         String?
  lastName          String?
  avatar            String?
  role              Role      @default(STUDENT)
  provider          Provider  @default(LOCAL)  # LOCAL | GOOGLE
  providerId        String?   # Google user ID
  emailVerified     Boolean   @default(false)
  emailVerifyToken  String?   @unique
  passwordResetToken String?  @unique
  passwordResetExpiry DateTime?
  lastLoginAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  refreshTokens     RefreshToken[]
  // relations khác...
}

enum Role {
  STUDENT
  CONTENT_ADMIN
  ADMIN
}

enum Provider {
  LOCAL
  GOOGLE
}
```

### RefreshToken Model

```prisma
model RefreshToken {
  id          String   @id @default(cuid())
  userId      String
  tokenHash   String   @unique
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

---

## 🔐 AUTH FLOW DETAILS

### 1. Register Flow

**Endpoint:** `POST /api/v1/auth/register`

```typescript
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "emailVerified": false
    }
  }
}
```

**Checklist:**
- [ ] Validate email format, password strength
- [ ] Check email không trùng
- [ ] Hash password với bcrypt (salt rounds: 10)
- [ ] Generate email verification token
- [ ] Save user vào DB
- [ ] Send verification email
- [ ] Emit `UserRegisteredEvent`
- [ ] Rate limit: 5 requests/IP/hour

### 2. Login Flow

**Endpoint:** `POST /api/v1/auth/login`

```typescript
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,  // 15 minutes
    "user": { "id": "...", "email": "...", "role": "STUDENT" }
  }
}
```

**Checklist:**
- [ ] Validate credentials
- [ ] Compare password hash
- [ ] Generate JWT access token (exp: 15min)
- [ ] Generate refresh token (exp: 7 days)
- [ ] Hash refresh token và lưu DB
- [ ] Update lastLoginAt
- [ ] Return tokens + user info
- [ ] Rate limit: 10 requests/IP/15min

### 3. Google OAuth Flow

**Endpoint:** `GET /api/v1/auth/google` → `GET /api/v1/auth/google/callback`

**Checklist:**
- [ ] Setup Google OAuth app (client ID, secret)
- [ ] Implement GoogleStrategy với Passport
- [ ] Redirect user to Google consent screen
- [ ] Handle callback với Google profile
- [ ] Find or create user (provider: GOOGLE)
- [ ] Set emailVerified = true
- [ ] Generate access + refresh tokens
- [ ] Redirect to frontend with tokens

### 4. Forgot Password Flow

**Endpoint:** `POST /api/v1/auth/forgot-password`

```typescript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  }
}
```

**Checklist:**
- [ ] Check email tồn tại
- [ ] Generate secure reset token (UUID)
- [ ] Set passwordResetExpiry (1 hour)
- [ ] Save token vào DB
- [ ] Send reset email với link
- [ ] Emit `PasswordResetRequestedEvent`
- [ ] Rate limit: 3 requests/email/hour

### 5. Reset Password Flow

**Endpoint:** `POST /api/v1/auth/reset-password`

```typescript
// Request
{
  "token": "uuid-token",
  "newPassword": "NewSecurePass123!"
}
```

**Checklist:**
- [ ] Validate token exists và chưa expire
- [ ] Validate new password strength
- [ ] Hash new password
- [ ] Update user password
- [ ] Clear passwordResetToken, passwordResetExpiry
- [ ] Invalidate all refresh tokens
- [ ] Send confirmation email

### 6. Refresh Token Flow

**Endpoint:** `POST /api/v1/auth/refresh`

```typescript
// Request
{
  "refreshToken": "eyJhbGc..."
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "new-access-token",
    "expiresIn": 900
  }
}
```

**Checklist:**
- [ ] Verify refresh token signature
- [ ] Check token hash trong DB
- [ ] Check expiry
- [ ] Generate new access token
- [ ] Return new access token

### 7. Logout Flow

**Endpoint:** `POST /api/v1/auth/logout`

```typescript
// Request (Authorization: Bearer <access-token>)
{
  "refreshToken": "eyJhbGc..."
}
```

**Checklist:**
- [ ] Delete refresh token từ DB
- [ ] Optional: blacklist access token trong Redis (nếu cần)

### 8. Email Verification

**Endpoint:** `GET /api/v1/auth/verify-email?token=xxx`

**Checklist:**
- [ ] Validate token
- [ ] Set emailVerified = true
- [ ] Clear emailVerifyToken
- [ ] Redirect to success page

### 9. Change Password

**Endpoint:** `POST /api/v1/auth/change-password` (authenticated)

```typescript
// Request
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Checklist:**
- [ ] Verify current password
- [ ] Validate new password strength
- [ ] Hash and update password
- [ ] Invalidate all refresh tokens
- [ ] Send confirmation email

---

## 🛡️ SECURITY REQUIREMENTS

### JWT Configuration

- [ ] Access token: RS256, exp: 15 minutes
- [ ] Refresh token: RS256, exp: 7 days
- [ ] Store private key in env (không commit)
- [ ] Include user ID, email, role trong payload

### Password Policy

- [ ] Min 8 characters
- [ ] At least 1 uppercase, 1 lowercase, 1 number
- [ ] Optional: 1 special character
- [ ] Bcrypt salt rounds: 10

### Rate Limiting (Redis)

```typescript
const RATE_LIMITS = {
  LOGIN: { max: 10, window: 15 * 60 },      // 10 req/15min
  REGISTER: { max: 5, window: 60 * 60 },    // 5 req/hour
  FORGOT_PASSWORD: { max: 3, window: 60 * 60 }, // 3 req/hour
};
```

### Validation Rules

- [ ] Email: isEmail() validator
- [ ] Password: custom regex validator
- [ ] All DTOs có class-validator decorators
- [ ] Global ValidationPipe enabled

---

## 🧪 TESTING CHECKLIST

### Unit Tests (auth.service.spec.ts)

- [ ] Register: success case
- [ ] Register: email already exists
- [ ] Login: success case
- [ ] Login: invalid credentials
- [ ] Login: user not found
- [ ] Forgot password: success
- [ ] Reset password: success
- [ ] Reset password: expired token
- [ ] Refresh token: success
- [ ] Refresh token: invalid token

### Integration Tests (auth.e2e-spec.ts)

- [ ] POST /auth/register → 201
- [ ] POST /auth/login → 200 with tokens
- [ ] POST /auth/login (wrong password) → 401
- [ ] GET /auth/google → redirect
- [ ] POST /auth/refresh → 200
- [ ] POST /auth/logout → 200

---

## 📝 IMPLEMENTATION ORDER

### Phase 1: Foundation (Day 1)
- [ ] 1.1 Tạo Prisma schema (User, RefreshToken)
- [ ] 1.2 Migrate database
- [ ] 1.3 Tạo domain entities
- [ ] 1.4 Tạo domain ports (interfaces)
- [ ] 1.5 Tạo domain errors

### Phase 2: Infrastructure (Day 1-2)
- [ ] 2.1 Implement UserRepository (Prisma)
- [ ] 2.2 Implement RefreshTokenRepository
- [ ] 2.3 Implement JwtService
- [ ] 2.4 Implement BcryptService
- [ ] 2.5 Implement EmailService (stub cho MVP)
- [ ] 2.6 Implement RedisRateLimitService

### Phase 3: Auth Module Core (Day 2)
- [ ] 3.1 Tạo auth DTOs (register, login, refresh, etc.)
- [ ] 3.2 Tạo auth.service.ts (orchestration)
- [ ] 3.3 Tạo auth.controller.ts
- [ ] 3.4 Tạo auth.module.ts với providers
- [ ] 3.5 Tạo JWT strategy
- [ ] 3.6 Tạo guards, decorators

### Phase 4: Google OAuth (Day 3)
- [ ] 4.1 Setup Google OAuth app
- [ ] 4.2 Implement GoogleStrategy
- [ ] 4.3 Add Google routes vào controller
- [ ] 4.4 Test OAuth flow

### Phase 5: Forgot/Reset Password (Day 3)
- [ ] 5.1 Implement forgot password endpoint
- [ ] 5.2 Implement reset password endpoint
- [ ] 5.3 Email template cho reset
- [ ] 5.4 Test full flow

### Phase 6: Polish & Testing (Day 4)
- [ ] 6.1 Add rate limiting cho tất cả endpoints
- [ ] 6.2 Add Swagger decorators
- [ ] 6.3 Write unit tests
- [ ] 6.4 Write e2e tests
- [ ] 6.5 Error handling hoàn chỉnh

---

## 🚀 ENVIRONMENT VARIABLES

```env
# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourapp.com

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3001

# Redis (rate limit)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## ✅ DEFINITION OF DONE

Module auth được coi là hoàn thành khi:

- [x] Tất cả endpoints hoạt động đúng
- [x] Swagger docs đầy đủ
- [x] Validation đầy đủ cho tất cả DTOs
- [x] Rate limiting cho sensitive endpoints
- [x] Unit tests coverage > 80%
- [x] E2E tests cho happy paths
- [x] Google OAuth flow hoạt động
- [x] Email verification hoạt động
- [x] Forgot/reset password hoạt động
- [x] Không file nào > 500 dòng
- [x] Tuân thủ BACKEND_GUIDELINES.md
- [x] Error handling thống nhất
- [x] Không leak Prisma models ra response

---

## 📚 REFERENCES

- [NestJS Auth Documentation](https://docs.nestjs.com/security/authentication)
- [Passport.js Strategies](http://www.passportjs.org/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- BACKEND_GUIDELINES.md (tuân thủ nghiêm ngặt)

---

**Last Updated:** 2026-01-07  
**Status:** Ready for Implementation 🚀
