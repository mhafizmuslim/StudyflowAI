-- StudyFlow AI Database Schema
-- PostgreSQL Database

-- Table: Users
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    phone_verification_code VARCHAR(10),
    email_verification_expires TIMESTAMP,
    phone_verification_expires TIMESTAMP,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    tanggal_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Learning Persona
CREATE TABLE IF NOT EXISTS learning_persona (
    persona_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    gaya_belajar VARCHAR(50) NOT NULL, -- visual, verbal, kinesthetic, mixed
    fokus_level VARCHAR(50) NOT NULL, -- rendah, sedang, tinggi
    preferensi_waktu VARCHAR(50) NOT NULL, -- pagi, sore, malam
    preferensi_durasi INTEGER DEFAULT 25, -- dalam menit (pomodoro)
    tingkat_detail VARCHAR(50) DEFAULT 'sedang', -- ringkas, sedang, detail
    motivasi_type VARCHAR(50), -- achievement, social, personal_growth
    learning_pace VARCHAR(50) DEFAULT 'normal', -- cepat, normal, santai
    raw_analysis TEXT, -- JSON dari Gemini AI analysis
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Table: Study Plan
CREATE TABLE IF NOT EXISTS study_plan (
    plan_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    mata_kuliah VARCHAR(255) NOT NULL,
    topik VARCHAR(500) NOT NULL,
    jadwal_belajar TEXT, -- JSON array of schedule
    durasi INTEGER NOT NULL, -- total durasi dalam menit
    tingkat_kesulitan VARCHAR(50) NOT NULL, -- mudah, sedang, sulit
    target_tanggal DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, paused
    generated_by_ai BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Table: Learning Progress
CREATE TABLE IF NOT EXISTS learning_progress (
    progress_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_id INTEGER,
    tanggal DATE NOT NULL,
    durasi_belajar INTEGER NOT NULL, -- dalam menit
    topik_dipelajari VARCHAR(500),
    hasil_evaluasi TEXT, -- JSON berisi quiz results, understanding level
    fokus_score INTEGER, -- 1-10
    mood VARCHAR(50), -- happy, neutral, frustrated, tired
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES study_plan(plan_id) ON DELETE SET NULL
);

-- Table: Learning Sessions (untuk tracking detail)
CREATE TABLE IF NOT EXISTS learning_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_id INTEGER,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    durasi_menit INTEGER,
    pomodoro_count INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES study_plan(plan_id) ON DELETE SET NULL
);

-- Table: Learning Modules (konten belajar yang di-generate AI)
CREATE TABLE IF NOT EXISTS learning_modules (
    module_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL,
    judul VARCHAR(500) NOT NULL,
    konten TEXT NOT NULL, -- markdown/text content dari Gemini
    urutan INTEGER NOT NULL,
    durasi_estimasi INTEGER, -- dalam menit
    tingkat_kesulitan VARCHAR(50),
    module_type VARCHAR(50), -- intro, core, practice, summary
    quiz_data TEXT, -- JSON berisi quiz questions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES study_plan(plan_id) ON DELETE CASCADE
);

-- Table: Quiz Results
CREATE TABLE IF NOT EXISTS quiz_results (
    quiz_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    module_id INTEGER,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers TEXT, -- JSON array of user answers
    time_taken INTEGER, -- dalam detik
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES learning_modules(module_id) ON DELETE SET NULL
);

-- Table: AI Conversations (chat history dengan AI Tutor)
CREATE TABLE IF NOT EXISTS ai_conversations (
    conversation_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_id INTEGER,
    role VARCHAR(50) NOT NULL, -- user, assistant
    message TEXT NOT NULL,
    context TEXT, -- JSON context untuk Gemini
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES learning_sessions(session_id) ON DELETE SET NULL
);

-- Table: AI Insights (insight dan rekomendasi dari Gemini)
CREATE TABLE IF NOT EXISTS ai_insights (
    insight_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    insight_type VARCHAR(100) NOT NULL, -- learning_pattern, improvement_suggestion, strength, weakness
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    data TEXT, -- JSON data
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Table: Onboarding Responses (untuk menyimpan jawaban quiz onboarding)
CREATE TABLE IF NOT EXISTS onboarding_responses (
    response_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_learning_persona_user ON learning_persona(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_user ON study_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);

