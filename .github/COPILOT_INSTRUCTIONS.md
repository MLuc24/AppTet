# 🤖 AI Assistant Instructions for AppTet Project

## ⚠️ BẮT BUỘC ĐỌC TRƯỚC KHI BẮT ĐẦU

Khi nhận bất kỳ yêu cầu nào trong dự án này, bạn PHẢI tuân thủ quy trình sau:

---

## 📋 QUY TRÌNH LÀM VIỆC BẮT BUỘC

### Bước 1: ĐỌC VÀ HIỂU DỰ ÁN (KHÔNG BỎ QUA)

#### 1.1 Đọc toàn bộ cấu trúc workspace
```
Sử dụng list_dir và semantic_search để hiểu:
- Cấu trúc thư mục
- Các module/feature hiện có
- Naming convention đang dùng
```

#### 1.2 ĐỌC KỸ CÁC FILE DOC (ƯU TIÊN CAO)

**BẮT BUỘC đọc theo thứ tự:**

1. **`docs/ARCHITECTURE.md`** 
   - Hiểu tổng quan hệ thống
   - Tech stack decisions
   - Data flow

2. **`docs/BACKEND_GUIDELINES.md`**
   - Kiến trúc Lean Clean Architecture
   - Cấu trúc module bắt buộc
   - Quy tắc < 500 dòng/file
   - Naming conventions
   - Testing strategy

3. **`docs/FE_GUIDELINES.md`**
   - React Native + Expo conventions
   - Feature-based architecture
   - State management rules
   - UI/UX guidelines

4. **Các file doc khác** (nếu có):
   - `AUTH_CHECKLIST.md`
   - `DATABASE_SCHEMA.md`
   - `DEPLOYMENT.md`

### Bước 2: XÁC NHẬN HIỂU BIẾT

Trước khi code, hãy:
- ✅ Xác định module/feature nào sẽ thay đổi
- ✅ Kiểm tra có vi phạm quy tắc kiến trúc không
- ✅ Xác định layer nào cần sửa (Presentation/Application/Domain/Infrastructure)
- ✅ Đảm bảo không tạo file > 500 dòng

### Bước 3: THỰC HIỆN

- Tuân thủ 100% quy tắc trong BACKEND_GUIDELINES.md / FE_GUIDELINES.md
- Code phải match với architecture đã định
- Không tự ý thay đổi cấu trúc đã có

---

## 🚫 CÁC ĐIỀU TUYỆT ĐỐI CẤM

### Backend

❌ **KHÔNG BAO GIỜ:**
- Tạo file > 500 dòng
- Đặt business logic trong Controller
- Import Prisma/NestJS trong Domain layer
- Trả về Prisma model trực tiếp cho client
- Gọi trực tiếp Redis/Kafka/R2 mà không qua Port/Adapter
- Tạo "God Service" chứa quá nhiều logic

### Frontend

❌ **KHÔNG BAO GIỜ:**
- Tạo file > 500 dòng
- Đặt business logic trong `app/` (routing layer)
- Fetch API trực tiếp trong component
- Dùng `any` type
- Hardcode màu sắc, spacing
- Import chéo giữa các feature

---

## ✅ CHECKLIST TRƯỚC KHI SUBMIT CODE

### Backend
- [ ] File < 500 dòng
- [ ] Controller không chứa business logic
- [ ] Domain không import NestJS/Prisma
- [ ] DTO validation đầy đủ
- [ ] Repository pattern qua Port
- [ ] Event emit đúng cách
- [ ] Có test coverage tối thiểu

### Frontend
- [ ] File < 500 dòng
- [ ] Feature-based structure
- [ ] Không logic trong route
- [ ] React Query cho server state
- [ ] Zustand chỉ cho UI state
- [ ] Responsive (Android + iOS)
- [ ] Accessibility labels

---

## 📚 TÀI LIỆU THAM KHẢO NHANH

| Vấn đề | Đọc file |
|--------|----------|
| Kiến trúc tổng thể | `docs/ARCHITECTURE.md` |
| Backend module mới | `docs/BACKEND_GUIDELINES.md` (Section 5) |
| Frontend feature mới | `docs/FE_GUIDELINES.md` (Section 3) |
| Database schema | `docs/DATABASE_SCHEMA.md` |
| Auth implementation | `docs/AUTH_SETUP_GUIDE.md` |

---

## 🎯 NGUYÊN TẮC CỐT LÕI

> **"Đọc trước - Hiểu rõ - Code sau"**

1. **Consistency > Cleverness**
   - Code theo convention đã có
   - Không tự sáng tạo pattern mới

2. **Architecture First**
   - Tuân thủ Clean Architecture
   - Tôn trọng layer boundaries

3. **File Size Discipline**
   - 500 dòng là HARD LIMIT
   - Tách file khi cần thiết

4. **Test Coverage**
   - Logic quan trọng phải có test
   - Mock dependencies đúng cách

---

## 💡 KHI GẶP VẤN ĐỀ

1. **Không chắc về kiến trúc?**
   → Đọc lại `ARCHITECTURE.md` và `BACKEND_GUIDELINES.md`

2. **File quá dài?**
   → Tách theo hướng dẫn trong guidelines

3. **Không biết đặt code ở đâu?**
   → Xem lại cấu trúc module template

4. **Pattern không rõ?**
   → Tìm module tương tự đã có, học theo

---

## 📝 GHI CHÚ QUAN TRỌNG

- **Dự án này theo Lean Clean Architecture**
- **MVP nhưng không nợ kiến trúc**
- **Ưu tiên: Maintainability > Quick & Dirty**
- **Team nhỏ nhưng code phải professional**

---

## 🔄 CẬP NHẬT

Khi có thay đổi lớn về kiến trúc:
1. Update `ARCHITECTURE.md` trước
2. Update `BACKEND_GUIDELINES.md` hoặc `FE_GUIDELINES.md`
3. Update file này nếu cần

---

**Version:** 1.0  
**Last Updated:** 2026-01-07  
**Maintained by:** Development Team

---

## 🚀 BẮT ĐẦU NGAY

Khi nhận task mới:

```
1. Đọc ARCHITECTURE.md
2. Đọc BACKEND_GUIDELINES.md hoặc FE_GUIDELINES.md (tuỳ task)
3. Tìm module/feature tương tự
4. Code theo pattern đã có
5. Self-review với checklist
6. Submit
```

**Chúc bạn code hiệu quả! 🎉**
