# Backend Guidelines – Lean Clean Architecture (NestJS)

Version: 1.0  
Target: LMS + AI Backend for Language Learning App  
Stack: NestJS + PostgreSQL + Redis + Kafka + Cloudflare R2  
Constraint: mỗi file/class < 500 dòng

---

## 1) MỤC TIÊU

- Build nhanh cho MVP nhưng **không nợ kiến trúc**
- Module hóa theo feature, tránh "God service"
- Dễ test UseCase/Service (mock repo, mock redis/kafka/r2)
- Sẵn sàng nâng cấp: modular monolith → microservices
- Không phụ thuộc vendor: DB/Redis/Kafka/R2 có thể thay thế

---

## 2) NGUYÊN TẮC KIẾN TRÚC (LEAN CLEAN)

Giữ Clean Architecture ở mức vừa đủ để team nhỏ triển khai nhanh.

### 2.1 Layering tối giản

- **Presentation**: Controller, DTO, Guards, Pipes
- **Application**: UseCases / Services orchestration
- **Domain**: Entities, Interfaces (Repository ports), Business rules
- **Infrastructure**: Prisma, Redis, Kafka, R2 adapters (implement ports)

### 2.2 Rule cứng

- Controller **KHÔNG** chứa business logic
- Domain **KHÔNG** import NestJS/Prisma/Redis/Kafka
- Application chỉ gọi Domain + Ports (interfaces)
- Infrastructure implement ports, không chứa business rule

---

## 3) TECH STACK & THƯ VIỆN KHUYẾN NGHỊ

### Core

- NestJS (TypeScript strict)
- Prisma ORM
- PostgreSQL (Core transactional)
- Redis (cache, rate limit, ephemeral state)
- Kafka (event streaming)
- Cloudflare R2 (object storage)

### Supporting

- class-validator + class-transformer (DTO validation)
- Swagger/OpenAPI (API doc)
- Jest + Supertest (unit + integration)
- pino (logging) hoặc Nest logger chuẩn

---

## 4) CẤU TRÚC THƯ MỤC (BẮT BUỘC – GỌN)

```txt
apps/backend-api/src/
  app/                 # bootstrap, global providers
    main.ts
    app.module.ts
    config/
  common/
    filters/
    guards/
    interceptors/
    pipes/
    utils/
  modules/             # feature modules (trọng tâm)
    auth/
    user/
    course/
    lesson/
    learning/
    ai/
    notification/
  domain/              # domain core (framework-agnostic)
    entities/
    ports/             # repository/service interfaces
    errors/
    events/
  infrastructure/      # adapters implement ports
    database/
      prisma/
      repositories/
    cache/
    queue/
    storage/
    ai/
  docs/                # swagger decorators nếu cần tách riêng
```

### 4.1 Quy tắc import

- `modules/*` có thể import: `domain/`, `infrastructure/`, `app/common/*`
- `domain/*` không import ngược lại
- `infrastructure/*` không import `modules/*` (tránh vòng)

---

## 5) MODULE TEMPLATE (LEAN – CHỈ 4–6 FILE/FEATURE)

Mỗi module giữ gọn, giống tư duy FE template.

```txt
modules/course/
  course.controller.ts
  course.service.ts          # orchestration (application)
  course.dto.ts              # request/response DTO
  course.module.ts
  course.types.ts            # types/constants (optional)
  index.ts                   # public exports (optional)
```

### 5.1 Khi nào tách UseCase riêng?

Chỉ tách khi `course.service.ts` > 200–300 dòng hoặc nghiệp vụ phức tạp:

```txt
modules/course/
  use-cases/
    get-course-list.usecase.ts
    get-course-detail.usecase.ts
```

---

## 6) RÀNG BUỘC < 500 DÒNG (BẮT BUỘC)

### 6.1 Ngưỡng tách file

- Controller > 200 dòng → tách route group (hoặc sub-controller)
- Service > 250 dòng → tách use-case
- Prisma repository > 250 dòng → tách theo query group
- DTO > 200 dòng → tách request/response

**Không chấp nhận file > 500 dòng.**

---

## 7) CODING CONVENTION

### Naming

- Folder: `kebab-case`
- File: `kebab-case.ts`
- Class: `PascalCase`
- Method/var: `camelCase`
- Constant: `UPPER_SNAKE_CASE`
- DTO: `CreateXDto`, `XResponseDto`
- UseCase: `VerbNounUseCase` hoặc `verb-noun.usecase.ts`

### Clean Code rules

- 1 class = 1 responsibility
- Không "magic string" → constants/enums
- Không throw Error bừa bãi → dùng `DomainError` / `AppError`
- Không trả về Prisma model trực tiếp → map ra response DTO

---

## 8) API DESIGN (MVP chuẩn)

### 8.1 REST + versioning

