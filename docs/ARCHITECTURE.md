# Architecture Overview

Version: 1.0

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
├─────────────────────────────────────────────────────────────┤
│  Mobile App (React Native)  │  Admin Web (Next.js)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API (NestJS)                     │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  User  │  Course  │  Lesson  │  Learning  │  AI    │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │    Redis    │  │   MongoDB   │  │    Kafka    │  │ Cloudflare  │
│ (Core Data) │  │   (Cache)   │  │ (AI Data)   │  │  (Events)   │  │  R2 (Files) │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Backend Architecture (Lean Clean)

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION                            │
│              Controllers, DTOs, Guards, Pipes                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       APPLICATION                            │
│                  UseCases / Services                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         DOMAIN                               │
│            Entities, Ports (Interfaces), Rules               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                           │
│         Prisma, Redis, Kafka, R2 Adapters                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Learning Flow

```
1. User mở lesson
   └─► GET /lessons/:id
       └─► Cache check (Redis)
           └─► DB query (PostgreSQL)

2. User làm exercise
   └─► POST /exercises/:id/answer
       └─► Validate answer
           └─► Update progress
               └─► Emit event (Kafka)

3. User hoàn thành lesson
   └─► POST /lessons/:id/complete
       └─► Calculate score
           └─► Update streak (Redis)
               └─► Emit lesson.completed
```

---

## Technology Decisions

| Component | Technology | Reason |
|-----------|------------|--------|
| Mobile | React Native + Expo | Cross-platform, fast dev |
| Admin | Next.js | SSR, React ecosystem |
| Backend | NestJS | TypeScript, modular |
| Database | PostgreSQL | ACID, JSON support |
| Cache | Redis | Fast, pub/sub |
| Queue | Kafka | Event streaming |
| Storage | Cloudflare R2 | S3-compatible, cheap |

---

## Scalability Path

```
Phase 1 (MVP):
  - Monolith backend
  - Single DB instance
  - Docker Compose

Phase 2:
  - Horizontal scale API
  - Read replicas
  - Managed services

Phase 3:
  - Microservices (if needed)
  - Event-driven architecture
  - Multi-region
```
