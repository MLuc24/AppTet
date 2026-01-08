# 🚀 Hướng dẫn nhanh: Setup Frontend Repo riêng

## Bước 1: Tạo repo trên GitHub

1. Truy cập: https://github.com/new
2. Repository name: `lms-frontend-app`
3. Chọn **Public** hoặc **Private**
4. **KHÔNG** chọn "Initialize with README"
5. Click **Create repository**

## Bước 2: Commit code hiện tại (nếu chưa)

```bash
git add .
git commit -m "Prepare for frontend repo split"
git push origin main
```

## Bước 3: Chạy script setup

**Windows:**
```powershell
.\scripts\setup-frontend-repo.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-frontend-repo.sh
./scripts/setup-frontend-repo.sh
```

## ✅ Kết quả

- ✅ Local: Vẫn có đầy đủ code (FE + BE)
- ✅ GitHub Backend: Repo hiện tại với full monorepo
- ✅ GitHub Frontend: https://github.com/MLuc24/lms-frontend-app chỉ có code từ `apps/mobile-app`

## 🔄 Workflow hàng ngày

### 1. Phát triển bình thường
```bash
# Làm việc với code như thường lệ
cd apps/mobile-app
npm run start
```

### 2. Commit vào repo chính
```bash
git add .
git commit -m "Add new feature"
git push origin main
```

### 3. Cập nhật frontend repo (khi cần)
```bash
git subtree push --prefix=apps/mobile-app frontend main
```

## 📝 Lưu ý quan trọng

- Bạn **KHÔNG** cần clone 2 repo riêng
- Local luôn có đầy đủ code
- Chỉ push lên frontend repo khi muốn cập nhật
- Cấu trúc sạch sẽ, không có duplicate code

## ❓ Troubleshooting

### Lỗi: "remote frontend already exists"
```bash
git remote remove frontend
# Rồi chạy lại script
```

### Lỗi: "Working tree has modifications"
```bash
git status
git add .
git commit -m "Commit changes"
# Rồi chạy lại script
```

### Kiểm tra remote
```bash
git remote -v
# Phải thấy:
# origin    ... (repo chính)
# frontend  https://github.com/MLuc24/lms-frontend-app.git
```
