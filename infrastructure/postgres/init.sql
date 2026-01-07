-- PostgreSQL Initialization Script for LMS
-- This script creates extensions and sets up the initial database schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas for better organization
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS learning;
CREATE SCHEMA IF NOT EXISTS gamification;
CREATE SCHEMA IF NOT EXISTS system;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA content GRANT ALL ON TABLES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA content GRANT ALL ON SEQUENCES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA learning GRANT ALL ON TABLES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA learning GRANT ALL ON SEQUENCES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA gamification GRANT ALL ON TABLES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA gamification GRANT ALL ON SEQUENCES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA system GRANT ALL ON TABLES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA system GRANT ALL ON SEQUENCES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO lms_user;

-- Create enum types for better type safety

-- Auth schema enums (khớp với Prisma schema)
DO $$ BEGIN
    CREATE TYPE auth.role AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.provider AS ENUM ('LOCAL', 'GOOGLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Auth schema enums (khớp với Prisma schema)
DO $$ BEGIN
    CREATE TYPE auth.user_status AS ENUM ('active', 'suspended', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.platform AS ENUM ('ios', 'android');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.push_provider AS ENUM ('apns', 'fcm');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lesson_type AS ENUM ('practice', 'story', 'dialogue', 'test', 'review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE exercise_type AS ENUM (
        'mcq', 'fill_blank', 'matching', 'reorder', 
        'translation', 'listening_mcq', 'speaking', 
        'dictation', 'writing'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_mode AS ENUM ('learn', 'review', 'test');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'read', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL initialization completed successfully';
    RAISE NOTICE 'Database: lms';
    RAISE NOTICE 'Extensions: uuid-ossp, pg_trgm, btree_gin';
    RAISE NOTICE 'Schemas: auth, content, learning, gamification, system';
    RAISE NOTICE 'Auth enums: role, provider';
END $$;
