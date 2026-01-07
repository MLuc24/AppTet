-- ========================================
-- LMS Database Schema - Full Table Creation
-- 53 Tables following 3NF design
-- ========================================

-- ========================================
-- A) Identity & Access (7 tables)
-- ========================================

-- 1) users
CREATE TABLE auth.users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_asset_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    dob DATE,
    native_language_id INT,
    timezone VARCHAR(100) DEFAULT 'UTC',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- 2) roles
CREATE TABLE auth.roles (
    role_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) user_roles
CREATE TABLE auth.user_roles (
    user_id UUID NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- 4) auth_sessions
CREATE TABLE auth.auth_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    device_id UUID,
    access_token_hash VARCHAR(255) NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5) refresh_tokens
CREATE TABLE auth.refresh_tokens (
    refresh_token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6) user_devices
CREATE TABLE auth.user_devices (
    device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('ios', 'android')),
    device_model VARCHAR(255),
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    device_fingerprint VARCHAR(255),
    locale VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7) push_tokens
CREATE TABLE auth.push_tokens (
    push_token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL,
    token TEXT UNIQUE NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('apns', 'fcm')),
    is_active BOOLEAN DEFAULT TRUE,
    last_registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- B) Core Catalog (2 tables)
-- ========================================

-- 8) languages
CREATE TABLE content.languages (
    language_id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9) proficiency_levels
CREATE TABLE content.proficiency_levels (
    level_id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- C) Content & Curriculum (11 tables)
-- ========================================

-- 10) courses
CREATE TABLE content.courses (
    course_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_language_id INT NOT NULL,
    base_language_id INT NOT NULL,
    level_id INT NOT NULL,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11) course_localizations
CREATE TABLE content.course_localizations (
    course_id UUID NOT NULL,
    language_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (course_id, language_id)
);

-- 12) course_versions
CREATE TABLE content.course_versions (
    course_version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL,
    version_number INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13) units
CREATE TABLE content.units (
    unit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_version_id UUID NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14) unit_localizations
CREATE TABLE content.unit_localizations (
    unit_id UUID NOT NULL,
    language_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (unit_id, language_id)
);

-- 15) skills
CREATE TABLE content.skills (
    skill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL,
    skill_type VARCHAR(50) NOT NULL CHECK (skill_type IN ('vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'writing', 'mixed')),
    order_index INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16) skill_localizations
CREATE TABLE content.skill_localizations (
    skill_id UUID NOT NULL,
    language_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (skill_id, language_id)
);

-- 17) lessons
CREATE TABLE content.lessons (
    lesson_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL,
    lesson_type VARCHAR(50) NOT NULL CHECK (lesson_type IN ('practice', 'story', 'dialogue', 'test', 'review')),
    order_index INT NOT NULL,
    estimated_minutes INT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18) lesson_localizations
CREATE TABLE content.lesson_localizations (
    lesson_id UUID NOT NULL,
    language_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    intro_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (lesson_id, language_id)
);

-- 19) media_assets
CREATE TABLE content.media_assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storage_provider VARCHAR(50) NOT NULL CHECK (storage_provider IN ('s3', 'gcs', 'local', 'r2')),
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT,
    checksum VARCHAR(255),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20) lesson_assets
CREATE TABLE content.lesson_assets (
    lesson_asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    asset_role VARCHAR(50) NOT NULL CHECK (asset_role IN ('image', 'audio', 'video', 'cover', 'attachment')),
    order_index INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- D) Learning Items (5 tables)
-- ========================================

-- 21) learning_items
CREATE TABLE content.learning_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_language_id INT NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('vocab', 'phrase', 'sentence', 'grammar_point')),
    cefr_level_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22) item_forms
CREATE TABLE content.item_forms (
    item_form_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL,
    text TEXT NOT NULL,
    ipa VARCHAR(255),
    audio_asset_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23) item_translations
CREATE TABLE content.item_translations (
    item_translation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL,
    language_id INT NOT NULL,
    meaning TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (item_id, language_id)
);

-- 24) item_examples
CREATE TABLE content.item_examples (
    example_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL,
    example_text TEXT NOT NULL,
    translation_language_id INT,
    example_translation TEXT,
    audio_asset_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25) lesson_items
