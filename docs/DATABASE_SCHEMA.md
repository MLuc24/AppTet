# Database Design & Storage Strategy

Tài liệu này mô tả **thiết kế cơ sở dữ liệu đầy đủ** của hệ thống học ngoại ngữ,
được xây dựng dựa trên schema chi tiết ban đầu, đồng thời bổ sung **chiến lược lựa chọn
loại cơ sở dữ liệu** cho từng nhóm dữ liệu.

## Chiến lược Triển khai

Hệ thống được thiết kế theo định hướng:
- **3 Docker Containers:**
  - **Container 1: PostgreSQL** - Lưu trữ tất cả dữ liệu quan hệ (users, courses, learning data, gamification)
  - **Container 2: Redis** - Cache và real-time data cho SRS, leaderboard, session cache
  - **Container 3: MongoDB** - Lưu trữ dữ liệu AI chat, logs, unstructured data
- Backend phát triển và chạy local trong giai đoạn hiện tại
- Áp dụng Polyglot Persistence (nhiều loại database)

---

## A) Identity & Access (Tài khoản, phân quyền, thiết bị)
**Container: PostgreSQL**

### 1) users
**Mục đích:** Lưu trữ thông tin tài khoản người dùng, hỗ trợ đa phương thức đăng nhập (email/phone)  
**Đặc điểm:** Dữ liệu nhạy cảm, yêu cầu ACID, quan hệ chặt chẽ với hầu hết các bảng khác  
**3NF:** ✅ Đạt chuẩn - Mọi thuộc tính phụ thuộc trực tiếp vào PK, không có phụ thuộc bắc cầu

- user_id (PK)
- email (unique, nullable nếu login bằng phone)
- phone (unique, nullable)
- password_hash
- display_name
- avatar_asset_id (FK → media_assets.asset_id, nullable)
- status (active, suspended, deleted)
- dob (nullable, dùng cho child safety nếu cần)
- native_language_id (FK → languages.language_id, nullable)
- timezone
- last_login_at
- created_at
- updated_at

### 2) roles
**Mục đích:** Định nghĩa các vai trò trong hệ thống (student, admin, content_editor, moderator)  
**Đặc điểm:** Dữ liệu cấu hình tĩnh, ít thay đổi, áp dụng RBAC pattern  
**3NF:** ✅ Đạt chuẩn - Bảng master data đơn giản

- role_id (PK)
- code (unique) — student, admin, content_editor, moderator
- name
- created_at
- updated_at

### 3) user_roles
**Mục đích:** Bảng trung gian many-to-many, gán vai trò cho người dùng  
**Đặc điểm:** Junction table, một user có thể có nhiều roles (vd: vừa student vừa content_editor)  
**3NF:** ✅ Đạt chuẩn - Junction table thuần túy

- user_id (PK, FK → users.user_id)
- role_id (PK, FK → roles.role_id)
- created_at

### 4) auth_sessions
**Mục đích:** Quản lý phiên đăng nhập của user, hỗ trợ multi-device login  
**Đặc điểm:** Dữ liệu tạm thời, có TTL, cần query nhanh theo user_id và token  
**3NF:** ✅ Đạt chuẩn - Mọi thuộc tính phụ thuộc vào session_id

- session_id (PK)
- user_id (FK → users.user_id)
- device_id (FK → user_devices.device_id, nullable)
- access_token_hash
- ip
- user_agent
- expires_at
- revoked_at (nullable)
- created_at

### 5) refresh_tokens
**Mục đích:** Lưu refresh token để gia hạn access token mà không cần đăng nhập lại  
**Đặc điểm:** 1-1 với session, tuân thủ OAuth2/JWT best practices, có cơ chế revoke  
**3NF:** ✅ Đạt chuẩn

- refresh_token_id (PK)
- session_id (FK → auth_sessions.session_id)
- token_hash (unique)
- expires_at
- revoked_at (nullable)
- created_at

### 6) user_devices
**Mục đích:** Theo dõi thiết bị của user, hỗ trợ tính năng "trusted devices" và analytics  
**Đặc điểm:** Quan hệ 1-many với user, lưu thông tin kỹ thuật cho mobile app  
**3NF:** ✅ Đạt chuẩn

- device_id (PK)
- user_id (FK → users.user_id)
- platform (ios, android)
- device_model
- os_version
- app_version
- device_fingerprint (unique per user, nullable)
- locale
- created_at
- updated_at

