/**
 * Database Seed Script
 * Usage: npx ts-node scripts/seed-data.ts
 */

// TODO: Import PrismaClient from backend-api when ready
// import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('🌱 Seeding database...');

  // TODO: Add seed data
  // const prisma = new PrismaClient();

  // Example seed data structure:
  const seedData = {
    users: [
      {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      },
      {
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
      },
    ],
    courses: [
      {
        title: 'English for Beginners',
        language: 'en',
        level: 'beginner',
      },
    ],
  };

  console.log('Seed data prepared:', seedData);
  console.log('✅ Seeding completed!');
}

main().catch(console.error);