CREATE TABLE content.lesson_items (
    lesson_id UUID NOT NULL,
    item_id UUID NOT NULL,
    exposure_type VARCHAR(50) NOT NULL CHECK (exposure_type IN ('introduce', 'practice', 'review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (lesson_id, item_id)
);

-- ========================================
-- E) Assessment / Exercise Bank (5 tables)
-- ========================================

-- 26) exercises
CREATE TABLE content.exercises (
    exercise_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL,
    exercise_type VARCHAR(50) NOT NULL CHECK (exercise_type IN ('mcq', 'fill_blank', 'matching', 'reorder', 'translation', 'listening_mcq', 'speaking', 'dictation', 'writing')),
    difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
    points INT DEFAULT 0,
    time_limit_seconds INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27) exercise_prompts
CREATE TABLE content.exercise_prompts (
    exercise_prompt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL,
    language_id INT NOT NULL,
    prompt_text TEXT NOT NULL,
    prompt_asset_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (exercise_id, language_id)
);

-- 28) exercise_items
CREATE TABLE content.exercise_items (
    exercise_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL,
    item_order INT NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('question', 'pair', 'blank', 'token')),
    correct_answer_text TEXT,
    correct_answer_item_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 29) exercise_options
CREATE TABLE content.exercise_options (
    option_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_item_id UUID NOT NULL,
    option_text TEXT NOT NULL,
    option_asset_id UUID,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 30) hints
CREATE TABLE content.hints (
    hint_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_item_id UUID NOT NULL,
    hint_text TEXT NOT NULL,
    cost_currency VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- F) Learning Sessions, Attempts, Responses (4 tables)
-- ========================================

-- 31) practice_sessions
CREATE TABLE learning.practice_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('learn', 'review', 'test')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 32) attempts
CREATE TABLE learning.attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    attempt_number INT NOT NULL,
    total_score INT DEFAULT 0,
    max_score INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 33) attempt_responses
CREATE TABLE learning.attempt_responses (
    response_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL,
    exercise_item_id UUID NOT NULL,
    submitted_text TEXT,
    selected_option_id UUID,
    is_correct BOOLEAN DEFAULT FALSE,
    score_awarded INT DEFAULT 0,
    time_spent_seconds INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (attempt_id, exercise_item_id)
);

-- 34) attempt_hint_usage
CREATE TABLE learning.attempt_hint_usage (
    attempt_id UUID NOT NULL,
    hint_id UUID NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cost_amount INT,
    PRIMARY KEY (attempt_id, hint_id)
);

-- ========================================
-- G) Speaking / Writing Artifacts (2 tables)
-- ========================================

-- 35) speaking_submissions
CREATE TABLE learning.speaking_submissions (
    speaking_submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL,
    audio_asset_id UUID NOT NULL,
    transcript_text TEXT,
    pronunciation_score DECIMAL(5,2),
    fluency_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 36) writing_submissions
CREATE TABLE learning.writing_submissions (
    writing_submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL,
    essay_text TEXT NOT NULL,
    coherence_score DECIMAL(5,2),
    grammar_score DECIMAL(5,2),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- H) Progress & Mastery + SRS (6 tables)
-- ========================================

-- 37) enrollments
CREATE TABLE learning.enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    course_version_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'dropped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

-- 38) lesson_progress
CREATE TABLE learning.lesson_progress (
    lesson_progress_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    best_score INT DEFAULT 0,
    last_score INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    attempts_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (enrollment_id, lesson_id)
);

-- 39) skill_mastery
CREATE TABLE learning.skill_mastery (
    skill_mastery_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    mastery_level DECIMAL(5,2) DEFAULT 0,
    last_practiced_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (enrollment_id, skill_id)
);

-- 40) user_item_mastery
CREATE TABLE learning.user_item_mastery (
    user_item_mastery_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    mastery_level DECIMAL(5,2) DEFAULT 0,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, item_id)
);

-- 41) srs_schedules
CREATE TABLE learning.srs_schedules (
    srs_schedule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    stage INT DEFAULT 0,
    interval_days INT DEFAULT 1,
    ease_factor DECIMAL(5,2) DEFAULT 2.5,
    next_review_at TIMESTAMP WITH TIME ZONE,
    last_review_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, item_id)
);

