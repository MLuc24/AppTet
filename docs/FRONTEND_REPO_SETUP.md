# Frontend Repository Setup

## Tổng quan

Dự án này sử dụng **Git subtree** để quản lý frontend như một repository riêng biệt trên GitHub, trong khi vẫn giữ toàn bộ code (frontend + backend) ở local để phát triển.

## Cấu trúc

- **Repo chính (backend)**: Chứa toàn bộ monorepo (backend + frontend + infrastructure)
- **Repo frontend**: https://github.com/MLuc24/lms-frontend-app - Chỉ chứa code từ `apps/mobile-app`

## Cách hoạt động

### Local Development
- Bạn vẫn làm việc với cấu trúc đầy đủ như bình thường
- Tất cả code (FE + BE) đều có trong workspace
- Commit và push vào repo chính như thường lệ

### Push Frontend lên Repo riêng

Khi bạn muốn cập nhật repo frontend:

**Windows (PowerShell):**
```powershell
.\scripts\setup-frontend-repo.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-frontend-repo.sh
./scripts/setup-frontend-repo.sh
```

**Hoặc chạy trực tiếp:**
```bash
git subtree push --prefix=apps/mobile-app frontend main
```

## Workflow

1. **Phát triển bình thường** ở local với cấu trúc đầy đủ
2. **Commit changes** vào repo chính:
   ```bash
   git add .
   git commit -m "Update frontend features"
   git push origin main
   ```

3. **Push frontend lên repo riêng** (khi cần):
   ```bash
   git subtree push --prefix=apps/mobile-app frontend main
   ```

## Lưu ý

- ✅ Local luôn có đầy đủ code (FE + BE)
- ✅ GitHub có 2 repo riêng biệt
- ✅ Không cần submodule phức tạp
- ✅ Cấu trúc sạch sẽ, dễ quản lý
- ⚠️ Phải commit tất cả changes trước khi push subtree
- ⚠️ Đảm bảo có quyền push vào repo frontend

## Khắc phục sự cố

### Lỗi "Working tree has modifications"
```bash
git add .
git commit -m "Commit pending changes"
```

### Lỗi "Updates were rejected"
```bash
git subtree pull --prefix=apps/mobile-app frontend main
git subtree push --prefix=apps/mobile-app frontend main
```

### Xóa remote frontend (nếu cần reset)
```bash
git remote remove frontend
```
