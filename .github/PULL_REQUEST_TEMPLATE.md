# Pull Request

## 📋 Checklist (BẮT BUỘC)

**Trước khi submit PR, bạn PHẢI check:**

### Architecture & Guidelines
- [ ] Đã đọc và tuân thủ `docs/BACKEND_GUIDELINES.md` hoặc `docs/FE_GUIDELINES.md`
- [ ] Đã đọc `.github/COPILOT_INSTRUCTIONS.md`
- [ ] Code tuân thủ Clean Architecture (đúng layer)
- [ ] Không có file nào > 500 dòng

### Code Quality
- [ ] Không có business logic trong Controller (backend) hoặc route (frontend)
- [ ] Domain layer không import NestJS/Prisma (backend)
- [ ] Routing layer (`app/`) không chứa logic (frontend)
- [ ] Không dùng `any` type
- [ ] Không hardcode credentials, API keys

### Testing
- [ ] Đã viết test cho logic mới
- [ ] Đã chạy `npm test` locally và PASS
- [ ] Đã test trên cả Android & iOS (nếu là mobile)

### Documentation
- [ ] Đã update README.md nếu thêm feature mới
- [ ] Đã update docs nếu thay đổi kiến trúc
- [ ] Code có comments cho phần phức tạp

---

## 📝 Description

### What changed?
<!-- Mô tả ngắn gọn những gì đã thay đổi -->

### Why?
<!-- Tại sao cần thay đổi này? Link đến issue nếu có -->

### How?
<!-- Giải thích cách implement, những decision quan trọng -->

---

## 🎯 Type of Change

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 🔨 Refactoring
- [ ] 📚 Documentation
- [ ] 🎨 Styling
- [ ] ⚡ Performance
- [ ] 🧪 Tests
- [ ] 🔧 Configuration

---

## 🧪 Testing

### How to test?
<!-- Hướng dẫn reviewer cách test thay đổi này -->

1. 
2. 
3. 

### Test coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)

---

## 📸 Screenshots / Videos (if applicable)

### Before


### After


---

## 🚀 Deployment Notes

<!-- Có điều gì cần lưu ý khi deploy không? -->
<!-- Migration? Environment variables? -->

---

## 🔗 Related Issues

Closes #
Related to #

---

## 👀 Reviewers Notes

<!-- Điều gì reviewer nên chú ý đặc biệt? -->

---

## ⚠️ Breaking Changes

- [ ] This PR contains breaking changes
- [ ] Migration guide included (if breaking changes)

---

**By submitting this PR, I confirm:**
- ✅ I have read `.github/COPILOT_INSTRUCTIONS.md`
- ✅ I have followed `BACKEND_GUIDELINES.md` or `FE_GUIDELINES.md`
- ✅ All files are < 500 lines
- ✅ Tests are passing
- ✅ Code is production-ready