### 7) push_tokens
**Mục đích:** Quản lý FCM/APNS tokens để gửi push notification  
**Đặc điểm:** 1 device có thể có nhiều tokens (khi app reinstall), cần cleanup tokens hết hạn  
**3NF:** ✅ Đạt chuẩn

- push_token_id (PK)
- device_id (FK → user_devices.device_id)
- token (unique)
- provider (apns, fcm)
- is_active
- last_registered_at
- created_at
- updated_at

---

## B) Core Catalog (Ngôn ngữ, cấp độ)
**Container: PostgreSQL**

### 8) languages
**Mục đích:** Master data cho các ngôn ngữ hỗ trợ trong hệ thống  
**Đặc điểm:** Dữ liệu tĩnh, ít thay đổi, được reference rất nhiều  
**3NF:** ✅ Đạt chuẩn

- language_id (PK)
- code (unique) — en, vi, ja
- name
- created_at
- updated_at

### 9) proficiency_levels
**Mục đích:** Master data cho các cấp độ CEFR (A1, A2, B1, B2, C1, C2)  
**Đặc điểm:** Dữ liệu chuẩn quốc tế, không thay đổi  
**3NF:** ✅ Đạt chuẩn

- level_id (PK)
- code (unique) — A1, A2, B1...
- name
- order_index
- created_at
- updated_at

---

## C) Content & Curriculum (LMS nội dung)
**Container: PostgreSQL**

### 10) courses
**Mục đích:** Lưu metadata của khóa học (không chứa nội dung đa ngôn ngữ)  
**Đặc điểm:** Core entity, là root của cây phân cấp course → unit → skill → lesson  
**3NF:** ✅ Đạt chuẩn - Tách localized content sang course_localizations

- course_id (PK)
- target_language_id (FK → languages.language_id)
- base_language_id (FK → languages.language_id)
- level_id (FK → proficiency_levels.level_id)
- course_code (unique)
- is_published
- created_by (FK → users.user_id)
- created_at
- updated_at

### 11) course_localizations
**Mục đích:** Lưu nội dung đa ngôn ngữ của course (title, description)  
**Đặc điểm:** i18n pattern, composite PK (course_id, language_id)  
**3NF:** ✅ Đạt chuẩn - Tách biệt nội dung đa ngôn ngữ

- course_id (PK, FK → courses.course_id)
- language_id (PK, FK → languages.language_id)
- title
- description
- created_at
- updated_at

### 12) course_versions
**Mục đích:** Quản lý phiên bản của course (draft, published, archived)  
**Đặc điểm:** Hỗ trợ version control, rollback, A/B testing  
**3NF:** ✅ Đạt chuẩn

- course_version_id (PK)
- course_id (FK → courses.course_id)
- version_number
- status (draft, published, archived)
- published_at (nullable)
- created_by (FK → users.user_id)
- created_at
- updated_at

### 13) units
**Mục đích:** Đơn vị tổ chức nội dung, nhóm nhiều skills lại  
**Đặc điểm:** Level 2 trong cây phân cấp, có thứ tự (order_index)  
**3NF:** ✅ Đạt chuẩn - Metadata tách localization

- unit_id (PK)
- course_version_id (FK → course_versions.course_version_id)
- order_index
- created_at
- updated_at

### 14) unit_localizations
**Mục đích:** Nội dung đa ngôn ngữ của unit  
**Đặc điểm:** i18n pattern tương tự course_localizations  
**3NF:** ✅ Đạt chuẩn

- unit_id (PK, FK → units.unit_id)
- language_id (PK, FK → languages.language_id)
- title
- description (nullable)
- created_at
- updated_at

### 15) skills
**Mục đích:** Nhóm lessons theo kỹ năng (vocabulary, grammar, listening, speaking...)  
**Đặc điểm:** Level 3 trong cây phân cấp, phân loại theo skill_type  
**3NF:** ✅ Đạt chuẩn

- skill_id (PK)
- unit_id (FK → units.unit_id)
- skill_type (vocabulary, grammar, listening, speaking, reading, writing, mixed)
- order_index
- created_at
- updated_at

### 16) skill_localizations
**Mục đích:** Nội dung đa ngôn ngữ của skill  
**Đặc điểm:** i18n pattern  
**3NF:** ✅ Đạt chuẩn

- skill_id (PK, FK → skills.skill_id)
- language_id (PK, FK → languages.language_id)
- title
- description (nullable)
- created_at
- updated_at