-- 42) review_queue
CREATE TABLE learning.review_queue (
    review_queue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    priority INT DEFAULT 0,
    source VARCHAR(50) NOT NULL CHECK (source IN ('lesson', 'ai', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- I) Gamification (11 tables)
-- ========================================

-- 43) xp_ledger
CREATE TABLE gamification.xp_ledger (
    xp_ledger_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('lesson', 'review', 'challenge')),
    source_id UUID,
    xp_amount INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 44) streaks
CREATE TABLE gamification.streaks (
    user_id UUID PRIMARY KEY,
    current_streak_days INT DEFAULT 0,
    longest_streak_days INT DEFAULT 0,
    last_activity_date DATE,
    freeze_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 45) achievements
CREATE TABLE gamification.achievements (
    achievement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition_type VARCHAR(100),
    condition_value JSONB,
    icon_asset_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 46) user_achievements
CREATE TABLE gamification.user_achievements (
    user_id UUID NOT NULL,
    achievement_id UUID NOT NULL,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- 47) leagues
CREATE TABLE gamification.leagues (
    league_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 48) league_weeks
CREATE TABLE gamification.league_weeks (
    league_week_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_start_date DATE UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 49) user_league_entries
CREATE TABLE gamification.user_league_entries (
    user_league_entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_week_id UUID NOT NULL,
    league_id INT NOT NULL,
    user_id UUID NOT NULL,
    xp_total INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 50) wallets
CREATE TABLE gamification.wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    currency_code VARCHAR(10) DEFAULT 'GEM',
    balance INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 51) wallet_transactions
CREATE TABLE gamification.wallet_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL,
    txn_type VARCHAR(50) NOT NULL CHECK (txn_type IN ('earn', 'spend', 'refund')),
    source_type VARCHAR(50),
    source_id UUID,
    amount INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 52) store_items
CREATE TABLE gamification.store_items (
    store_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_amount INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 53) user_inventory
CREATE TABLE gamification.user_inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    store_item_id UUID NOT NULL,
    quantity INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, store_item_id)
);

-- ========================================
-- K) Notifications & Support & Audit (3 tables)
-- ========================================

-- 60) notifications
CREATE TABLE system.notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    deep_link TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'read')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 61) support_tickets
CREATE TABLE system.support_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('billing', 'content', 'bug', 'account', 'other')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 62) audit_logs
CREATE TABLE system.audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'publish')),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    before_json JSONB,
    after_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Foreign Key Constraints
-- ========================================

-- A) Identity & Access
ALTER TABLE auth.users ADD CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_asset_id) REFERENCES content.media_assets(asset_id) ON DELETE SET NULL;
ALTER TABLE auth.users ADD CONSTRAINT fk_users_native_language FOREIGN KEY (native_language_id) REFERENCES content.languages(language_id) ON DELETE SET NULL;

ALTER TABLE auth.user_roles ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;
ALTER TABLE auth.user_roles ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES auth.roles(role_id) ON DELETE CASCADE;

ALTER TABLE auth.auth_sessions ADD CONSTRAINT fk_auth_sessions_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;
ALTER TABLE auth.auth_sessions ADD CONSTRAINT fk_auth_sessions_device FOREIGN KEY (device_id) REFERENCES auth.user_devices(device_id) ON DELETE SET NULL;

ALTER TABLE auth.refresh_tokens ADD CONSTRAINT fk_refresh_tokens_session FOREIGN KEY (session_id) REFERENCES auth.auth_sessions(session_id) ON DELETE CASCADE;

ALTER TABLE auth.user_devices ADD CONSTRAINT fk_user_devices_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;

ALTER TABLE auth.push_tokens ADD CONSTRAINT fk_push_tokens_device FOREIGN KEY (device_id) REFERENCES auth.user_devices(device_id) ON DELETE CASCADE;

