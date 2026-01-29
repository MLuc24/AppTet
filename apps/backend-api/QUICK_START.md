# Quick Start - Home Dashboard APIs

## 🚀 3 Bước Để Test Ngay

### Bước 1: Chạy Seed Data (1 phút)

```bash
cd Backend/apps/backend-api
npx ts-node -r tsconfig-paths/register src/infrastructure/database/seeds/seed-home-dashboard.ts
```

**Kết quả:**
```
✅ User created: testuser@example.com
✅ Course created: Vietnamese for Beginners (5 lessons)
✅ Progress: 3/5 lessons completed
✅ Today's activity: 27 minutes, 350 XP
✅ Streak: 7 days
✅ Review queue: 5 items
✅ Notifications: 3 unread
```

### Bước 2: Start Backend

```bash
npm run start:dev
```

### Bước 3: Test APIs

#### 3.1. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!@#"
  }'
```

**Copy `accessToken` từ response**

#### 3.2. Get Dashboard Summary
```bash
curl -X GET http://localhost:3000/api/v1/home/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Bạn sẽ thấy:**
- ✅ User info
- ✅ Continue learning (lesson 4/5)
- ✅ Daily goal (27/20 minutes - 135%)
- ✅ Streak (7 days)
- ✅ Review (4 items due)
- ✅ Notifications (3 unread)

## 🧪 Test Realtime Updates

### Test 1: End Practice Session → Daily Goal Updates

```bash
# 1. Start session
curl -X POST http://localhost:3000/api/v1/lessons/LESSON_ID/practice/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "learn"}'

# Copy sessionId from response

# 2. Wait a few seconds...

# 3. End session
curl -X PUT http://localhost:3000/api/v1/practice-sessions/SESSION_ID/end \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Check updated progress
curl -X GET http://localhost:3000/api/v1/progress/today \
  -H "Authorization: Bearer YOUR_TOKEN"

# ✅ minutesLearned increased!
```

### Test 2: Submit Review → Review Count Decreases

```bash
# 1. Get review queue
curl -X GET http://localhost:3000/api/v1/review/queue?limit=1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Copy itemId from first item

# 2. Submit review
curl -X POST http://localhost:3000/api/v1/review/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "ITEM_ID",
    "isCorrect": true,
    "userAnswer": "Xin chào"
  }'

# 3. Check updated count
curl -X GET http://localhost:3000/api/v1/review/summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# ✅ dueCount decreased!
```

### Test 3: Mark Notifications Read → Badge Clears

```bash
# 1. Check unread count
curl -X GET http://localhost:3000/api/v1/notification/summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# Shows: unreadCount: 3

# 2. Mark all as read
curl -X PUT http://localhost:3000/api/v1/notification/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Check again
curl -X GET http://localhost:3000/api/v1/notification/summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# ✅ unreadCount: 0
```

## 📱 Frontend Integration

### React Native Example

```typescript
// 1. User completes a lesson
const completeLesson = async (lessonId: string, score: number) => {
  await api.post(`/lessons/${lessonId}/complete`, { score });
  
  // Refresh dashboard immediately
  const updated = await api.get('/home/summary');
  setDashboardData(updated.data);
  
  // ✅ UI updates with new progress!
};

// 2. User ends practice session
const endSession = async (sessionId: string) => {
  await api.put(`/practice-sessions/${sessionId}/end`);
  
  // Refresh today's progress
  const updated = await api.get('/progress/today');
  setTodayProgress(updated.data);
  
  // ✅ Daily goal bar updates!
};

// 3. User submits review
const submitReview = async (itemId: string, isCorrect: boolean) => {
  await api.post('/review/submit', { itemId, isCorrect });
  
  // Refresh review summary
  const updated = await api.get('/review/summary');
  setReviewSummary(updated.data);
  
  // ✅ Review badge count updates!
};
```

## 🎯 All Available Endpoints

### GET (Read Data)
```
✅ GET /api/v1/home/summary           - Complete dashboard
✅ GET /api/v1/home/continue          - Continue learning card
✅ GET /api/v1/progress/today         - Today's progress
✅ GET /api/v1/progress/weekly        - Weekly breakdown
✅ GET /api/v1/streak                 - Streak info
✅ GET /api/v1/review/summary         - Review summary
✅ GET /api/v1/review/queue           - Review items
✅ GET /api/v1/notification/summary   - Notification count
```

### POST/PUT (Update Data)
```
✅ POST /api/v1/lessons/:id/practice/start    - Start session
✅ PUT  /api/v1/practice-sessions/:id/end     - End session
✅ POST /api/v1/review/submit                 - Submit review
✅ PUT  /api/v1/notification/:id/read         - Mark one read
✅ PUT  /api/v1/notification/read-all         - Mark all read
```

## 📊 Expected Data

### Dashboard Summary Response
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "...",
      "displayName": "Test User",
      "avatarUrl": null
    },
    "continueLearning": {
      "courseTitle": "Vietnamese for Beginners",
      "lessonTitle": "Nice to Meet You",
      "lessonOrder": 4,
      "completedLessons": 3,
      "totalLessons": 5,
      "progressPercent": 60,
      "remainingMinutes": 30
    },
    "dailyGoal": {
      "targetMinutes": 20,
      "learnedMinutes": 27,
      "progressPercent": 135
    },
    "streak": {
      "currentDays": 7,
      "longestDays": 12,
      "freezeCount": 2
    },
    "review": {
      "dueCount": 4
    },
    "notifications": {
      "unreadCount": 3
    }
  }
}
```

## 🐛 Troubleshooting

### "User not found" khi login
```bash
# Chạy lại seed script
npx ts-node -r tsconfig-paths/register src/infrastructure/database/seeds/seed-home-dashboard.ts
```

### "Lesson not found" khi start session
```bash
# Get lesson ID từ continue learning
curl -X GET http://localhost:3000/api/v1/home/continue \
  -H "Authorization: Bearer YOUR_TOKEN"

# Use lessonId from response
```

### Backend không start
```bash
# Check database connection
psql -U postgres -d your_database

# Check .env file
cat .env

# Ensure DATABASE_URL is correct
```

## 📚 More Info

- **Full Documentation**: `HOME_DASHBOARD_APIS.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **API Specs**: `docs/DASHBOARD_API.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`

---

**Ready to go!** 🚀
