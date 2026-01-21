/**
 * Seed Script for Exercise Data
 * Creates sample exercises for existing lessons
 *
 * Run: npx ts-node src/infrastructure/database/seeds/seed-exercises.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Exercise Types
const ExerciseType = {
  MCQ: 'mcq',
  FILL_BLANK: 'fill_blank',
  MATCHING: 'matching',
  TRANSLATION: 'translation',
  LISTENING_MCQ: 'listening_mcq',
} as const;

// Exercise Item Types
const ExerciseItemType = {
  QUESTION: 'question',
  BLANK: 'blank',
  PAIR: 'pair',
} as const;

async function seedExercises() {
  console.log('🌱 Starting exercise seeding...\n');

  // Get all lessons
  const lessons = await prisma.lessons.findMany({
    take: 10,
    orderBy: { created_at: 'asc' },
  });

  if (lessons.length === 0) {
    console.log('❌ No lessons found. Please create lessons first.');
    return;
  }

  console.log(`📚 Found ${lessons.length} lessons\n`);

  for (const lesson of lessons) {
    console.log(`\n📖 Creating exercises for lesson: ${lesson.lesson_id}`);

    // Check if exercises already exist
    const existingCount = await prisma.exercises.count({
      where: { lesson_id: lesson.lesson_id },
    });

    if (existingCount > 0) {
      console.log(`   ⏭️  Skipping - already has ${existingCount} exercises`);
      continue;
    }

    // Create 5 exercises per lesson
    await createMCQExercise(lesson.lesson_id, 1);
    await createMCQExercise(lesson.lesson_id, 2);
    await createFillBlankExercise(lesson.lesson_id, 3);
    await createTranslationExercise(lesson.lesson_id, 4);
    await createMCQExercise(lesson.lesson_id, 5);

    console.log(`   ✅ Created 5 exercises`);
  }

  console.log('\n🎉 Exercise seeding completed!');
}

async function createMCQExercise(lessonId: string, orderNum: number) {
  const questions = [
    {
      prompt: 'What is the correct translation of "Hello"?',
      options: [
        { text: 'Xin chào', isCorrect: true },
        { text: 'Tạm biệt', isCorrect: false },
        { text: 'Cảm ơn', isCorrect: false },
        { text: 'Xin lỗi', isCorrect: false },
      ],
    },
    {
      prompt: 'Which word means "Thank you"?',
      options: [
        { text: 'Xin lỗi', isCorrect: false },
        { text: 'Cảm ơn', isCorrect: true },
        { text: 'Xin chào', isCorrect: false },
        { text: 'Tạm biệt', isCorrect: false },
      ],
    },
    {
      prompt: 'Select the correct meaning of "Goodbye"',
      options: [
        { text: 'Tạm biệt', isCorrect: true },
        { text: 'Xin chào', isCorrect: false },
        { text: 'Cảm ơn', isCorrect: false },
        { text: 'Làm ơn', isCorrect: false },
      ],
    },
    {
      prompt: 'What does "Sorry" mean in Vietnamese?',
      options: [
        { text: 'Cảm ơn', isCorrect: false },
        { text: 'Xin lỗi', isCorrect: true },
        { text: 'Xin chào', isCorrect: false },
        { text: 'Khỏe không', isCorrect: false },
      ],
    },
    {
      prompt: 'Choose the correct translation for "Please"',
      options: [
        { text: 'Làm ơn', isCorrect: true },
        { text: 'Tạm biệt', isCorrect: false },
        { text: 'Xin lỗi', isCorrect: false },
        { text: 'Cảm ơn', isCorrect: false },
      ],
    },
  ];

  const q = questions[(orderNum - 1) % questions.length];

  const exercise = await prisma.exercises.create({
    data: {
      lesson_id: lessonId,
      exercise_type: ExerciseType.MCQ,
      difficulty: Math.min(orderNum, 5),
      points: 10,
      time_limit_seconds: 30,
    },
  });

  // Create prompt
  await prisma.exercise_prompts.create({
    data: {
      exercise_id: exercise.exercise_id,
      language_id: 1, // English
      prompt_text: q.prompt,
    },
  });

  // Create exercise item
  const item = await prisma.exercise_items.create({
    data: {
      exercise_id: exercise.exercise_id,
      item_order: 1,
      item_type: ExerciseItemType.QUESTION,
    },
  });

  // Create options with shuffle
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
  for (const opt of shuffledOptions) {
    await prisma.exercise_options.create({
      data: {
        exercise_item_id: item.exercise_item_id,
        option_text: opt.text,
        is_correct: opt.isCorrect,
      },
    });
  }
}

async function createFillBlankExercise(lessonId: string, orderNum: number) {
  const blanks = [
    { prompt: 'Complete: "Xin ___" (Hello)', answer: 'chào' },
    { prompt: 'Complete: "Cảm ___" (Thank you)', answer: 'ơn' },
    { prompt: 'Complete: "Tạm ___" (Goodbye)', answer: 'biệt' },
  ];

  const b = blanks[(orderNum - 1) % blanks.length];

  const exercise = await prisma.exercises.create({
    data: {
      lesson_id: lessonId,
      exercise_type: ExerciseType.FILL_BLANK,
      difficulty: 2,
      points: 15,
      time_limit_seconds: 45,
    },
  });

  await prisma.exercise_prompts.create({
    data: {
      exercise_id: exercise.exercise_id,
      language_id: 1,
      prompt_text: b.prompt,
    },
  });

  await prisma.exercise_items.create({
    data: {
      exercise_id: exercise.exercise_id,
      item_order: 1,
      item_type: ExerciseItemType.BLANK,
      correct_answer_text: b.answer,
    },
  });
}

async function createTranslationExercise(lessonId: string, orderNum: number) {
  const translations = [
    {
      prompt: 'Translate to Vietnamese: "Good morning"',
      answer: 'Chào buổi sáng',
    },
    {
      prompt: 'Translate to Vietnamese: "How are you?"',
      answer: 'Bạn khỏe không',
    },
    {
      prompt: 'Translate to Vietnamese: "Nice to meet you"',
      answer: 'Rất vui được gặp bạn',
    },
  ];

  const t = translations[(orderNum - 1) % translations.length];

  const exercise = await prisma.exercises.create({
    data: {
      lesson_id: lessonId,
      exercise_type: ExerciseType.TRANSLATION,
      difficulty: 3,
      points: 20,
      time_limit_seconds: 60,
    },
  });

  await prisma.exercise_prompts.create({
    data: {
      exercise_id: exercise.exercise_id,
      language_id: 1,
      prompt_text: t.prompt,
    },
  });

  await prisma.exercise_items.create({
    data: {
      exercise_id: exercise.exercise_id,
      item_order: 1,
      item_type: ExerciseItemType.QUESTION,
      correct_answer_text: t.answer,
    },
  });
}

// Main execution
seedExercises()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
