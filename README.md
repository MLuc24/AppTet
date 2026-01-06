# Language Learning Platform

Monorepo cho ứng dụng học ngoại ngữ với AI.

## 📁 Cấu trúc

```
├── apps/
│   ├── mobile-app/      # React Native (Expo)
│   ├── admin-web/       # Admin CMS (Next.js)
│   └── backend-api/     # Backend (NestJS)
├── packages/
│   ├── shared-types/    # DTO, enums dùng chung
│   ├── eslint-config/   # Coding convention
│   └── tsconfig-base/   # TS config
├── infrastructure/
│   ├── docker/          # Docker Compose
│   ├── kafka/           # Kafka config
│   ├── redis/           # Redis config
│   └── cloudflare-r2/   # R2 policy
├── docs/                # Documentation
└── scripts/             # Automation scripts
```

## 🚀 Quick Start

```bash
# 1. Setup environment
./scripts/setup-env.sh

# 2. Start infrastructure
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 3. Run apps
npm run mobile    # Mobile app
npm run backend   # Backend API
npm run admin     # Admin web
```

## 📚 Documentation

- [FE Guidelines](./docs/FE_GUIDELINES.md)
- [Backend Guidelines](./docs/BACKEND_GUIDELINES.md)
- [API Contract](./docs/API_CONTRACT.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment](./docs/DEPLOYMENT.md)

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile | React Native + Expo |
| Admin | Next.js |
| Backend | NestJS |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | Kafka |
| Storage | Cloudflare R2 |