### 17) lessons
**Mục đích:** Bài học cụ thể, chứa exercises và learning items  
**Đặc điểm:** Level 4 (lá) trong cây phân cấp, có nhiều loại lesson_type  
**3NF:** ✅ Đạt chuẩn

- lesson_id (PK)
- skill_id (FK → skills.skill_id)
- lesson_type (practice, story, dialogue, test, review)
- order_index
- estimated_minutes
- is_published
- created_at
- updated_at

### 18) lesson_localizations
**Mục đích:** Nội dung đa ngôn ngữ của lesson  
**Đặc điểm:** i18n pattern  
**3NF:** ✅ Đạt chuẩn

- lesson_id (PK, FK → lessons.lesson_id)
- language_id (PK, FK → languages.language_id)
- title
- intro_text (nullable)
- created_at
- updated_at

### 19) media_assets
**Mục đích:** Quản lý tập trung tất cả media files (ảnh, audio, video)  
**Đặc điểm:** Shared resource, được reference bởi nhiều bảng, có checksum để dedup  
**3NF:** ✅ Đạt chuẩn

- asset_id (PK)
- storage_provider (s3, gcs, local)
- file_url
- mime_type
- file_size_bytes
- checksum (nullable)
- created_by (FK → users.user_id, nullable)
- created_at
- updated_at

### 20) lesson_assets
**Mục đích:** Gắn media vào lesson với vai trò cụ thể (image, audio, video...)  
**Đặc điểm:** Junction table có metadata (asset_role, order_index)  
**3NF:** ✅ Đạt chuẩn

- lesson_asset_id (PK)
- lesson_id (FK → lessons.lesson_id)
- asset_id (FK → media_assets.asset_id)
- asset_role (image, audio, video, cover, attachment)
- order_index
- created_at
- updated_at

---

## D) Learning Items (SRS & AI nền)
**Container: PostgreSQL**

### 21) learning_items
**Mục đích:** Đơn vị học tập cơ bản (từ vựng, cụm từ, câu, điểm ngữ pháp)  
**Đặc điểm:** Core entity cho SRS, AI recommendations, được reference bởi lessons và exercises  
**3NF:** ✅ Đạt chuẩn - Tách forms và translations ra bảng riêng

- item_id (PK)
- target_language_id (FK → languages.language_id)
- item_type (vocab, phrase, sentence, grammar_point)
- cefr_level_id (FK → proficiency_levels.level_id, nullable)
- created_at
- updated_at

### 22) item_forms
**Mục đích:** Lưu các biến thể của item (singular/plural, conjugations...)  
**Đặc điểm:** 1 item có thể có nhiều forms, mỗi form có audio riêng  
**3NF:** ✅ Đạt chuẩn

- item_form_id (PK)
- item_id (FK → learning_items.item_id)
- text
- ipa (nullable)
- audio_asset_id (FK → media_assets.asset_id, nullable)
- created_at
- updated_at

### 23) item_translations
**Mục đích:** Lưu bản dịch của item sang các ngôn ngữ khác  
**Đặc điểm:** 1 item có nhiều translations (1 translation/language), unique constraint  
**3NF:** ✅ Đạt chuẩn

- item_translation_id (PK)
- item_id (FK → learning_items.item_id)
- language_id (FK → languages.language_id)
- meaning
- note (nullable)
- created_at
- updated_at  
- unique(item_id, language_id)

### 24) item_examples
**Mục đích:** Lưu câu ví dụ sử dụng item trong context  
**Đặc điểm:** 1 item có nhiều examples, mỗi example có translation và audio  
**3NF:** ✅ Đạt chuẩn

- example_id (PK)
- item_id (FK → learning_items.item_id)
- example_text
- translation_language_id (FK → languages.language_id, nullable)
- example_translation (nullable)
- audio_asset_id (FK → media_assets.asset_id, nullable)
- created_at
- updated_at

### 25) lesson_items
**Mục đích:** Mapping many-to-many giữa lessons và items  
**Đặc điểm:** Có metadata về exposure_type (introduce, practice, review)  
**3NF:** ✅ Đạt chuẩn - Junction table với metadata

- lesson_id (PK, FK → lessons.lesson_id)
- item_id (PK, FK → learning_items.item_id)
- exposure_type (introduce, practice, review)
- created_at

---

## E) Assessment / Exercise Bank
**Container: PostgreSQL**

### 26) exercises
**Mục đích:** Bài tập trong lesson, hỗ trợ nhiều loại (MCQ, fill blank, speaking...)  
**Đặc điểm:** Core entity cho assessment, có điểm số và time limit  
**3NF:** ✅ Đạt chuẩn - Tách prompts và items ra bảng riêng

