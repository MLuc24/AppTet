-- Auth Tables Migration
-- Thêm vào infrastructure/postgres/init.sql SAU dòng "CREATE SCHEMA IF NOT EXISTS system;"

-- ============================================
-- AUTH SCHEMA - User Authentication Tables
-- ============================================

-- Enum types cho auth schema
DO $$ BEGIN
    CREATE TYPE auth.user_role AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.auth_provider AS ENUM ('LOCAL', 'GOOGLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role auth.user_role NOT NULL DEFAULT 'STUDENT',
    provider auth.auth_provider NOT NULL DEFAULT 'LOCAL',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_token_expires TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_token_expires TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON auth.users(email_verification_token) WHERE email_verification_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON auth.users(password_reset_token) WHERE password_reset_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON auth.refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON auth.refresh_tokens(expires_at);

-- Add updated_at trigger
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant privileges to lms_user
GRANT USAGE ON SCHEMA auth TO lms_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO lms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO lms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO lms_user;

-- Log
DO $$
BEGIN
    RAISE NOTICE 'Auth tables created successfully';
    RAISE NOTICE 'Tables: auth.users, auth.refresh_tokens';
    RAISE NOTICE 'Enums: auth.user_role, auth.auth_provider';
END $$;
