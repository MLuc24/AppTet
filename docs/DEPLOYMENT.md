# Deployment Guide – Docker-first, Scalable, Production-ready

Version: 1.0  
Scope: Backend API + Infrastructure  
Target: Local / Staging / Production

---

## 1. MỤC TIÊU TRIỂN KHAI

- Chạy được toàn hệ thống chỉ với **1 lệnh**
- Môi trường **local ≈ staging ≈ production**
- Không phụ thuộc máy dev
- Dễ scale và rollback
- Không lock-in hạ tầng

---

## 2. TỔNG QUAN MÔ HÌNH DEPLOY

### 2.1 Kiến trúc triển khai

```
Client (Mobile App)
       ↓ HTTPS
Backend API (NestJS)
       ↓
────────────────────────────
PostgreSQL (Core Data)
Redis (Cache / Rate limit)
Kafka (Event stream)
Cloudflare R2 (File storage)
────────────────────────────
```

### 2.2 Nguyên tắc

- Backend **stateless**
- Infra chạy bằng Docker
- Secret qua ENV, không hardcode
- Có thể thay thế service mà không sửa code

---

## 3. CÁC MÔI TRƯỜNG (ENVIRONMENTS)

| Môi trường   | Mục đích         |
| ------------ | ---------------- |
| `local`      | Dev cá nhân      |
| `staging`    | Test tích hợp    |
| `production` | Người dùng thật  |

Mỗi môi trường có:

- `.env`
- DB riêng
- Redis riêng
- Kafka riêng

---

## 4. DOCKER STRATEGY (BẮT BUỘC)

### 4.1 Lý do dùng Docker

- Đồng nhất môi trường
- Dễ onboard
- Dễ CI/CD
- Tránh "chạy được trên máy tao"

---

## 5. DOCKER COMPOSE – LOCAL / STAGING

### 5.1 File: `docker-compose.yml`

```yaml
version: "3.9"

services:
  api:
    build: ./apps/backend-api
    container_name: lms_api
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
      - kafka
    restart: unless-stopped

  postgres:
    image: postgres:15
    container_name: lms_postgres
    environment:
      POSTGRES_DB: lms
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: lms_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    container_name: lms_redis
    ports:
      - "6379:6379"

  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    container_name: lms_zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    container_name: lms_kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

volumes:
  postgres_data:
```

---

## 6. BACKEND DOCKERFILE (PRODUCTION SAFE)

### 6.1 File: `apps/backend-api/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Nguyên tắc:

- Multi-stage build
- Không copy source TS vào image production
- Image nhỏ, nhanh

---

## 7. ENV CONFIGURATION

### 7.1 `.env.example`

```env
# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://lms_user:lms_pass@postgres:5432/lms

# Redis
REDIS_URL=redis://redis:6379

# Kafka
KAFKA_BROKERS=kafka:9092

# Auth
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudflare R2
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_BUCKET=lms-files
R2_ACCESS_KEY=change_me
R2_SECRET_KEY=change_me
R2_PUBLIC_URL=https://cdn.yourdomain.com

# AI
OPENAI_API_KEY=change_me
```

⚠️ **Không commit `.env` thật**

---

## 8. DATABASE MIGRATION & SEED

### 8.1 Migration

```bash
docker compose exec api npx prisma migrate deploy
```

### 8.2 Seed (dev/staging)

```bash
docker compose exec api npx prisma db seed
```

### Nguyên tắc:

- Migration chạy khi deploy
- Seed chỉ dùng cho dev/staging

---

## 9. CLOUDFLARE R2 DEPLOY

### 9.1 Setup

1. Tạo R2 bucket
2. Cấu hình public/private
3. Gán custom domain (CDN)

### 9.2 Lưu trữ

- Backend chỉ lưu metadata
- File upload qua signed URL (khuyến nghị)

```
lessons/{lessonId}/audio/{file}
lessons/{lessonId}/images/{file}
users/{userId}/avatar/{file}
```

---

## 10. STAGING & PRODUCTION DEPLOY

### 10.1 Backend API

Khuyến nghị:

- Railway / Render / Fly.io
- Container-based

### 10.2 Database

- Supabase / Neon / AWS RDS

### 10.3 Redis

- Upstash Redis / Redis Cloud

### 10.4 Kafka

- Confluent Cloud / Upstash Kafka

⚠️ **Local dùng Docker – Production dùng Managed Service (không đổi code)**

---

## 11. CI/CD PIPELINE (GỢI Ý)

### 11.1 GitHub Actions flow

1. Lint
2. Test
3. Build Docker image
4. Push image
5. Deploy

```yaml
- run: npm ci
- run: npm run lint
- run: npm test
- run: docker build .
```

---

## 12. HEALTH CHECK & MONITORING

### 12.1 Health check endpoint

```bash
GET /api/v1/health
```

Check:

- DB connection
- Redis ping
- Kafka producer ready

### 12.2 Logging

- Request ID
- Error level
- No PII

---

## 13. SCALING STRATEGY

### 13.1 Horizontal scaling

- API stateless → scale container
- Redis/Kafka handle shared state

### 13.2 Bottleneck handling

- Cache heavy read
- Async heavy tasks via Kafka

---

## 14. BACKUP & ROLLBACK

### 14.1 Database

- Managed DB auto backup
- Manual snapshot trước migration lớn

### 14.2 Rollback

- Rollback container version
- Prisma migrate rollback (cẩn thận)

---

## 15. DEPLOYMENT CHECKLIST (BẮT BUỘC)

- [ ] ENV đầy đủ
- [ ] DB migrate thành công
- [ ] Redis/Kafka kết nối OK
- [ ] R2 upload test OK
- [ ] Health check pass
- [ ] Không log secret
- [ ] HTTPS enabled