-- C) Content & Curriculum
ALTER TABLE content.courses ADD CONSTRAINT fk_courses_target_language FOREIGN KEY (target_language_id) REFERENCES content.languages(language_id) ON DELETE RESTRICT;
ALTER TABLE content.courses ADD CONSTRAINT fk_courses_base_language FOREIGN KEY (base_language_id) REFERENCES content.languages(language_id) ON DELETE RESTRICT;
ALTER TABLE content.courses ADD CONSTRAINT fk_courses_level FOREIGN KEY (level_id) REFERENCES content.proficiency_levels(level_id) ON DELETE RESTRICT;
ALTER TABLE content.courses ADD CONSTRAINT fk_courses_created_by FOREIGN KEY (created_by) REFERENCES auth.users(user_id) ON DELETE SET NULL;

ALTER TABLE content.course_localizations ADD CONSTRAINT fk_course_localizations_course FOREIGN KEY (course_id) REFERENCES content.courses(course_id) ON DELETE CASCADE;
ALTER TABLE content.course_localizations ADD CONSTRAINT fk_course_localizations_language FOREIGN KEY (language_id) REFERENCES content.languages(language_id) ON DELETE CASCADE;

ALTER TABLE content.course_versions ADD CONSTRAINT fk_course_versions_course FOREIGN KEY (course_id) REFERENCES content.courses(course_id) ON DELETE CASCADE;
ALTER TABLE content.course_versions ADD CONSTRAINT fk_course_versions_created_by FOREIGN KEY (created_by) REFERENCES auth.users(user_id) ON DELETE SET NULL;

ALTER TABLE content.units ADD CONSTRAINT fk_units_course_version FOREIGN KEY (course_version_id) REFERENCES content.course_versions(course_version_id) ON DELETE CASCADE;

ALTER TABLE content.unit_localizations ADD CONSTRAINT fk_unit_localizations_unit FOREIGN KEY (unit_id) REFERENCES content.units(unit_id) ON DELETE CASCADE;
ALTER TABLE content.unit_localizations ADD CONSTRAINT fk_unit_localizations_language FOREIGN KEY (language_id) REFERENCES content.languages(language_id) ON DELETE CASCADE;

ALTER TABLE content.skills ADD CONSTRAINT fk_skills_unit FOREIGN KEY (unit_id) REFERENCES content.units(unit_id) ON DELETE CASCADE;

ALTER TABLE content.skill_localizations ADD CONSTRAINT fk_skill_localizations_skill FOREIGN KEY (skill_id) REFERENCES content.skills(skill_id) ON DELETE CASCADE;
ALTER TABLE content.skill_localizations ADD CONSTRAINT fk_skill_localizations_language FOREIGN KEY (language_id) REFERENCES content.languages(language_id) ON DELETE CASCADE;

ALTER TABLE content.lessons ADD CONSTRAINT fk_lessons_skill FOREIGN KEY (skill_id) REFERENCES content.skills(skill_id) ON DELETE CASCADE;

ALTER TABLE content.lesson_localizations ADD CONSTRAINT fk_lesson_localizations_lesson FOREIGN KEY (lesson_id) REFERENCES content.lessons(lesson_id) ON DELETE CASCADE;
ALTER TABLE content.lesson_localizations ADD CONSTRAINT fk_lesson_localizations_language FOREIGN KEY (language_id) REFERENCES content.languages(language_id) ON DELETE CASCADE;

ALTER TABLE content.media_assets ADD CONSTRAINT fk_media_assets_created_by FOREIGN KEY (created_by) REFERENCES auth.users(user_id) ON DELETE SET NULL;

ALTER TABLE content.lesson_assets ADD CONSTRAINT fk_lesson_assets_lesson FOREIGN KEY (lesson_id) REFERENCES content.lessons(lesson_id) ON DELETE CASCADE;
ALTER TABLE content.lesson_assets ADD CONSTRAINT fk_lesson_assets_asset FOREIGN KEY (asset_id) REFERENCES content.media_assets(asset_id) ON DELETE CASCADE;

-- D) Learning Items
ALTER TABLE content.learning_items ADD CONSTRAINT fk_learning_items_target_language FOREIGN KEY (target_language_id) REFERENCES content.languages(language_id) ON DELETE RESTRICT;
ALTER TABLE content.learning_items ADD CONSTRAINT fk_learning_items_cefr_level FOREIGN KEY (cefr_level_id) REFERENCES content.proficiency_levels(level_id) ON DELETE SET NULL;