- exercise_id (PK)
- lesson_id (FK → lessons.lesson_id)
- exercise_type (mcq, fill_blank, matching, reorder, translation, listening_mcq, speaking, dictation, writing)
- difficulty (1–5)
- points
- time_limit_seconds (nullable)
- created_at
- updated_at

### 27) exercise_prompts
**Mục đích:** Đề bài của exercise (đa ngôn ngữ)  
**Đặc điểm:** i18n pattern, có thể kèm media (ảnh, audio)  
**3NF:** ✅ Đạt chuẩn

- exercise_prompt_id (PK)
- exercise_id (FK → exercises.exercise_id)
- language_id (FK → languages.language_id)
- prompt_text
- prompt_asset_id (FK → media_assets.asset_id, nullable)
- created_at
- updated_at  
- unique(exercise_id, language_id)

### 28) exercise_items
**Mục đích:** Các item con trong exercise (câu hỏi, cặp matching, chỗ trống...)  
**Đặc điểm:** 1 exercise có nhiều items, mỗi item có đáp án đúng  
**3NF:** ✅ Đạt chuẩn

- exercise_item_id (PK)
- exercise_id (FK → exercises.exercise_id)
- item_order
- item_type (question, pair, blank, token)
- correct_answer_text (nullable)
- correct_answer_item_id (FK → learning_items.item_id, nullable)
- created_at
- updated_at

### 29) exercise_options
**Mục đích:** Các lựa chọn cho exercise_item (MCQ, matching...)  
**Đặc điểm:** 1 item có nhiều options, đánh dấu is_correct  
**3NF:** ✅ Đạt chuẩn

- option_id (PK)
- exercise_item_id (FK → exercise_items.exercise_item_id)
- option_text
- option_asset_id (FK → media_assets.asset_id, nullable)
- is_correct
- created_at
- updated_at

### 30) hints
**Mục đích:** Gợi ý cho exercise_item, có thể tốn tiền/gems  
**Đặc điểm:** 1 item có thể có nhiều hints (theo độ cụ thể)  
**3NF:** ✅ Đạt chuẩn

- hint_id (PK)
- exercise_item_id (FK → exercise_items.exercise_item_id)
- hint_text
- cost_currency (nullable)
- created_at
- updated_at

---

## F) Learning Sessions, Attempts, Responses
**Container: PostgreSQL**

### 31) practice_sessions
**Mục đích:** Theo dõi phiên học của user (1 lần làm lesson)  
**Đặc điểm:** Có started_at và ended_at, phân biệt mode (learn/review/test)  
**3NF:** ✅ Đạt chuẩn

- session_id (PK)
- user_id (FK → users.user_id)
- lesson_id (FK → lessons.lesson_id)
- started_at
- ended_at (nullable)
- mode (learn, review, test)
- created_at
- updated_at

### 32) attempts
**Mục đích:** Lần thử làm bài trong session (có thể retry)  
**Đặc điểm:** 1 session có nhiều attempts, lưu điểm số  
**3NF:** ✅ Đạt chuẩn

- attempt_id (PK)
- session_id (FK → practice_sessions.session_id)
- attempt_number
- total_score
- max_score
- completed_at (nullable)
- created_at
- updated_at

### 33) attempt_responses
**Mục đích:** Câu trả lời của user cho từng exercise_item  
**Đặc điểm:** Lưu cả text answer và selected option, tính điểm và thời gian  
**3NF:** ✅ Đạt chuẩn - unique(attempt_id, exercise_item_id) đảm bảo 1 item chỉ trả lời 1 lần/attempt

- response_id (PK)
- attempt_id (FK → attempts.attempt_id)
- exercise_item_id (FK → exercise_items.exercise_item_id)
- submitted_text (nullable)
- selected_option_id (FK → exercise_options.option_id, nullable)
- is_correct
- score_awarded
- time_spent_seconds (nullable)
- created_at
- updated_at  
- unique(attempt_id, exercise_item_id)

### 34) attempt_hint_usage
**Mục đích:** Tracking việc sử dụng hint trong attempt  
**Đặc điểm:** Junction table, ghi nhận thời gian và chi phí  
**3NF:** ✅ Đạt chuẩn

- attempt_id (PK, FK → attempts.attempt_id)
- hint_id (PK, FK → hints.hint_id)
- used_at
- cost_amount (nullable)

---

