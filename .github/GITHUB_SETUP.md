# 🔧 GitHub Web Configuration Guide

Sau khi push các workflow files lên GitHub, bạn cần cấu hình một số thứ trên web.

---

## 1️⃣ Enable GitHub Actions (BẮT BUỘC)

### Bước 1: Vào Settings
```
Repository → Settings → Actions → General
```

### Bước 2: Cấu hình Permissions
- **Actions permissions**: ✅ Allow all actions and reusable workflows
- **Workflow permissions**: ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

---

## 2️⃣ Setup Secrets (Cho Production)

### Vào Settings → Secrets and variables → Actions

Click **New repository secret** và thêm:

#### Backend Secrets
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
CLOUDFLARE_R2_ACCESS_KEY=xxx
CLOUDFLARE_R2_SECRET_KEY=xxx
KAFKA_BROKERS=broker1:9092,broker2:9092
```

#### Optional Secrets
```
CODECOV_TOKEN=xxx (nếu dùng Codecov)
SLACK_WEBHOOK=xxx (nếu muốn notify Slack)
```

> ⚠️ **Lưu ý**: Test workflow dùng test database trong Docker, không cần secrets cho test.

---

## 3️⃣ Branch Protection Rules (KHUYẾN NGHỊ)

### Vào Settings → Branches → Add branch protection rule

#### Cho branch `main`:
- **Branch name pattern**: `main`
- ✅ Require a pull request before merging
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Status checks required**:
    - `Backend API Tests`
    - `Mobile App Tests`
    - `File Size Check (<500 lines)`
    - `Architecture Rules Check`
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

#### Cho branch `develop`:
- **Branch name pattern**: `develop`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - `Backend API Tests`
  - `File Size Check (<500 lines)`

---

## 4️⃣ Enable Issues & Projects (Optional)

```
Settings → General → Features
✅ Issues
✅ Projects
✅ Wiki (nếu cần)
```

---

## 5️⃣ Setup Environments (Cho Deploy sau này)

### Vào Settings → Environments → New environment

Tạo 3 environments:

#### `development`
- No protection rules
- Secrets: dev credentials

#### `staging`
- Required reviewers: 1
- Secrets: staging credentials

#### `production`
- Required reviewers: 2
- Wait timer: 5 minutes
- Secrets: production credentials

---

## 6️⃣ Kiểm tra Workflows đã chạy chưa

### Sau khi push code:
1. Vào tab **Actions** trên GitHub
2. Xem workflow **"🧪 Test All Apps"** có chạy không
3. Click vào run để xem chi tiết

### Nếu workflow không tự chạy:
- Check **Actions permissions** (Bước 1)
- Đảm bảo file `.github/workflows/*.yml` đã được push
- Trigger manual: Actions → Workflow → Run workflow

---

## 7️⃣ Setup Notifications (Optional)

### Email notifications
```
Settings → Notifications → Actions
✅ Send notifications for failed workflows
```

### Slack integration (Optional)
Thêm vào cuối workflow file:
```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 8️⃣ Badge cho README (Optional)

Thêm badges vào README.md:

```markdown
![Tests](https://github.com/Mluc24/AppTet/actions/workflows/test.yml/badge.svg)
![PR Checks](https://github.com/Mluc24/AppTet/actions/workflows/pr-checks.yml/badge.svg)
```

---

## ✅ Checklist Setup

- [ ] Enable GitHub Actions
- [ ] Set workflow permissions (read/write)
- [ ] Add secrets (nếu cần cho production)
- [ ] Setup branch protection cho `main`
- [ ] Setup branch protection cho `develop`
- [ ] Tạo environments (dev/staging/production)
- [ ] Test 1 PR để xem workflow chạy OK
- [ ] Thêm badges vào README

---

## 🧪 Test Workflow

### Cách test nhanh:
1. Tạo branch mới: `git checkout -b test/workflow`
2. Sửa file bất kỳ, commit
3. Push: `git push origin test/workflow`
4. Tạo PR trên GitHub
5. Xem workflow chạy tự động

---

## ❓ Troubleshooting

### Workflow không chạy?
- ✅ Check Actions enabled
- ✅ Check workflow permissions
- ✅ Check file `.yml` syntax

### Workflow fail?
- ✅ Xem logs trong Actions tab
- ✅ Check secrets đã setup chưa
- ✅ Check dependencies install OK

### Status check không hiện trong PR?
- ✅ Đợi workflow chạy xong 1 lần
- ✅ Refresh trang PR
- ✅ Check branch protection settings

---

## 📞 Support

Nếu gặp vấn đề:
1. Check GitHub Actions logs
2. Xem file `.github/workflows/*.yml`
3. Đọc lại file này

---

**Updated:** 2026-01-07
