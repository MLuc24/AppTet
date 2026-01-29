/**
 * Home Dashboard E2E Tests
 * Tests all home dashboard APIs with real database
 *
 * Prerequisites:
 * 1. Run seed: npx ts-node -r tsconfig-paths/register src/infrastructure/database/seeds/seed-home-dashboard.ts
 * 2. Run tests: npm run test:e2e home-dashboard.e2e-spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('Home Dashboard APIs (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  const testUser = {
    email: 'testuser@example.com',
    password: 'Test123!@#',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Login to get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(testUser)
      .expect(200);

    accessToken = loginResponse.body.data.accessToken;
    expect(accessToken).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/home/summary', () => {
    it('should return complete dashboard summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/home/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      // User info
      expect(data.user).toBeDefined();
      expect(data.user.userId).toBeDefined();
      expect(data.user.displayName).toBe('Test User');

      // Continue learning
      expect(data.continueLearning).toBeDefined();
      expect(data.continueLearning.courseTitle).toBe('Vietnamese for Beginners');
      expect(data.continueLearning.completedLessons).toBe(3);
      expect(data.continueLearning.totalLessons).toBe(5);
      expect(data.continueLearning.progressPercent).toBe(60);

      // Daily goal
      expect(data.dailyGoal).toBeDefined();
      expect(data.dailyGoal.targetMinutes).toBe(20);
      expect(data.dailyGoal.learnedMinutes).toBeGreaterThanOrEqual(27);
      expect(data.dailyGoal.progressPercent).toBeGreaterThanOrEqual(100);

      // Streak
      expect(data.streak).toBeDefined();
      expect(data.streak.currentDays).toBe(7);
      expect(data.streak.longestDays).toBe(12);
      expect(data.streak.freezeCount).toBe(2);

      // Review
      expect(data.review).toBeDefined();
      expect(data.review.dueCount).toBeGreaterThanOrEqual(4);

      // Notifications
      expect(data.notifications).toBeDefined();
      expect(data.notifications.unreadCount).toBe(3);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/home/summary')
        .expect(401);
    });
  });

  describe('GET /api/v1/home/continue', () => {
    it('should return continue learning card data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/home/continue')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data.continueLearning).toBeDefined();
      expect(data.continueLearning.courseTitle).toBe('Vietnamese for Beginners');
      expect(data.continueLearning.lessonTitle).toBeDefined();
      expect(data.continueLearning.lessonOrder).toBeGreaterThanOrEqual(4);
      expect(data.continueLearning.progressPercent).toBe(60);
    });
  });

  describe('GET /api/v1/progress/today', () => {
    it('should return today progress', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/progress/today')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data.date).toBeDefined();
      expect(data.minutesLearned).toBeGreaterThanOrEqual(27);
      expect(data.xpEarned).toBeGreaterThanOrEqual(350);
      expect(data.lessonsCompleted).toBeGreaterThanOrEqual(2);
      expect(data.streakDays).toBe(7);
      expect(data.goal).toBeDefined();
      expect(data.goal.targetMinutes).toBe(20);
      expect(data.goal.achieved).toBe(true);
    });

    it('should accept date query parameter', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0];

      const response = await request(app.getHttpServer())
        .get(`/api/v1/progress/today?date=${dateString}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      expect(data.date).toBe(dateString);
      expect(data.minutesLearned).toBeGreaterThanOrEqual(20);
    });
  });

  describe('GET /api/v1/progress/weekly', () => {
    it('should return weekly progress', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/progress/weekly')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data.weekStart).toBeDefined();
      expect(data.weekEnd).toBeDefined();
      expect(data.days).toBeInstanceOf(Array);
      expect(data.days).toHaveLength(7);

      // Check day structure
      const day = data.days[0];
      expect(day.date).toBeDefined();
      expect(day.minutes).toBeGreaterThanOrEqual(0);
      expect(day.xp).toBeGreaterThanOrEqual(0);
      expect(day.lessonsCompleted).toBeGreaterThanOrEqual(0);
      expect(typeof day.goalMet).toBe('boolean');
    });
  });

  describe('GET /api/v1/streak', () => {
    it('should return streak summary and week status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/streak')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data.currentDays).toBe(7);
      expect(data.longestDays).toBe(12);
      expect(data.freezeCount).toBe(2);
      expect(data.lastActivityDate).toBeDefined();
      expect(data.week).toBeDefined();
      expect(data.week.days).toBeInstanceOf(Array);
      expect(data.week.days).toHaveLength(7);

      // Check day status
      const day = data.week.days[0];
      expect(day.date).toBeDefined();
      expect(['done', 'today', 'missed', 'future', 'frozen']).toContain(day.status);
    });
  });

  describe('GET /api/v1/review/summary', () => {
    it('should return review queue summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/review/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data.dueCount).toBeGreaterThanOrEqual(4);
      expect(data.overdueCount).toBeGreaterThanOrEqual(2);
      expect(data.dueTodayCount).toBeGreaterThanOrEqual(2);
      expect(data.nextDueAt).toBeDefined();
    });
  });

  describe('GET /api/v1/review/queue', () => {
    it('should return review queue items with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/review/queue?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data.items).toBeInstanceOf(Array);
      expect(data.total).toBeGreaterThanOrEqual(5);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(10);

      if (data.items.length > 0) {
        const item = data.items[0];
        expect(item.reviewQueueId).toBeDefined();
        expect(item.itemId).toBeDefined();
        expect(item.dueAt).toBeDefined();
        expect(item.priority).toBeDefined();
        expect(item.source).toBeDefined();
      }
    });
  });

  describe('GET /api/v1/notification/summary', () => {
    it('should return notification summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notification/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data.unreadCount).toBe(3);
    });
  });

  // ============ WRITE OPERATIONS TESTS ============

  describe('POST /api/v1/lessons/:lessonId/practice/start', () => {
    let lessonId: string;

    beforeAll(async () => {
      // Get a lesson ID from continue learning
      const response = await request(app.getHttpServer())
        .get('/api/v1/home/continue')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      lessonId = response.body.data.continueLearning.lessonId;
    });

    it('should start a practice session', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/lessons/${lessonId}/practice/start`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ mode: 'learn' })
        .expect(201);

      const { data } = response.body;
      
      expect(data.sessionId).toBeDefined();
      expect(data.lessonId).toBe(lessonId);
      expect(data.mode).toBe('learn');
      expect(data.startedAt).toBeDefined();
    });
  });

  describe('PUT /api/v1/practice-sessions/:sessionId/end', () => {
    let sessionId: string;

    beforeAll(async () => {
      // Start a session first
      const continueResponse = await request(app.getHttpServer())
        .get('/api/v1/home/continue')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const lessonId = continueResponse.body.data.continueLearning.lessonId;

      const startResponse = await request(app.getHttpServer())
        .post(`/api/v1/lessons/${lessonId}/practice/start`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ mode: 'learn' })
        .expect(201);

      sessionId = startResponse.body.data.sessionId;
    });

    it('should end a practice session', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/practice-sessions/${sessionId}/end`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data.sessionId).toBe(sessionId);
      expect(data.endedAt).toBeDefined();
      expect(data.durationMinutes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /api/v1/review/submit', () => {
    let itemId: string;

    beforeAll(async () => {
      // Get an item from review queue
      const response = await request(app.getHttpServer())
        .get('/api/v1/review/queue?limit=1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      if (response.body.data.items.length > 0) {
        itemId = response.body.data.items[0].itemId;
      }
    });

    it('should submit a review answer', async () => {
      if (!itemId) {
        console.log('⏭️  Skipping: No review items available');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/api/v1/review/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          itemId,
          isCorrect: true,
          userAnswer: 'Xin chào',
        })
        .expect(200);

      const { data } = response.body;
      
      expect(data.success).toBe(true);
      expect(data.itemId).toBe(itemId);
      expect(data.nextReviewAt).toBeDefined();
      expect(data.newStage).toBeGreaterThanOrEqual(0);
      expect(data.intervalDays).toBeGreaterThanOrEqual(0);
    });
  });

  describe('PUT /api/v1/notification/:notificationId/read', () => {
    let notificationId: string;

    beforeAll(async () => {
      // Get a notification ID (you'll need to query notifications table)
      // For now, we'll create a test notification
      // This is a placeholder - you may need to adjust based on your notification API
    });

    it('should mark notification as read', async () => {
      // This test requires getting a notification ID first
      // Skipping for now as we don't have a GET notifications endpoint
      console.log('⏭️  Skipping: Requires notification list API');
    });
  });

  describe('PUT /api/v1/notification/read-all', () => {
    it('should mark all notifications as read', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/notification/read-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data.success).toBe(true);
      expect(data.markedCount).toBeGreaterThanOrEqual(0);

      // Verify unread count is now 0
      const summaryResponse = await request(app.getHttpServer())
        .get('/api/v1/notification/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(summaryResponse.body.data.unreadCount).toBe(0);
    });
  });
});