## G) Speaking / Writing Artifacts
**Container: PostgreSQL (metadata) + Object Storage (files)**

### 35) speaking_submissions
**Mục đích:** Lưu bài nói của user (link audio + transcript + scores)  
**Đặc điểm:** 1-1 với response, audio lưu ở object storage  
**3NF:** ✅ Đạt chuẩn

- speaking_submission_id (PK)
- response_id (FK → attempt_responses.response_id)
- audio_asset_id (FK → media_assets.asset_id)
- transcript_text (nullable)
- pronunciation_score (nullable)
- fluency_score (nullable)
- created_at
- updated_at

### 36) writing_submissions
**Mục đích:** Lưu bài viết của user (text + scores + feedback)  
**Đặc điểm:** 1-1 với response, lưu text trong DB  
**3NF:** ✅ Đạt chuẩn

- writing_submission_id (PK)
- response_id (FK → attempt_responses.response_id)
- essay_text
- coherence_score (nullable)
- grammar_score (nullable)
- feedback_text (nullable)
- created_at
- updated_at

---

## H) Progress & Mastery + SRS
**Container: PostgreSQL (persistent) + Redis (cache)**

### 37) enrollments
**Mục đích:** Ghi nhận user đăng ký học course  
**Đặc điểm:** unique(user_id, course_id), tracking status (ongoing/completed/dropped)  
**3NF:** ✅ Đạt chuẩn

- enrollment_id (PK)
- user_id (FK → users.user_id)
- course_id (FK → courses.course_id)
- course_version_id (FK → course_versions.course_version_id)
- enrolled_at
- status (ongoing, completed, dropped)
- created_at
- updated_at  
- unique(user_id, course_id)

### 38) lesson_progress
**Mục đích:** Theo dõi tiến độ của user trên từng lesson  
**Đặc điểm:** Lưu best_score, attempts_count, có thể cache trong Redis  
**3NF:** ✅ Đạt chuẩn

- lesson_progress_id (PK)
- enrollment_id (FK → enrollments.enrollment_id)
- lesson_id (FK → lessons.lesson_id)
- best_score
- last_score
- completed_at (nullable)
- attempts_count
- updated_at  
- unique(enrollment_id, lesson_id)

### 39) skill_mastery
**Mục đích:** Tracking mức độ thành thạo của user trên từng skill  
**Đặc điểm:** mastery_level là số 0-1 hoặc 0-100, update theo thuật toán  
**3NF:** ✅ Đạt chuẩn

- skill_mastery_id (PK)
- enrollment_id (FK → enrollments.enrollment_id)
- skill_id (FK → skills.skill_id)
- mastery_level (0–1 hoặc 0–100)
- last_practiced_at
- updated_at  
- unique(enrollment_id, skill_id)

### 40) user_item_mastery
**Mục đích:** Tracking mức độ nhớ từng learning_item của user  
**Đặc điểm:** Cơ sở cho SRS, có thể cache trong Redis  
**3NF:** ✅ Đạt chuẩn

- user_item_mastery_id (PK)
- user_id (FK → users.user_id)
- item_id (FK → learning_items.item_id)
- mastery_level (0–1)
- last_seen_at
- updated_at  
- unique(user_id, item_id)

### 41) srs_schedules
**Mục đích:** Spaced Repetition System schedule cho từng item  
**Đặc điểm:** Thuật toán SM-2 hoặc tương tự, tính next_review_at, có thể cache trong Redis  
**3NF:** ✅ Đạt chuẩn

- srs_schedule_id (PK)
- user_id (FK → users.user_id)
- item_id (FK → learning_items.item_id)
- stage (0..N)
- interval_days
- ease_factor
- next_review_at
- last_review_at (nullable)
- created_at
- updated_at  
- unique(user_id, item_id)

### 42) review_queue
**Mục đích:** Hàng đợi các items cần review, sorted by due_at  
**Đặc điểm:** Có priority và source, nên cache trong Redis cho performance  
**3NF:** ✅ Đạt chuẩn

- review_queue_id (PK)
- user_id (FK → users.user_id)
- item_id (FK → learning_items.item_id)
- due_at
- priority
- source (lesson, ai, manual)
- created_at
- updated_at

**Redis Usage:**  
- Cache `review_queue` sorted by `due_at` (ZSET với score = due_at timestamp)
- Cache `srs_schedules` theo user_id (HASH)
- Cache `lesson_progress` và `skill_mastery` để giảm query DB

---

## I) Gamification
**Container: PostgreSQL**