ALTER TABLE content.item_forms ADD CONSTRAINT fk_item_forms_item FOREIGN KEY (item_id) REFERENCES content.learning_items(item_id) ON DELETE CASCADE;
ALTER TABLE content.item_forms ADD CONSTRAINT fk_item_forms_audio FOREIGN KEY (audio_asset_id) REFERENCES content.media_assets(asset_id) ON DELETE SET NULL;

ALTER TABLE content.item_translations ADD CONSTRAINT fk_item_translations_item FOREIGN KEY (item_id) REFERENCES content.learning_items(item_id) ON DELETE CASCADE;
ALTER TABLE content.item_translations ADD CONSTRAINT fk_item_translations_language FOREIGN KEY (language_id) REFERENCES content.languages(language_id) ON DELETE CASCADE;

ALTER TABLE content.item_examples ADD CONSTRAINT fk_item_examples_item FOREIGN KEY (item_id) REFERENCES content.learning_items(item_id) ON DELETE CASCADE;
ALTER TABLE content.item_examples ADD CONSTRAINT fk_item_examples_translation_language FOREIGN KEY (translation_language_id) REFERENCES content.languages(language_id) ON DELETE SET NULL;
ALTER TABLE content.item_examples ADD CONSTRAINT fk_item_examples_audio FOREIGN KEY (audio_asset_id) REFERENCES content.media_assets(asset_id) ON DELETE SET NULL;

ALTER TABLE content.lesson_items ADD CONSTRAINT fk_lesson_items_lesson FOREIGN KEY (lesson_id) REFERENCES content.lessons(lesson_id) ON DELETE CASCADE;
ALTER TABLE content.lesson_items ADD CONSTRAINT fk_lesson_items_item FOREIGN KEY (item_id) REFERENCES content.learning_items(item_id) ON DELETE CASCADE;

-- E) Assessment / Exercise Bank
ALTER TABLE content.exercises ADD CONSTRAINT fk_exercises_lesson FOREIGN KEY (lesson_id) REFERENCES content.lessons(lesson_id) ON DELETE CASCADE;

ALTER TABLE content.exercise_prompts ADD CONSTRAINT fk_exercise_prompts_exercise FOREIGN KEY (exercise_id) REFERENCES content.exercises(exercise_id) ON DELETE CASCADE;
ALTER TABLE content.exercise_prompts ADD CONSTRAINT fk_exercise_prompts_language FOREIGN KEY (language_id) REFERENCES content.languages(language_id) ON DELETE CASCADE;
ALTER TABLE content.exercise_prompts ADD CONSTRAINT fk_exercise_prompts_asset FOREIGN KEY (prompt_asset_id) REFERENCES content.media_assets(asset_id) ON DELETE SET NULL;

ALTER TABLE content.exercise_items ADD CONSTRAINT fk_exercise_items_exercise FOREIGN KEY (exercise_id) REFERENCES content.exercises(exercise_id) ON DELETE CASCADE;
ALTER TABLE content.exercise_items ADD CONSTRAINT fk_exercise_items_correct_answer_item FOREIGN KEY (correct_answer_item_id) REFERENCES content.learning_items(item_id) ON DELETE SET NULL;

ALTER TABLE content.exercise_options ADD CONSTRAINT fk_exercise_options_exercise_item FOREIGN KEY (exercise_item_id) REFERENCES content.exercise_items(exercise_item_id) ON DELETE CASCADE;
ALTER TABLE content.exercise_options ADD CONSTRAINT fk_exercise_options_asset FOREIGN KEY (option_asset_id) REFERENCES content.media_assets(asset_id) ON DELETE SET NULL;

ALTER TABLE content.hints ADD CONSTRAINT fk_hints_exercise_item FOREIGN KEY (exercise_item_id) REFERENCES content.exercise_items(exercise_item_id) ON DELETE CASCADE;

-- F) Learning Sessions, Attempts, Responses
ALTER TABLE learning.practice_sessions ADD CONSTRAINT fk_practice_sessions_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;
ALTER TABLE learning.practice_sessions ADD CONSTRAINT fk_practice_sessions_lesson FOREIGN KEY (lesson_id) REFERENCES content.lessons(lesson_id) ON DELETE CASCADE;

