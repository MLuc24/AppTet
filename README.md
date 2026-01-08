# Language Learning Platform - Backend

Backend monorepo cho ứng dụng học ngoại ngữ với AI.

## 📦 Cấu trúc

```
be/
├── apps/
│   ├── backend-api/     # NestJS Backend API
│   ├── mobile-app/      # React Native (Expo)
│   └── admin-web/       # Next.js Admin CMS
├── packages/
│   ├── shared-types/    # Shared TypeScript types
│   ├── eslint-config/   # ESLint configuration
│   └── tsconfig-base/   # Base TypeScript config
├── infrastructure/
│   ├── docker/          # Docker configurations
│   ├── postgres/        # PostgreSQL setup
│   ├── redis/           # Redis configuration
│   ├── mongodb/         # MongoDB setup
│   ├── kafka/           # Kafka configuration
│   └── cloudflare-r2/   # R2 storage policies
├── package.json         # Workspace configuration
├── docker-compose.yml   # Docker Compose setup
└── .env                 # Environment variables
```

## 🚀 Quick Start

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Setup môi trường

```bash
# Copy .env.example sang .env
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
```

### 3. Khởi động infrastructure

```bash
docker compose up -d
```

### 4. Chạy ứng dụng

```bash
# Backend API (port 3000)
npm run backend

# Mobile App (Expo)
npm run mobile

# Admin Web (port 3001)
npm run admin
```

## 📝 Scripts

```bash
# Development
npm run backend    # Start backend API
npm run mobile     # Start mobile app
npm run admin      # Start admin web

# Code quality
npm run lint       # Lint all workspaces
npm run test       # Test all workspaces
npm run format     # Format code with Prettier
```

## 🛠 Tech Stack

| Component | Technology | Port |
|-----------|------------|------|
| Backend API | NestJS | 3000 |
| Mobile App | React Native + Expo | - |
| Admin Web | Next.js | 3001 |
| Database | PostgreSQL | 5432 |
| Cache | Redis | 6379 |
| Message Queue | Kafka | 9092 |
| NoSQL | MongoDB | 27017 |
| Storage | Cloudflare R2 | - |

## 🗄️ Database

### PostgreSQL
- Host: localhost:5432
- Database: lms
- User: lms_user
- Password: lms_pass

### MongoDB
- Host: localhost:27017
- Database: lms_ai
- User: lms_user
- Password: lms_pass

### Redis
- Host: localhost:6379

## 📚 Tài liệu

Tài liệu chi tiết được lưu trong thư mục `docs/` ở thư mục gốc:

- Architecture & Design
- API Documentation
- Database Schema
- Deployment Guide
- Development Guidelines

## 🔧 Development

### Thêm workspace mới

```bash
# Tạo app mới
mkdir -p apps/new-app
cd apps/new-app
npm init -y

# Hoặc tạo package mới
mkdir -p packages/new-package
cd packages/new-package
npm init -y
```

### Sử dụng shared packages

```json
{
  "dependencies": {
    "@lms/shared-types": "*"
  }
}
```

## 🐳 Docker

### Khởi động tất cả services

```bash
docker compose up -d
```

### Xem logs

```bash
docker compose logs -f [service-name]
```

### Dừng services

```bash
docker compose down
```

### Reset database

```bash
docker compose down -v
docker compose up -d
```

## 🔐 Environment Variables

Các biến môi trường cần thiết (xem `.env.example`):

```env
# Database
DATABASE_URL=postgresql://lms_user:lms_pass@localhost:5432/lms
MONGODB_URI=mongodb://lms_user:lms_pass@localhost:27017/lms_ai

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKERS=localhost:9092

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
```

## 📦 Workspaces

Dự án sử dụng npm workspaces để quản lý monorepo:

- `@lms/backend-api` - Backend API
- `@lms/mobile-app` - Mobile application
- `@lms/admin-web` - Admin web interface
- `@lms/shared-types` - Shared TypeScript types
- `@lms/eslint-config` - Shared ESLint config
- `@lms/tsconfig-base` - Base TypeScript config

## 🆘 Troubleshooting

### Port đã được sử dụng

```bash
# Kiểm tra port đang sử dụng
netstat -ano | findstr :3000

# Hoặc thay đổi port trong .env
```

### Docker không khởi động

```bash
# Kiểm tra Docker đang chạy
docker ps

# Restart Docker Desktop
```

### Dependencies lỗi

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

Private - All rights reserved