### 43) xp_ledger
**Mục đích:** Sổ cái ghi nhận tất cả giao dịch XP (kiểu event sourcing)  
**Đặc điểm:** Append-only, không update, dùng để tính tổng XP và analytics  
**3NF:** ✅ Đạt chuẩn

- xp_ledger_id (PK)
- user_id (FK → users.user_id)
- source_type (lesson, review, challenge)
- source_id (uuid/bigint, nullable)
- xp_amount
- created_at

### 44) streaks
**Mục đích:** Tracking streak học liên tục của user  
**Đặc điểm:** 1 row/user, update hàng ngày, có freeze_count (streak freeze)  
**3NF:** ✅ Đạt chuẩn

- user_id (PK, FK → users.user_id)
- current_streak_days
- longest_streak_days
- last_activity_date (date)
- freeze_count
- updated_at

### 45) achievements
**Mục đích:** Master data cho các achievement/badge trong hệ thống  
**Đặc điểm:** Dữ liệu tĩnh, có condition để check unlock  
**3NF:** ✅ Đạt chuẩn

- achievement_id (PK)
- code (unique)
- name
- description
- condition_type
- condition_value
- icon_asset_id (FK → media_assets.asset_id, nullable)
- created_at
- updated_at

### 46) user_achievements
**Mục đích:** Tracking achievements đã unlock của user  
**Đặc điểm:** Junction table, ghi timestamp achieved_at  
**3NF:** ✅ Đạt chuẩn

- user_id (PK, FK → users.user_id)
- achievement_id (PK, FK → achievements.achievement_id)
- achieved_at

### 47) leagues
**Mục đích:** Master data cho các league (Bronze, Silver, Gold...)  
**Đặc điểm:** Dữ liệu tĩnh, có thứ tự  
**3NF:** ✅ Đạt chuẩn

- league_id (PK)
- code (unique)
- name
- order_index
- created_at
- updated_at

### 48) league_weeks
**Mục đích:** Tracking từng tuần thi đấu league  
**Đặc điểm:** 1 row/week, unique week_start_date  
**3NF:** ✅ Đạt chuẩn

- league_week_id (PK)
- week_start_date (date, unique)
- created_at

### 49) user_league_entries
**Mục đích:** Entry của user trong league mỗi tuần  
**Đặc điểm:** Tracking XP và rank, có thể promote/demote giữa leagues  
**3NF:** ✅ Đạt chuẩn

- user_league_entry_id (PK)
- league_week_id (FK → league_weeks.league_week_id)
- league_id (FK → leagues.league_id)
- user_id (FK → users.user_id)
- xp_total
- updated_at

### 50) wallets
**Mục đích:** Ví tiền ảo của user (gems)  
**Đặc điểm:** 1 wallet/user, lưu balance hiện tại  
**3NF:** ✅ Đạt chuẩn

- wallet_id (PK)
- user_id (FK → users.user_id, unique)
- currency_code (default "GEM")
- balance
- updated_at

### 51) wallet_transactions
**Mục đích:** Sổ cái giao dịch gems (event sourcing pattern)  
**Đặc điểm:** Append-only, dùng để audit và tính balance  
**3NF:** ✅ Đạt chuẩn

- transaction_id (PK)
- wallet_id (FK → wallets.wallet_id)
- txn_type (earn, spend, refund)
- source_type (lesson, shop, streak_freeze)
- source_id (nullable)
- amount
- created_at

### 52) store_items
**Mục đích:** Catalog các items bán trong shop  
**Đặc điểm:** Master data, có flag is_active  
**3NF:** ✅ Đạt chuẩn

- store_item_id (PK)
- sku (unique)
- name
- description
- price_amount
- is_active
- created_at
- updated_at

### 53) user_inventory
**Mục đích:** Inventory của user (items đã mua)  
**Đặc điểm:** unique(user_id, store_item_id), có quantity  
**3NF:** ✅ Đạt chuẩn

- inventory_id (PK)
- user_id (FK → users.user_id)
- store_item_id (FK → store_items.store_item_id)
- quantity
- updated_at  
- unique(user_id, store_item_id)

---

## J) AI Assistant
**Container: MongoDB**

**Lý do dùng MongoDB:**
- Dữ liệu semi-structured (chat messages, prompts)
- Schema linh hoạt (AI responses có thể có nhiều format khác nhau)
- Write-heavy workload (logs)
- Không cần join phức tạp
- Query theo session_id và timestamp

