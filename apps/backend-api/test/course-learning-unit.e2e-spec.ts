import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app/app.module';

describe('Course, Learning, and Unit APIs (e2e - real)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;
  let jwtService: JwtService;
  let authHeader: string;
  let languageId: number;
  let baseLanguageId: number;
  let levelId: number;
  let userId: string;
  const createdCourseIds: string[] = [];

  const buildCoursePayload = (codeSuffix: string) => ({
    targetLanguageId: languageId,
    baseLanguageId,
    levelId,
    courseCode: `EN-A1-${codeSuffix}`,
    localizations: [
      {
        languageId,
        title: `English A1 ${codeSuffix}`,
        description: 'E2E course',
      },
    ],
  });

  const createCourse = async (codeSuffix: string) => {
    const payload = buildCoursePayload(codeSuffix);
    const res = await request(app.getHttpServer())
      .post('/admin/courses')
      .set('Authorization', authHeader)
      .send(payload)
      .expect(201);

    const courseId = res.body.data.courseId as string;
    createdCourseIds.push(courseId);
    return { courseId, payload };
  };

  const publishCourse = async (courseId: string) => {
    return request(app.getHttpServer())
      .post(`/admin/courses/${courseId}/publish`)
      .set('Authorization', authHeader)
      .expect(201);
  };

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    const [targetLang, baseLang] = await prisma.languages.findMany({
      orderBy: { language_id: 'asc' },
      take: 2,
    });

    const level = await prisma.proficiency_levels.findFirst({
      orderBy: { level_id: 'asc' },
    });

    if (!targetLang || !baseLang || !level) {
      throw new Error('Seed data missing for languages/proficiency_levels');
    }

    languageId = targetLang.language_id;
    baseLanguageId = baseLang.language_id;
    levelId = level.level_id;

    userId = randomUUID();
    await prisma.users.create({
      data: {
        user_id: userId,
        email: `e2e_${randomUUID().slice(0, 6)}@example.com`,
        password_hash: 'e2e-hash',
        display_name: 'E2E User',
      },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = app.get(JwtService);
    const token = await jwtService.signAsync({
      sub: userId,
      email: `e2e_${randomUUID().slice(0, 6)}@example.com`,
    });
    authHeader = `Bearer ${token}`;
  });

  afterAll(async () => {
    if (createdCourseIds.length > 0) {
      await prisma.courses.deleteMany({
        where: { course_id: { in: createdCourseIds } },
      });
    }

    if (userId) {
      await prisma.users.delete({
        where: { user_id: userId },
      });
    }

    if (app) {
      await app.close();
    }

    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it('POST /admin/courses creates a course', async () => {
    const { courseId, payload } = await createCourse('create');

    const res = await request(app.getHttpServer())
      .get(`/admin/courses/${courseId}`)
      .set('Authorization', authHeader)
      .expect(200);

    expect(res.body.data.courseCode).toBe(payload.courseCode);
    expect(res.body.data.courseId).toBe(courseId);
  });

  it('GET /admin/courses lists courses', async () => {
    await createCourse('list');

    const res = await request(app.getHttpServer())
      .get('/admin/courses?limit=5')
      .set('Authorization', authHeader)
      .expect(200);

    expect(Array.isArray(res.body.data.data)).toBe(true);
    expect(typeof res.body.data.total).toBe('number');
  });

  it('GET /courses returns published courses only', async () => {
    const { courseId } = await createCourse('public');
    await publishCourse(courseId);

    const res = await request(app.getHttpServer())
      .get('/courses?limit=5')
      .set('Authorization', authHeader)
      .expect(200);

    const ids = res.body.data.data.map((course: { courseId: string }) =>
      course.courseId,
    );
    expect(ids).toContain(courseId);
  });

  it('GET /courses/:id returns course details', async () => {
    const { courseId } = await createCourse('detail');
    await publishCourse(courseId);

    const res = await request(app.getHttpServer())
      .get(`/courses/${courseId}?languageId=${languageId}`)
      .set('Authorization', authHeader)
      .expect(200);

    expect(res.body.data.courseId).toBe(courseId);
    expect(res.body.data.title).toBeDefined();
  });

  it('PUT /admin/courses/:id updates a course', async () => {
    const { courseId } = await createCourse('update');

    const res = await request(app.getHttpServer())
      .put(`/admin/courses/${courseId}`)
      .set('Authorization', authHeader)
      .send({ courseCode: `EN-A1-updated-${courseId.slice(0, 4)}` })
      .expect(200);

    expect(res.body.data.courseId).toBe(courseId);
    expect(res.body.data.courseCode).toContain('EN-A1-updated');
  });

  it('POST /admin/courses/:id/publish publishes a course', async () => {
    const { courseId } = await createCourse('publish');

    const res = await publishCourse(courseId);

    expect(res.body.data.courseId).toBe(courseId);
    expect(res.body.data.publishedAt).toBeDefined();
  });

  it('POST /admin/courses/:id/archive archives a course', async () => {
    const { courseId } = await createCourse('archive');
    await publishCourse(courseId);

    await request(app.getHttpServer())
      .post(`/admin/courses/${courseId}/archive`)
      .set('Authorization', authHeader)
      .expect(204);
  });

  it('Localization endpoints add, update, and delete', async () => {
    const { courseId } = await createCourse('local');

    await request(app.getHttpServer())
      .post(`/admin/courses/${courseId}/localizations`)
      .set('Authorization', authHeader)
      .send({
        languageId: baseLanguageId,
        title: 'Vietnamese A1',
        description: 'Mo ta',
      })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/admin/courses/${courseId}/localizations/${baseLanguageId}`)
      .set('Authorization', authHeader)
      .send({
        languageId: baseLanguageId,
        title: 'Vietnamese A1 Updated',
        description: 'Mo ta cap nhat',
      })
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/admin/courses/${courseId}/localizations/${baseLanguageId}`)
      .set('Authorization', authHeader)
      .expect(204);
  });

  it('Learning endpoints enroll and progress flow', async () => {
    const { courseId } = await createCourse('learn');
    await publishCourse(courseId);

    const courseRecord = await prisma.courses.findUnique({
      where: { course_id: courseId },
    });
    expect(courseRecord).toBeTruthy();

    const publishedVersion = await prisma.course_versions.findFirst({
      where: { course_id: courseId, status: 'published' },
    });
    expect(publishedVersion).toBeTruthy();

    const enrollRes = await request(app.getHttpServer())
      .post(`/courses/${courseId}/enroll`)
      .set('Authorization', authHeader)
      .expect((res) => {
        if (res.status !== 201) {
          throw new Error(`Enroll failed: ${JSON.stringify(res.body)}`);
        }
      });

    expect(enrollRes.body.data.courseId).toBe(courseId);

    const listRes = await request(app.getHttpServer())
      .get('/me/enrollments')
      .set('Authorization', authHeader)
      .expect(200);

    const enrollmentIds = listRes.body.data.map(
      (item: { enrollmentId: string }) => item.enrollmentId,
    );
    expect(enrollmentIds.length).toBeGreaterThan(0);

    await request(app.getHttpServer())
      .get(`/me/enrollments/${courseId}`)
      .set('Authorization', authHeader)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/me/enrollments/${courseId}/progress`)
      .set('Authorization', authHeader)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/courses/${courseId}/enroll`)
      .set('Authorization', authHeader)
      .expect(204);
  });

  it('Unit endpoints manage units under a course version', async () => {
    const { courseId } = await createCourse('unit');

    const courseVersion = await prisma.course_versions.findFirst({
      where: { course_id: courseId, status: 'draft' },
    });
    expect(courseVersion).toBeTruthy();

    const courseVersionId = courseVersion?.course_version_id as string;

    const createUnitRes = await request(app.getHttpServer())
      .post(`/admin/course-versions/${courseVersionId}/units`)
      .set('Authorization', authHeader)
      .send({
        localizations: [
          {
            languageId,
            title: 'Unit 1',
            description: 'Intro',
          },
        ],
      })
      .expect(201);

    const unitId = createUnitRes.body.data.unitId as string;

    const listRes = await request(app.getHttpServer())
      .get(
        `/admin/course-versions/${courseVersionId}/units?languageId=${languageId}`,
      )
      .set('Authorization', authHeader)
      .expect(200);

    expect(Array.isArray(listRes.body.data.data)).toBe(true);

    await request(app.getHttpServer())
      .get(`/admin/course-versions/${courseVersionId}/units/${unitId}`)
      .set('Authorization', authHeader)
      .expect(200);

    await request(app.getHttpServer())
      .put(`/admin/course-versions/${courseVersionId}/units/${unitId}`)
      .set('Authorization', authHeader)
      .send({ orderIndex: 2 })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/admin/course-versions/${courseVersionId}/units/reorder`)
      .set('Authorization', authHeader)
      .send({ unitIds: [unitId] })
      .expect(204);

    await request(app.getHttpServer())
      .post(
        `/admin/course-versions/${courseVersionId}/units/${unitId}/localizations`,
      )
      .set('Authorization', authHeader)
      .send({
        languageId: baseLanguageId,
        title: 'Unit 1 VN',
        description: 'Mo ta',
      })
      .expect(201);

    await request(app.getHttpServer())
      .put(
        `/admin/course-versions/${courseVersionId}/units/${unitId}/localizations/${baseLanguageId}`,
      )
      .set('Authorization', authHeader)
      .send({
        languageId: baseLanguageId,
        title: 'Unit 1 VN Updated',
        description: 'Mo ta cap nhat',
      })
      .expect(204);

    await request(app.getHttpServer())
      .delete(
        `/admin/course-versions/${courseVersionId}/units/${unitId}/localizations/${baseLanguageId}`,
      )
      .set('Authorization', authHeader)
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/admin/course-versions/${courseVersionId}/units/${unitId}`)
      .set('Authorization', authHeader)
      .expect(204);
  });
});
