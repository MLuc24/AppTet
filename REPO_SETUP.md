# 📦 Hướng dẫn Setup 2 Repo riêng biệt

## Chiến lược: Monorepo cục bộ, 2 Remote Repos

### Cấu trúc:
```
Local (máy dev):
├── apps/
│   ├── backend-api/     ✅ Push lên Backend Repo
│   ├── mobile-app/      ✅ Push lên Frontend Repo
│   └── admin-web/       ✅ Push lên Frontend Repo
├── packages/            ✅ Push lên CẢ 2 repos
└── infrastructure/      ✅ Chỉ Backend Repo

Remote:
- Backend Repo:  Chỉ có backend-api + infrastructure + packages
- Frontend Repo: Chỉ có mobile-app + admin-web + packages
```

---

## 🔧 Setup Backend Repo (Repo hiện tại)

### Bước 1: Cập nhật .gitignore
```bash
# File .gitignore đã được tạo sẵn
# Nó sẽ ignore apps/mobile-app/ và apps/admin-web/
```

### Bước 2: Commit và push
```bash
git add .gitignore
git commit -m "chore: ignore frontend apps in backend repo"
git push origin Auth
```

### Bước 3: Xóa frontend khỏi Git tracking (không xóa file)
```bash
git rm -r --cached apps/mobile-app
git rm -r --cached apps/admin-web
git commit -m "chore: remove frontend from backend repo tracking"
git push origin Auth
```

---

## 🎨 Setup Frontend Repo (Repo mới)

### Bước 1: Tạo repo mới trên GitHub
```
Tên: language-learning-platform-frontend
```

### Bước 2: Trong thư mục project hiện tại
```bash
# Copy .gitignore cho frontend
cp .gitignore.frontend .gitignore-temp

# Tạo thư mục mới cho frontend repo
cd ..
mkdir language-learning-platform-frontend
cd language-learning-platform-frontend

# Init git
git init
git branch -M main

# Copy file .gitignore
cp ../AppTet/.gitignore-temp .gitignore

# Copy các file cần thiết
cp -r ../AppTet/apps/mobile-app ./apps/mobile-app
cp -r ../AppTet/apps/admin-web ./apps/admin-web
cp -r ../AppTet/packages ./packages
cp ../AppTet/package.json ./
cp ../AppTet/README.md ./
```

### Bước 3: Tạo package.json cho frontend
```json
{
  "name": "language-learning-platform-frontend",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "mobile": "npm run start --workspace=@lms/mobile-app",
    "admin": "npm run dev --workspace=@lms/admin-web",
    "lint": "npm run lint --workspaces --if-present",
    "test": "npm run test --workspaces --if-present"
  }
}
```

### Bước 4: Commit và push
```bash
git add .
git commit -m "feat: initial frontend repo setup"
git remote add origin <frontend-repo-url>
git push -u origin main
```

---

## 🔄 Workflow khi làm việc

### Làm việc với Backend:
```bash
cd AppTet  # Repo backend
git checkout Auth
# Code backend...
git add apps/backend-api infrastructure
git commit -m "feat(backend): add feature"
git push origin Auth
```

### Làm việc với Frontend:
```bash
cd language-learning-platform-frontend
# Code frontend...
git add apps/mobile-app apps/admin-web
git commit -m "feat(frontend): add feature"
git push origin main
```

### Update Shared Packages:
```bash
# Trong Backend repo
cd AppTet
# Update packages/shared-types
git add packages
git commit -m "feat(shared): update types"
git push origin Auth

# Copy sang Frontend repo
cp -r packages ../language-learning-platform-frontend/
cd ../language-learning-platform-frontend
git add packages
git commit -m "feat(shared): update types from backend"
git push origin main
```

---

## 📋 Checklist

### Backend Repo (AppTet):
- [x] .gitignore ignore frontend apps
- [ ] Remove frontend từ git tracking
- [ ] Push lên remote
- [ ] Verify: `git ls-files` không thấy apps/mobile-app

### Frontend Repo (mới):
- [ ] Tạo repo mới trên GitHub
- [ ] Clone/copy code từ repo cũ
- [ ] .gitignore ignore backend
- [ ] Push lên remote
- [ ] Verify: `git ls-files` không thấy apps/backend-api

---

## 🎯 Lợi ích

✅ **Backend Repo:**
- Nhẹ hơn (không có node_modules của frontend)
- Deploy backend độc lập
- CI/CD chỉ test backend

✅ **Frontend Repo:**
- Nhẹ hơn (không có backend code)
- Deploy frontend độc lập
- CI/CD chỉ test frontend

✅ **Shared Packages:**
- Vẫn có thể share types
- Sync thủ công hoặc dùng git submodule

---

## 🚀 Alternative: Git Submodules (Nâng cao)

Nếu muốn tự động sync packages:

```bash
# Trong Backend repo
git submodule add <packages-repo-url> packages

# Trong Frontend repo
git submodule add <packages-repo-url> packages
```

---

## ❓ FAQ

**Q: Làm sao sync packages giữa 2 repos?**
A: Copy thủ công hoặc dùng git submodule

**Q: Có mất code không?**
A: Không, code vẫn ở local, chỉ thay đổi cái gì được push lên remote

**Q: Có thể merge 2 repos sau không?**
A: Có, dùng git subtree hoặc copy code lại

**Q: Nên dùng branch hay repo riêng?**
A: Repo riêng tốt hơn cho deploy và CI/CD độc lập