### 54) ai_prompt_templates
**Mục đích:** Template cho AI prompts (system prompt, developer prompt)  
**Đặc điểm:** Version control, có flag is_active  
**NoSQL:** Phù hợp vì schema prompt có thể thay đổi theo model mới

- template_id (PK)
- code (unique)
- version
- system_prompt
- developer_prompt (nullable)
- is_active
- created_by (FK → users.user_id)
- created_at
- updated_at  
- unique(code, version)

### 55) ai_sessions
**Mục đích:** Tracking session chat với AI  
**Đặc điểm:** Có context về lesson/exercise đang học  
**NoSQL:** Phù hợp cho time-series data

- ai_session_id (PK)
- user_id (FK → users.user_id)
- session_type (chat, explain_answer, roleplay, review_coach)
- related_lesson_id (FK → lessons.lesson_id, nullable)
- related_exercise_id (FK → exercises.exercise_id, nullable)
- started_at
- ended_at (nullable)
- created_at
- updated_at

### 56) ai_messages
**Mục đích:** Lưu từng message trong conversation  
**Đặc điểm:** Có role (user/assistant/system), content có thể là text/JSON  
**NoSQL:** Phù hợp vì message format linh hoạt

- ai_message_id (PK)
- ai_session_id (FK → ai_sessions.ai_session_id)
- role (user, assistant, system)
- content_text
- created_at

### 57) ai_invocation_logs
**Mục đích:** Logging mỗi lần call AI API (cho monitoring và billing)  
**Đặc điểm:** Append-only, analytics data  
**NoSQL:** Phù hợp cho log data

- invocation_id (PK)
- ai_session_id (FK → ai_sessions.ai_session_id)
- template_id (FK → ai_prompt_templates.template_id)
- model_name
- latency_ms
- prompt_tokens
- completion_tokens
- cost_usd (nullable)
- status (success, error)
- error_code (nullable)
- created_at

### 58) ai_feedback
**Mục đích:** User feedback cho AI responses (thumbs up/down, rating)  
**Đặc điểm:** Dùng để improve AI quality  
**NoSQL:** Phù hợp

- ai_feedback_id (PK)
- ai_message_id (FK → ai_messages.ai_message_id)
- user_id (FK → users.user_id)
- rating (1–5)
- reason_code (nullable)
- comment (nullable)
- created_at

### 59) moderation_flags
**Mục đích:** Flagging nội dung vi phạm (toxic, inappropriate...)  
**Đặc điểm:** Polymorphic (flag nhiều loại entity), có severity  
**NoSQL:** Phù hợp cho flexible schema

- flag_id (PK)
- entity_type (ai_message, community_post, user_profile)
- entity_id
- flag_type (toxicity, sexual, self_harm, hate, pii, other)
- severity
- status (open, resolved, dismissed)
- created_at
- updated_at

---

## K) Notifications & Support & Audit
**Container: PostgreSQL**

### 60) notifications
**Mục đích:** Quản lý push notifications và in-app notifications  
**Đặc điểm:** Có scheduling, tracking delivery status  
**3NF:** ✅ Đạt chuẩn

- notification_id (PK)
- user_id (FK → users.user_id)
- title
- body
- deep_link (nullable)
- status (queued, sent, read)
- scheduled_at (nullable)
- sent_at (nullable)
- read_at (nullable)
- created_at
- updated_at

### 61) support_tickets
**Mục đích:** Hệ thống ticketing cho customer support  
**Đặc điểm:** Có category và status workflow  
**3NF:** ✅ Đạt chuẩn

- ticket_id (PK)
- user_id (FK → users.user_id)
- category (billing, content, bug, account, other)
- subject
- description
- status (open, in_progress, closed)
- created_at
- updated_at

### 62) audit_logs
**Mục đích:** Audit trail cho tất cả hành động quan trọng (compliance)  
**Đặc điểm:** Append-only, lưu before/after state (JSON), polymorphic  
**3NF:** ✅ Đạt chuẩn - Dùng JSON cho flexibility

- audit_id (PK)
- actor_user_id (FK → users.user_id)
- action (create, update, delete, publish)
- entity_type (course, lesson, exercise, item, ...)
- entity_id
- before_json (nullable)
- after_json (nullable)
- created_at

---

## Đánh giá Chuẩn 3NF

### ✅ Tất cả bảng đều đạt chuẩn 3NF vì:

**1. Đạt chuẩn 1NF (First Normal Form):**
- Tất cả các cột đều chứa giá trị nguyên tử (atomic)
- Không có nhóm lặp lại (repeating groups)
- Mỗi bảng có primary key