ALTER TABLE learning.attempts ADD CONSTRAINT fk_attempts_session FOREIGN KEY (session_id) REFERENCES learning.practice_sessions(session_id) ON DELETE CASCADE;

ALTER TABLE learning.attempt_responses ADD CONSTRAINT fk_attempt_responses_attempt FOREIGN KEY (attempt_id) REFERENCES learning.attempts(attempt_id) ON DELETE CASCADE;
ALTER TABLE learning.attempt_responses ADD CONSTRAINT fk_attempt_responses_exercise_item FOREIGN KEY (exercise_item_id) REFERENCES content.exercise_items(exercise_item_id) ON DELETE CASCADE;
ALTER TABLE learning.attempt_responses ADD CONSTRAINT fk_attempt_responses_selected_option FOREIGN KEY (selected_option_id) REFERENCES content.exercise_options(option_id) ON DELETE SET NULL;

ALTER TABLE learning.attempt_hint_usage ADD CONSTRAINT fk_attempt_hint_usage_attempt FOREIGN KEY (attempt_id) REFERENCES learning.attempts(attempt_id) ON DELETE CASCADE;
ALTER TABLE learning.attempt_hint_usage ADD CONSTRAINT fk_attempt_hint_usage_hint FOREIGN KEY (hint_id) REFERENCES content.hints(hint_id) ON DELETE CASCADE;

-- G) Speaking / Writing Artifacts
ALTER TABLE learning.speaking_submissions ADD CONSTRAINT fk_speaking_submissions_response FOREIGN KEY (response_id) REFERENCES learning.attempt_responses(response_id) ON DELETE CASCADE;
ALTER TABLE learning.speaking_submissions ADD CONSTRAINT fk_speaking_submissions_audio FOREIGN KEY (audio_asset_id) REFERENCES content.media_assets(asset_id) ON DELETE RESTRICT;

ALTER TABLE learning.writing_submissions ADD CONSTRAINT fk_writing_submissions_response FOREIGN KEY (response_id) REFERENCES learning.attempt_responses(response_id) ON DELETE CASCADE;

-- H) Progress & Mastery + SRS
ALTER TABLE learning.enrollments ADD CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;
ALTER TABLE learning.enrollments ADD CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES content.courses(course_id) ON DELETE CASCADE;
ALTER TABLE learning.enrollments ADD CONSTRAINT fk_enrollments_course_version FOREIGN KEY (course_version_id) REFERENCES content.course_versions(course_version_id) ON DELETE CASCADE;

ALTER TABLE learning.lesson_progress ADD CONSTRAINT fk_lesson_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES learning.enrollments(enrollment_id) ON DELETE CASCADE;
ALTER TABLE learning.lesson_progress ADD CONSTRAINT fk_lesson_progress_lesson FOREIGN KEY (lesson_id) REFERENCES content.lessons(lesson_id) ON DELETE CASCADE;

ALTER TABLE learning.skill_mastery ADD CONSTRAINT fk_skill_mastery_enrollment FOREIGN KEY (enrollment_id) REFERENCES learning.enrollments(enrollment_id) ON DELETE CASCADE;
ALTER TABLE learning.skill_mastery ADD CONSTRAINT fk_skill_mastery_skill FOREIGN KEY (skill_id) REFERENCES content.skills(skill_id) ON DELETE CASCADE;

ALTER TABLE learning.user_item_mastery ADD CONSTRAINT fk_user_item_mastery_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;
ALTER TABLE learning.user_item_mastery ADD CONSTRAINT fk_user_item_mastery_item FOREIGN KEY (item_id) REFERENCES content.learning_items(item_id) ON DELETE CASCADE;

ALTER TABLE learning.srs_schedules ADD CONSTRAINT fk_srs_schedules_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;
ALTER TABLE learning.srs_schedules ADD CONSTRAINT fk_srs_schedules_item FOREIGN KEY (item_id) REFERENCES content.learning_items(item_id) ON DELETE CASCADE;