- Prefix: `/api/v1`
- Resource naming: plural nouns
- Status code chuẩn HTTP

### 8.2 Unified response

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### 8.3 Error model

```json
{
  "success": false,
  "data": null,
  "error": { "code": "VALIDATION_ERROR", "message": "..." }
}
```

---

## 9) AUTH & SECURITY (MVP)

- JWT access token + refresh token
- Refresh token hash lưu DB
- Guards:
  - `AuthGuard` (JWT)
  - `RoleGuard` (admin/content_admin)
- Rate limit:
  - dùng Redis key: `rate_limit:{userId}:{route}`
- Không log token, không expose stacktrace ra client.

---

## 10) DATABASE (POSTGRESQL) – CORE DATA

### 10.1 Vai trò

PostgreSQL lưu dữ liệu transactional:

- users, courses, units, lessons, exercises
- attempts, attempt_responses, lesson_progress
- ai_sessions (metadata)

### 10.2 Prisma rules

- Prisma chỉ dùng trong `infrastructure`
- Migrate bằng Prisma Migrate
- Seed script cho dev/staging

---

## 11) REDIS – CACHE / EPHEMERAL STATE

### 11.1 Dùng cho

- session cache
- rate limit
- streak/day activity
- cache course/lesson list (optional)

### 11.2 Cache strategy

- Cache-aside: read → miss → DB → set TTL
- TTL rõ ràng, không cache vĩnh viễn
- Key naming:
  - `session:{userId}`
  - `streak:{userId}`
  - `cache:courses:{lang}:{level}`
  - `rate:{userId}:{route}`

---

## 12) KAFKA – EVENT STREAMING

### 12.1 MVP scope

MVP chỉ cần produce events (consumer analytics làm phase sau).

### 12.2 Topics đề xuất

- `lesson.started`
- `lesson.completed`
- `exercise.answered`
- `ai.invoked`

Event envelope (chuẩn hóa):

```json
{
  "eventId": "uuid",
  "eventType": "lesson.completed",
  "occurredAt": "ISO_DATE",
  "data": { }
}
```

### Rule:

- UseCase/Service emit event qua port `EventBusPort`
- Infrastructure implement `KafkaProducer`

---

## 13) CLOUDFLARE R2 – FILE STORAGE

### 13.1 Lưu gì

- audio listening
- image exercises
- user avatar (optional)

### 13.2 Nguyên tắc

- DB chỉ lưu metadata + public URL
- File đặt theo path rõ ràng:
  - `lessons/{lessonId}/audio/{fileName}`
  - `lessons/{lessonId}/images/{fileName}`
  - `users/{userId}/avatar/{fileName}`

### 13.3 Upload flow (gọn)

1. Backend tạo signed URL (nếu làm chuẩn)
2. Client upload trực tiếp R2
3. Backend nhận callback lưu metadata

MVP có thể upload qua backend nhưng ưu tiên signed URL để scale.

---

## 14) POLYGLOT PERSISTENCE (KHÔNG ÉP 1 DB)

Khuyến nghị "đúng công cụ – đúng dữ liệu":

- **PostgreSQL**: nghiệp vụ
- **Redis**: cache/ephemeral
- **Kafka**: event log
- **R2**: file binary
- (Phase 2) **ClickHouse/Elastic**: analytics logs

---

## 15) TESTING STRATEGY (BẮT BUỘC)

### 15.1 Unit tests

- Service/UseCase: mock ports (repo/cache/eventbus/storage)
- Domain: entities/business rules (pure unit)

### 15.2 Integration tests

- Controller + service với test DB (docker) hoặc sqlite (tuỳ)
- Supertest cho endpoint chính

### 15.3 Test rules

- Mỗi use-case có ít nhất:
  - success case
  - error case
- Không viết test "thừa" cho Prisma internals.

---

## 16) OBSERVABILITY (MVP)

- Logging theo `requestId`/`correlationId`
- Không log PII nhạy cảm
- Metrics cơ bản:
  - latency endpoint
  - ai invoked count
  - failed requests

---

## 17) DEV WORKFLOW & CI CHECKLIST

### 17.1 Branch

- `main`
- `develop`
- `feature/*`
- `fix/*`

### 17.2 PR checklist

- [ ] Không file > 500 dòng
- [ ] Controller không chứa business logic
- [ ] DTO validation đầy đủ
- [ ] Service có test tối thiểu
- [ ] Không leak Prisma model ra response
- [ ] Redis/Kafka/R2 gọi qua port/adapters

---

## 18) "DONE" CRITERIA (BACKEND MVP)

Một module coi là xong khi:

- [ ] Endpoint hoạt động + docs swagger
- [ ] Validation request + error format chuẩn
- [ ] Có test tối thiểu
- [ ] Emit event (nếu thuộc learning/ai)
- [ ] Không vi phạm rule < 500 dòng