**2. Đạt chuẩn 2NF (Second Normal Form):**
- Đạt 1NF
- Không có partial dependency (tất cả non-key attributes phụ thuộc toàn bộ vào PK, không chỉ một phần)
- Các bảng có composite PK (user_roles, lesson_items, etc.) không có non-key attributes phụ thuộc vào một phần của PK

**3. Đạt chuẩn 3NF (Third Normal Form):**
- Đạt 2NF
- Không có transitive dependency (không có thuộc tính non-key nào phụ thuộc vào thuộc tính non-key khác)
- Ví dụ: course không chứa course_title trực tiếp, mà tách sang course_localizations

### Các Pattern Áp Dụng:

**1. i18n Pattern (Localization Tables):**
- course_localizations, unit_localizations, skill_localizations, lesson_localizations
- Tách riêng nội dung đa ngôn ngữ, đạt 3NF

**2. Junction Tables with Metadata:**
- lesson_items (có exposure_type)
- lesson_assets (có asset_role, order_index)
- Không vi phạm 3NF vì metadata phụ thuộc vào toàn bộ composite PK

**3. Event Sourcing Pattern:**
- xp_ledger, wallet_transactions, audit_logs
- Append-only, không có update anomalies

**4. Polymorphic Pattern:**
- audit_logs (entity_type + entity_id)
- Dùng JSON cho flexibility, vẫn đạt 3NF cho metadata columns

### Không cần Denormalization vì:
- PostgreSQL performance tốt với joins
- Có thể dùng Redis cache cho hot data
- Materialized views nếu cần aggregate data
- Indexes được thiết kế đúng

---

## Chiến lược Indexing

### PostgreSQL Indexes:

**High Priority (Created immediately):**
```sql
-- Users & Auth
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token_hash ON auth_sessions(access_token_hash);
CREATE INDEX idx_refresh_tokens_session_id ON refresh_tokens(session_id);

-- Learning Progress
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX idx_user_item_mastery_user ON user_item_mastery(user_id);
CREATE INDEX idx_srs_schedules_user_next_review ON srs_schedules(user_id, next_review_at);
CREATE INDEX idx_review_queue_user_due ON review_queue(user_id, due_at);

-- Content
CREATE INDEX idx_lessons_skill ON lessons(skill_id);
CREATE INDEX idx_skills_unit ON skills(unit_id);
CREATE INDEX idx_units_course_version ON units(course_version_id);

-- Gamification
CREATE INDEX idx_xp_ledger_user_created ON xp_ledger(user_id, created_at);
CREATE INDEX idx_user_league_entries_week_league ON user_league_entries(league_week_id, league_id);
```

### MongoDB Indexes:

```javascript
// AI Sessions
db.ai_sessions.createIndex({ user_id: 1, started_at: -1 });
db.ai_messages.createIndex({ ai_session_id: 1, created_at: 1 });
db.ai_invocation_logs.createIndex({ ai_session_id: 1 });
db.ai_invocation_logs.createIndex({ created_at: -1 }); // For analytics
```

### Redis Data Structures:

```
# Review Queue (Sorted Set)
ZADD user:{user_id}:review_queue {due_timestamp} {item_id}

# SRS Cache (Hash)
HSET user:{user_id}:srs_schedules {item_id} {json_data}

# Leaderboard (Sorted Set)
ZADD league:{league_id}:week:{week_id} {xp_total} {user_id}

# Session Cache
SET session:{session_id} {json_data} EX 3600
```

---

## Kết luận

### Thiết kế Database:
✅ **Đạt chuẩn 3NF toàn bộ** - Không có redundancy, update anomalies  
✅ **3 Docker Containers** - PostgreSQL, Redis, MongoDB  
✅ **Polyglot Persistence** - Chọn đúng DB cho từng use case  
✅ **Scalable** - Có thể scale từng DB độc lập  
✅ **Maintainable** - Schema rõ ràng, dễ hiểu, dễ extend

### Migration Path:
1. **Phase 1:** PostgreSQL + Redis (70% features)
2. **Phase 2:** Thêm MongoDB cho AI features
3. **Phase 3:** Scale out với read replicas, sharding nếu cần

### Best Practices Followed:
- Foreign keys enforce referential integrity
- Unique constraints prevent duplicates
- Indexes cho performance
- Timestamp columns cho audit
- Soft delete với status/revoked_at thay vì hard delete
- JSON columns chỉ dùng cho truly flexible data (audit_logs)