ALTER TABLE learning.review_queue ADD CONSTRAINT fk_review_queue_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;
ALTER TABLE learning.review_queue ADD CONSTRAINT fk_review_queue_item FOREIGN KEY (item_id) REFERENCES content.learning_items(item_id) ON DELETE CASCADE;

-- I) Gamification
ALTER TABLE gamification.xp_ledger ADD CONSTRAINT fk_xp_ledger_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;

ALTER TABLE gamification.streaks ADD CONSTRAINT fk_streaks_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;

ALTER TABLE gamification.achievements ADD CONSTRAINT fk_achievements_icon FOREIGN KEY (icon_asset_id) REFERENCES content.media_assets(asset_id) ON DELETE SET NULL;

ALTER TABLE gamification.user_achievements ADD CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;
ALTER TABLE gamification.user_achievements ADD CONSTRAINT fk_user_achievements_achievement FOREIGN KEY (achievement_id) REFERENCES gamification.achievements(achievement_id) ON DELETE CASCADE;

ALTER TABLE gamification.user_league_entries ADD CONSTRAINT fk_user_league_entries_league_week FOREIGN KEY (league_week_id) REFERENCES gamification.league_weeks(league_week_id) ON DELETE CASCADE;
ALTER TABLE gamification.user_league_entries ADD CONSTRAINT fk_user_league_entries_league FOREIGN KEY (league_id) REFERENCES gamification.leagues(league_id) ON DELETE CASCADE;
ALTER TABLE gamification.user_league_entries ADD CONSTRAINT fk_user_league_entries_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;

ALTER TABLE gamification.wallets ADD CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;

ALTER TABLE gamification.wallet_transactions ADD CONSTRAINT fk_wallet_transactions_wallet FOREIGN KEY (wallet_id) REFERENCES gamification.wallets(wallet_id) ON DELETE CASCADE;

ALTER TABLE gamification.user_inventory ADD CONSTRAINT fk_user_inventory_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;
ALTER TABLE gamification.user_inventory ADD CONSTRAINT fk_user_inventory_store_item FOREIGN KEY (store_item_id) REFERENCES gamification.store_items(store_item_id) ON DELETE CASCADE;

-- K) Notifications & Support & Audit
ALTER TABLE system.notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;

ALTER TABLE system.support_tickets ADD CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE;

ALTER TABLE system.audit_logs ADD CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES auth.users(user_id) ON DELETE SET NULL;

-- ========================================
-- Indexes for Performance
-- ========================================

-- Users & Auth
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_phone ON auth.users(phone);
CREATE INDEX idx_auth_sessions_user_id ON auth.auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token_hash ON auth.auth_sessions(access_token_hash);
CREATE INDEX idx_refresh_tokens_session_id ON auth.refresh_tokens(session_id);
CREATE INDEX idx_user_devices_user_id ON auth.user_devices(user_id);

-- Learning Progress
CREATE INDEX idx_enrollments_user_course ON learning.enrollments(user_id, course_id);
CREATE INDEX idx_lesson_progress_enrollment ON learning.lesson_progress(enrollment_id);
CREATE INDEX idx_user_item_mastery_user ON learning.user_item_mastery(user_id);
CREATE INDEX idx_srs_schedules_user_next_review ON learning.srs_schedules(user_id, next_review_at);
CREATE INDEX idx_review_queue_user_due ON learning.review_queue(user_id, due_at);

-- Content
CREATE INDEX idx_lessons_skill ON content.lessons(skill_id);
CREATE INDEX idx_skills_unit ON content.skills(unit_id);
CREATE INDEX idx_units_course_version ON content.units(course_version_id);
CREATE INDEX idx_exercises_lesson ON content.exercises(lesson_id);

-- Gamification
CREATE INDEX idx_xp_ledger_user_created ON gamification.xp_ledger(user_id, created_at);
CREATE INDEX idx_user_league_entries_week_league ON gamification.user_league_entries(league_week_id, league_id);
CREATE INDEX idx_wallet_transactions_wallet ON gamification.wallet_transactions(wallet_id);

-- System
CREATE INDEX idx_notifications_user_status ON system.notifications(user_id, status);
CREATE INDEX idx_audit_logs_entity ON system.audit_logs(entity_type, entity_id);
