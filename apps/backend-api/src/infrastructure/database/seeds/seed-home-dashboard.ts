/**
 * Seed Script for Home Dashboard Data
 * Creates comprehensive test data for all home dashboard APIs
 *
 * Run: npx ts-node -r tsconfig-paths/register src/infrastructure/database/seeds/seed-home-dashboard.ts
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedHomeDashboard() {
  console.log('🌱 Starting home dashboard seeding...\n');

  // ============ 1. CREATE TEST USER ============
  console.log('👤 Creating test user...');
  
  const passwordHash = await hash('Test123!@#', 10);
  
  const user = await prisma.users.upsert({
    where: { email: 'testuser@example.com' },
    create: {
      email: 'testuser@example.com',
      password_hash: passwordHash,
      display_name: 'Test User',
      status: 'active',
      timezone: 'Asia/Ho_Chi_Minh',
      email_verified: true,
    },
    update: {},
  });

  console.log(`   ✅ User created: ${user.user_id} (${user.email})`);

  // ============ 2. CREATE LANGUAGES ============
  console.log('\n🌍 Creating languages...');
  
  const [english, vietnamese, japanese] = await Promise.all([
    prisma.languages.upsert({
      where: { code: 'en' },
      create: { code: 'en', name: 'English' },
      update: {},
    }),
    prisma.languages.upsert({
      where: { code: 'vi' },
      create: { code: 'vi', name: 'Vietnamese' },
      update: {},
    }),
    prisma.languages.upsert({
      where: { code: 'ja' },
      create: { code: 'ja', name: 'Japanese' },
      update: {},
    }),
  ]);

  console.log(`   ✅ Languages created: en, vi, ja`);

  // ============ 3. CREATE PROFICIENCY LEVELS ============
  console.log('\n📊 Creating proficiency levels...');
  
  const levels = await Promise.all([
    prisma.proficiency_levels.upsert({
      where: { code: 'A1' },
      create: { code: 'A1', name: 'Beginner', order_index: 1 },
      update: {},
    }),
    prisma.proficiency_levels.upsert({
      where: { code: 'A2' },
      create: { code: 'A2', name: 'Elementary', order_index: 2 },
      update: {},
    }),
    prisma.proficiency_levels.upsert({
      where: { code: 'B1' },
      create: { code: 'B1', name: 'Intermediate', order_index: 3 },
      update: {},
    }),
  ]);

  const levelA1 = levels[0];
  console.log(`   ✅ Proficiency levels created`);

  // ============ 4. CREATE COURSE ============
  console.log('\n📚 Creating course...');
  
  const course = await prisma.courses.upsert({
    where: { course_code: 'VI_BEGINNER_001' },
    create: {
      course_code: 'VI_BEGINNER_001',
      target_language_id: vietnamese.language_id,
      base_language_id: english.language_id,
      level_id: levelA1.level_id,
      is_published: true,
      created_by: user.user_id,
    },
    update: {
      target_language_id: vietnamese.language_id,
      base_language_id: english.language_id,
      level_id: levelA1.level_id,
      is_published: true,
    },
  });

  await prisma.course_localizations.upsert({
    where: {
      course_id_language_id: {
        course_id: course.course_id,
        language_id: english.language_id,
      },
    },
    create: {
      course_id: course.course_id,
      language_id: english.language_id,
      title: 'Vietnamese for Beginners',
      description: 'Learn Vietnamese from scratch with practical lessons',
    },
    update: {
      title: 'Vietnamese for Beginners',
      description: 'Learn Vietnamese from scratch with practical lessons',
    },
  });

  console.log(`   ✅ Course created: ${course.course_id}`);

  // ============ 5. CREATE COURSE VERSION ============
  console.log('\n📦 Creating course version...');
  
  let courseVersion = await prisma.course_versions.findFirst({
    where: { course_id: course.course_id, status: 'published' },
    orderBy: { version_number: 'desc' },
  });

  if (!courseVersion) {
    courseVersion = await prisma.course_versions.create({
      data: {
        course_id: course.course_id,
        version_number: 1,
        status: 'published',
        published_at: new Date(),
        created_by: user.user_id,
      },
    });
  }

  console.log(`   ✅ Course version created: ${courseVersion.course_version_id}`);

  // ============ 6. CREATE UNIT ============
  console.log('\n📂 Creating unit...');
  
  let unit = await prisma.units.findFirst({
    where: { course_version_id: courseVersion.course_version_id, order_index: 1 },
  });

  if (!unit) {
    unit = await prisma.units.create({
      data: {
        course_version_id: courseVersion.course_version_id,
        order_index: 1,
      },
    });
  }

  await prisma.unit_localizations.upsert({
    where: {
      unit_id_language_id: {
        unit_id: unit.unit_id,
        language_id: english.language_id,
      },
    },
    create: {
      unit_id: unit.unit_id,
      language_id: english.language_id,
      title: 'Unit 1: Greetings',
      description: 'Learn basic Vietnamese greetings',
    },
    update: {
      title: 'Unit 1: Greetings',
      description: 'Learn basic Vietnamese greetings',
    },
  });

  console.log(`   ✅ Unit created: ${unit.unit_id}`);

  // ============ 7. CREATE SKILL ============
  console.log('\n🎯 Creating skill...');
  
  let skill = await prisma.skills.findFirst({
    where: { unit_id: unit.unit_id, order_index: 1 },
  });

  if (!skill) {
    skill = await prisma.skills.create({
      data: {
        unit_id: unit.unit_id,
        skill_type: 'vocabulary',
        order_index: 1,
      },
    });
  }

  await prisma.skill_localizations.upsert({
    where: {
      skill_id_language_id: {
        skill_id: skill.skill_id,
        language_id: english.language_id,
      },
    },
    create: {
      skill_id: skill.skill_id,
      language_id: english.language_id,
      title: 'Basic Greetings',
      description: 'Essential greeting phrases',
    },
    update: {
      title: 'Basic Greetings',
      description: 'Essential greeting phrases',
    },
  });

  console.log(`   ✅ Skill created: ${skill.skill_id}`);

  // ============ 8. CREATE LESSONS ============
  console.log('\n📖 Creating lessons...');
  
  const lessonTitles = [
    'Hello and Goodbye',
    'Thank You and Sorry',
    'How Are You?',
    'Nice to Meet You',
    'Good Morning/Night',
  ];

  const lessons = [];
  for (let i = 0; i < lessonTitles.length; i++) {
    let lesson = await prisma.lessons.findFirst({
      where: { skill_id: skill.skill_id, order_index: i + 1 },
    });

    if (!lesson) {
      lesson = await prisma.lessons.create({
        data: {
          skill_id: skill.skill_id,
          lesson_type: 'practice',
          order_index: i + 1,
          estimated_minutes: 15,
          is_published: true,
        },
      });
    } else {
      await prisma.lessons.update({
        where: { lesson_id: lesson.lesson_id },
        data: {
          lesson_type: 'practice',
          estimated_minutes: 15,
          is_published: true,
        },
      });
    }

    await prisma.lesson_localizations.upsert({
      where: {
        lesson_id_language_id: {
          lesson_id: lesson.lesson_id,
          language_id: english.language_id,
        },
      },
      create: {
        lesson_id: lesson.lesson_id,
        language_id: english.language_id,
        title: lessonTitles[i],
        intro_text: `Learn ${lessonTitles[i].toLowerCase()} in Vietnamese`,
      },
      update: {
        title: lessonTitles[i],
        intro_text: `Learn ${lessonTitles[i].toLowerCase()} in Vietnamese`,
      },
    });

    lessons.push(lesson);
    console.log(`   ✅ Lesson ${i + 1} created: ${lessonTitles[i]}`);
  }

  // ============ 9. CREATE ENROLLMENT ============
  console.log('\n🎓 Creating enrollment...');
  
  const enrollment = await prisma.enrollments.upsert({
    where: {
      user_id_course_id: {
        user_id: user.user_id,
        course_id: course.course_id,
      },
    },
    create: {
      user_id: user.user_id,
      course_id: course.course_id,
      course_version_id: courseVersion.course_version_id,
      status: 'ongoing',
      enrolled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    update: {
      course_version_id: courseVersion.course_version_id,
      status: 'ongoing',
    },
  });

  console.log(`   ✅ Enrollment created: ${enrollment.enrollment_id}`);

  // ============ 10. CREATE LESSON PROGRESS ============
  console.log('\n📈 Creating lesson progress...');
  
  // Complete first 3 lessons
  for (let i = 0; i < 3; i++) {
    await prisma.lesson_progress.upsert({
      where: {
        enrollment_id_lesson_id: {
          enrollment_id: enrollment.enrollment_id,
          lesson_id: lessons[i].lesson_id,
        },
      },
      create: {
        enrollment_id: enrollment.enrollment_id,
        lesson_id: lessons[i].lesson_id,
        best_score: 85 + i * 5,
        last_score: 85 + i * 5,
        completed_at: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        attempts_count: 1,
      },
      update: {
        best_score: 85 + i * 5,
        last_score: 85 + i * 5,
        completed_at: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        attempts_count: 1,
      },
    });
    console.log(`   ✅ Lesson ${i + 1} marked as completed`);
  }

  // ============ 11. CREATE PRACTICE SESSIONS ============
  console.log('\n⏱️  Creating practice sessions...');
  
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Today's sessions
  const session1Start = new Date(today.getTime());
  const session1Existing = await prisma.practice_sessions.findFirst({
    where: {
      user_id: user.user_id,
      lesson_id: lessons[0].lesson_id,
      started_at: session1Start,
    },
  });
  if (!session1Existing) {
    await prisma.practice_sessions.create({
      data: {
        user_id: user.user_id,
        lesson_id: lessons[0].lesson_id,
        mode: 'learn',
        started_at: session1Start,
        ended_at: new Date(today.getTime() + 12 * 60 * 1000), // 12 minutes
      },
    });
  }

  const session2Start = new Date(today.getTime() + 30 * 60 * 1000);
  const session2Existing = await prisma.practice_sessions.findFirst({
    where: {
      user_id: user.user_id,
      lesson_id: lessons[1].lesson_id,
      started_at: session2Start,
    },
  });
  if (!session2Existing) {
    await prisma.practice_sessions.create({
      data: {
        user_id: user.user_id,
        lesson_id: lessons[1].lesson_id,
        mode: 'learn',
        started_at: session2Start,
        ended_at: new Date(today.getTime() + 45 * 60 * 1000), // 15 minutes
      },
    });
  }

  // Yesterday's session
  const session3Start = new Date(yesterday.getTime());
  const session3Existing = await prisma.practice_sessions.findFirst({
    where: {
      user_id: user.user_id,
      lesson_id: lessons[2].lesson_id,
      started_at: session3Start,
    },
  });
  if (!session3Existing) {
    await prisma.practice_sessions.create({
      data: {
        user_id: user.user_id,
        lesson_id: lessons[2].lesson_id,
        mode: 'learn',
        started_at: session3Start,
        ended_at: new Date(yesterday.getTime() + 20 * 60 * 1000), // 20 minutes
      },
    });
  }

  console.log(`   ✅ Practice sessions created (today: 2, yesterday: 1)`);

  // ============ 12. CREATE XP LEDGER ============
  console.log('\n⭐ Creating XP ledger entries...');
  
  const xpEntries = [
    {
      user_id: user.user_id,
      source_type: 'lesson',
      source_id: lessons[0].lesson_id,
      xp_amount: 150,
      created_at: new Date(today.getTime()),
    },
    {
      user_id: user.user_id,
      source_type: 'lesson',
      source_id: lessons[1].lesson_id,
      xp_amount: 200,
      created_at: new Date(today.getTime() + 30 * 60 * 1000),
    },
    {
      user_id: user.user_id,
      source_type: 'lesson',
      source_id: lessons[2].lesson_id,
      xp_amount: 180,
      created_at: new Date(yesterday.getTime()),
    },
  ];

  for (const entry of xpEntries) {
    const existing = await prisma.xp_ledger.findFirst({
      where: {
        user_id: entry.user_id,
        source_type: entry.source_type,
        source_id: entry.source_id,
        created_at: entry.created_at,
      },
    });
    if (!existing) {
      await prisma.xp_ledger.create({ data: entry });
    }
  }

  console.log(`   ✅ XP ledger entries created (today: 350 XP, yesterday: 180 XP)`);

  // ============ 13. CREATE STREAK ============
  console.log('\n🔥 Creating streak...');
  
  await prisma.streaks.upsert({
    where: { user_id: user.user_id },
    create: {
      user_id: user.user_id,
      current_streak_days: 7,
      longest_streak_days: 12,
      last_activity_date: today,
      freeze_count: 2,
    },
    update: {
      current_streak_days: 7,
      longest_streak_days: 12,
      last_activity_date: today,
      freeze_count: 2,
    },
  });

  console.log(`   ✅ Streak created: 7 days current, 12 days longest`);

  // ============ 14. CREATE LEARNING ITEMS ============
  console.log('\n📝 Creating learning items...');
  
  const items = [];
  const itemData = [
    { text: 'Xin chào', meaning: 'Hello', type: 'phrase' },
    { text: 'Tạm biệt', meaning: 'Goodbye', type: 'phrase' },
    { text: 'Cảm ơn', meaning: 'Thank you', type: 'phrase' },
    { text: 'Xin lỗi', meaning: 'Sorry', type: 'phrase' },
    { text: 'Bạn khỏe không?', meaning: 'How are you?', type: 'sentence' },
  ];

  for (const data of itemData) {
    const existingForm = await prisma.item_forms.findFirst({
      where: { text: data.text },
      include: { learning_items: true },
    });

    const item =
      existingForm?.learning_items ??
      (await prisma.learning_items.create({
        data: {
          target_language_id: vietnamese.language_id,
          item_type: data.type,
          cefr_level_id: levelA1.level_id,
        },
      }));

    if (!existingForm) {
      await prisma.item_forms.create({
        data: {
          item_id: item.item_id,
          text: data.text,
        },
      });
    }

    await prisma.item_translations.upsert({
      where: {
        item_id_language_id: {
          item_id: item.item_id,
          language_id: english.language_id,
        },
      },
      create: {
        item_id: item.item_id,
        language_id: english.language_id,
        meaning: data.meaning,
      },
      update: {
        meaning: data.meaning,
      },
    });

    items.push(item);
    console.log(`   ??? Item created: ${data.text} (${data.meaning})`);
  }

  // ============ 15. CREATE REVIEW QUEUE ============
  console.log('\n📋 Creating review queue...');
  
  const now = new Date();
  const reviewItems = [
    { item: items[0], dueAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) }, // 2 hours ago (overdue)
    { item: items[1], dueAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) }, // 1 hour ago (overdue)
    { item: items[2], dueAt: new Date(now.getTime() + 1 * 60 * 60 * 1000) }, // 1 hour later (due today)
    { item: items[3], dueAt: new Date(now.getTime() + 3 * 60 * 60 * 1000) }, // 3 hours later (due today)
    { item: items[4], dueAt: new Date(now.getTime() + 25 * 60 * 60 * 1000) }, // tomorrow
  ];

  for (const { item, dueAt } of reviewItems) {
    const existingReview = await prisma.review_queue.findFirst({
      where: {
        user_id: user.user_id,
        item_id: item.item_id,
        due_at: dueAt,
      },
    });
    if (!existingReview) {
      await prisma.review_queue.create({
        data: {
          user_id: user.user_id,
          item_id: item.item_id,
          due_at: dueAt,
          priority: 1,
          source: 'lesson',
        },
      });
    }
  }

  console.log(`   ✅ Review queue created: 5 items (2 overdue, 2 due today, 1 future)`);

  // ============ 16. CREATE NOTIFICATIONS ============
  console.log('\n🔔 Creating notifications...');
  
  const notificationData = [
    {
      user_id: user.user_id,
      title: 'Daily Goal Achieved!',
      body: 'Congratulations! You reached your daily goal of 20 minutes.',
      status: 'sent',
      sent_at: new Date(today.getTime() - 2 * 60 * 60 * 1000),
      read_at: null,
    },
    {
      user_id: user.user_id,
      title: 'Review Reminder',
      body: 'You have 4 items ready for review.',
      status: 'sent',
      sent_at: new Date(today.getTime() - 1 * 60 * 60 * 1000),
      read_at: null,
    },
    {
      user_id: user.user_id,
      title: 'Streak Milestone',
      body: '7 day streak! Keep it up!',
      status: 'sent',
      sent_at: new Date(today.getTime() - 30 * 60 * 60 * 1000),
      read_at: null,
    },
  ];

  for (const notification of notificationData) {
    const existingNotification = await prisma.notifications.findFirst({
      where: {
        user_id: notification.user_id,
        title: notification.title,
        sent_at: notification.sent_at,
      },
    });
    if (!existingNotification) {
      await prisma.notifications.create({ data: notification });
    }
  }

  console.log(`   ✅ Notifications created: 3 unread`);

  // ============ 17. CREATE WALLET ============
  console.log('\n💎 Creating wallet...');
  
  await prisma.wallets.upsert({
    where: { user_id: user.user_id },
    create: {
      user_id: user.user_id,
      currency_code: 'GEM',
      balance: 150,
    },
    update: {
      balance: 150,
    },
  });

  console.log(`   ✅ Wallet created: 150 gems`);

  // ============ SUMMARY ============
  console.log('\n' + '='.repeat(60));
  console.log('🎉 HOME DASHBOARD SEED COMPLETED!');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   User: ${user.email}`);
  console.log(`   Password: Test123!@#`);
  console.log(`   User ID: ${user.user_id}`);
  console.log(`   Course: Vietnamese for Beginners (5 lessons)`);
  console.log(`   Progress: 3/5 lessons completed (60%)`);
  console.log(`   Today's activity: 27 minutes, 350 XP, 2 lessons`);
  console.log(`   Streak: 7 days (longest: 12 days)`);
  console.log(`   Review queue: 5 items (2 overdue, 2 due today)`);
  console.log(`   Notifications: 3 unread`);
  console.log(`   Gems: 150`);
  console.log('\n🧪 Test the APIs:');
  console.log(`   GET /api/v1/home/summary`);
  console.log(`   GET /api/v1/home/continue`);
  console.log(`   GET /api/v1/progress/today`);
  console.log(`   GET /api/v1/progress/weekly`);
  console.log(`   GET /api/v1/streak`);
  console.log(`   GET /api/v1/review/summary`);
  console.log(`   GET /api/v1/review/queue`);
  console.log(`   GET /api/v1/notification/summary`);
  console.log('\n');
}

// Main execution
seedHomeDashboard()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
