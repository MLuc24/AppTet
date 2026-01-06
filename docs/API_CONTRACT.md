# API Contract

Version: 1.0  
Status: Draft

---

## Overview

Tài liệu này định nghĩa contract giữa Frontend và Backend.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:3000/api/v1` |
| Staging | `https://staging-api.yourdomain.com/api/v1` |
| Production | `https://api.yourdomain.com/api/v1` |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## Authentication

### Headers

```
Authorization: Bearer <access_token>
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Đăng ký |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Đăng xuất |

---

## Modules

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Lấy thông tin user hiện tại |
| PATCH | `/users/me` | Cập nhật profile |

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | Danh sách khóa học |
| GET | `/courses/:id` | Chi tiết khóa học |

### Lessons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lessons/:id` | Chi tiết bài học |
| POST | `/lessons/:id/start` | Bắt đầu bài học |
| POST | `/lessons/:id/complete` | Hoàn thành bài học |

### Learning Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress` | Tiến độ học tập |
| GET | `/progress/streak` | Streak hiện tại |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Dữ liệu không hợp lệ |
| `UNAUTHORIZED` | 401 | Chưa đăng nhập |
| `FORBIDDEN` | 403 | Không có quyền |
| `NOT_FOUND` | 404 | Không tìm thấy |
| `INTERNAL_ERROR` | 500 | Lỗi server |
