import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection pool
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || "studyflow",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
      }
);

// Update pool config
pool.options.max = 20;
pool.options.idleTimeoutMillis = 30000;
pool.options.connectionTimeoutMillis = 10000;

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1);
});

// Initialize schema
const schemaPath = path.join(__dirname, "schema.sql");

async function initDatabase() {
  try {
    // Check if tables exist
    const result = await pool.query(`
      SELECT COUNT(*) 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);

    if (result.rows[0].count === "0") {
      const schema = fs.readFileSync(schemaPath, "utf-8");
      await pool.query(schema);
      console.log("✅ PostgreSQL database schema initialized");
    } else {
      console.log("✅ PostgreSQL database connected");
    }
  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    throw error;
  }
}

// Initialize on startup
initDatabase().catch((error) => {
  console.error("Fatal: Database initialization failed:", error);
  process.exit(1);
});

// Helper functions
export const dbHelpers = {
  pool, // Expose pool for direct queries
  // User operations
  createUser: async (nama, email, password) => {
    const result = await pool.query(
      "INSERT INTO users (nama, email, password) VALUES ($1, $2, $3) RETURNING user_id",
      [nama, email, password]
    );
    return result.rows[0];
  },

  getUserByEmail: async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  getUserById: async (userId) => {
    const result = await pool.query(
      "SELECT user_id, nama, email, tanggal_daftar FROM users WHERE user_id = $1",
      [userId]
    );
    return result.rows[0];
  },

  updateUserPassword: async (userId, newPassword) => {
    await pool.query(
      "UPDATE users SET password = $1 WHERE user_id = $2",
      [newPassword, userId]
    );
  },

  updateUserPhone: async (userId, phone) => {
    await pool.query(
      "UPDATE users SET phone = $1 WHERE user_id = $2",
      [phone, userId]
    );
  },

  // Email verification
  setEmailVerificationToken: async (userId, token) => {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await pool.query(
      "UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE user_id = $3",
      [token, expires, userId]
    );
  },

  verifyEmail: async (token) => {
    const result = await pool.query(
      "UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE email_verification_token = $1 AND email_verification_expires > CURRENT_TIMESTAMP RETURNING user_id",
      [token]
    );
    return result.rows[0];
  },

  // Phone verification
  setPhoneVerificationCode: async (userId, code) => {
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await pool.query(
      "UPDATE users SET phone_verification_code = $1, phone_verification_expires = $2 WHERE user_id = $3",
      [code, expires, userId]
    );
  },

  verifyPhone: async (userId, code) => {
    const result = await pool.query(
      "UPDATE users SET phone_verified = TRUE, phone_verification_code = NULL, phone_verification_expires = NULL WHERE user_id = $1 AND phone_verification_code = $2 AND phone_verification_expires > CURRENT_TIMESTAMP RETURNING user_id",
      [userId, code]
    );
    return result.rows[0];
  },

  getUserVerificationStatus: async (userId) => {
    const result = await pool.query(
      "SELECT email_verified, phone_verified, phone FROM users WHERE user_id = $1",
      [userId]
    );
    return result.rows[0];
  },

  // Learning Persona operations
  createPersona: async (
    userId,
    gayaBelajar,
    fokusLevel,
    preferensiWaktu,
    preferensiDurasi,
    tingkatDetail,
    motivasiType,
    learningPace,
    rawAnalysis
  ) => {
    const result = await pool.query(
      `INSERT INTO learning_persona (
        user_id, gaya_belajar, fokus_level, preferensi_waktu,
        preferensi_durasi, tingkat_detail, motivasi_type, learning_pace, raw_analysis
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING persona_id`,
      [
        userId,
        gayaBelajar,
        fokusLevel,
        preferensiWaktu,
        preferensiDurasi,
        tingkatDetail,
        motivasiType,
        learningPace,
        rawAnalysis,
      ]
    );
    
    // Mark onboarding as completed
    await pool.query(
      "UPDATE users SET onboarding_completed = TRUE WHERE user_id = $1",
      [userId]
    );
    
    return result.rows[0];
  },

  getPersonaByUserId: async (userId) => {
    const result = await pool.query(
      "SELECT * FROM learning_persona WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
    return result.rows[0];
  },

  isOnboardingCompleted: async (userId) => {
    const result = await pool.query(
      "SELECT onboarding_completed FROM users WHERE user_id = $1",
      [userId]
    );
    return result.rows[0]?.onboarding_completed || false;
  },

  updatePersona: async (
    personaId,
    gayaBelajar,
    fokusLevel,
    preferensiWaktu,
    preferensiDurasi,
    tingkatDetail,
    motivasiType,
    learningPace,
    rawAnalysis
  ) => {
    await pool.query(
      `UPDATE learning_persona SET
        gaya_belajar = $1, fokus_level = $2, preferensi_waktu = $3,
        preferensi_durasi = $4, tingkat_detail = $5, motivasi_type = $6,
        learning_pace = $7, raw_analysis = $8, updated_at = CURRENT_TIMESTAMP
      WHERE persona_id = $9`,
      [
        gayaBelajar,
        fokusLevel,
        preferensiWaktu,
        preferensiDurasi,
        tingkatDetail,
        motivasiType,
        learningPace,
        rawAnalysis,
        personaId,
      ]
    );
  },

  // Study Plan operations
  createStudyPlan: async (
    userId,
    mataKuliah,
    topik,
    jadwalBelajar,
    durasi,
    tingkatKesulitan,
    targetTanggal,
    status
  ) => {
    const result = await pool.query(
      `INSERT INTO study_plan (
        user_id, mata_kuliah, topik, jadwal_belajar,
        durasi, tingkat_kesulitan, target_tanggal, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING plan_id`,
      [
        userId,
        mataKuliah,
        topik,
        jadwalBelajar,
        durasi,
        tingkatKesulitan,
        targetTanggal,
        status,
      ]
    );
    return result.rows[0];
  },

  getStudyPlansByUserId: async (userId) => {
    const result = await pool.query(
      "SELECT * FROM study_plan WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC",
      [userId]
    );
    return result.rows;
  },

  getStudyPlanById: async (planId) => {
    const result = await pool.query(
      "SELECT * FROM study_plan WHERE plan_id = $1",
      [planId]
    );
    return result.rows[0];
  },

  // Learning Modules operations
  createLearningModule: async (
    planId,
    judul,
    konten,
    urutan,
    durasiEstimasi,
    tingkatKesulitan,
    moduleType,
    quizData
  ) => {
    const result = await pool.query(
      `INSERT INTO learning_modules (
        plan_id, judul, konten, urutan, durasi_estimasi,
        tingkat_kesulitan, module_type, quiz_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING module_id`,
      [
        planId,
        judul,
        konten,
        urutan,
        durasiEstimasi,
        tingkatKesulitan,
        moduleType,
        quizData,
      ]
    );
    return result.rows[0];
  },

  updateLearningModule: async (planId, moduleOrder, content, quizData) => {
    await pool.query(
      `UPDATE learning_modules SET
        konten = $1,
        quiz_data = $2
      WHERE plan_id = $3 AND urutan = $4`,
      [content, quizData, planId, moduleOrder]
    );
  },

  getModulesByPlanId: async (planId) => {
    const result = await pool.query(
      "SELECT * FROM learning_modules WHERE plan_id = $1 ORDER BY urutan ASC",
      [planId]
    );
    return result.rows;
  },

  getLearningModule: async (planId, moduleOrder) => {
    const result = await pool.query(
      "SELECT * FROM learning_modules WHERE plan_id = $1 AND urutan = $2",
      [planId, moduleOrder]
    );
    return result.rows[0];
  },

  updateModulesDifficultyFromOrder: async (planId, startOrder, newDifficulty) => {
    await pool.query(
      `UPDATE learning_modules SET tingkat_kesulitan = $1 WHERE plan_id = $2 AND urutan > $3`,
      [newDifficulty, planId, startOrder]
    );
  },

  // Learning Sessions operations
  createSession: async (userId, planId) => {
    const result = await pool.query(
      "INSERT INTO learning_sessions (user_id, plan_id, start_time) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING session_id",
      [userId, planId]
    );
    return result.rows[0];
  },

  updateSession: async (sessionId, durasiMenit, pomodoroCount) => {
    await pool.query(
      `UPDATE learning_sessions SET
        end_time = CURRENT_TIMESTAMP,
        durasi_menit = $1,
        pomodoro_count = $2,
        completed = TRUE
      WHERE session_id = $3`,
      [durasiMenit, pomodoroCount, sessionId]
    );
  },

  getActiveSession: async (userId) => {
    const result = await pool.query(
      "SELECT * FROM learning_sessions WHERE user_id = $1 AND completed = FALSE ORDER BY start_time DESC LIMIT 1",
      [userId]
    );
    return result.rows[0];
  },

  getSessionById: async (sessionId) => {
    const result = await pool.query(
      "SELECT * FROM learning_sessions WHERE session_id = $1",
      [sessionId]
    );
    return result.rows[0];
  },

  // Progress operations
  createProgress: async (
    userId,
    planId,
    tanggal,
    durasiBelajar,
    topikDipelajari,
    hasilEvaluasi,
    fokusScore,
    mood,
    catatan
  ) => {
    const result = await pool.query(
      `INSERT INTO learning_progress (
        user_id, plan_id, tanggal, durasi_belajar,
        topik_dipelajari, hasil_evaluasi, fokus_score, mood, catatan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING progress_id`,
      [
        userId,
        planId,
        tanggal,
        durasiBelajar,
        topikDipelajari,
        hasilEvaluasi,
        fokusScore,
        mood,
        catatan,
      ]
    );
    return result.rows[0];
  },

  getProgressByUserId: async (userId) => {
    const result = await pool.query(
      "SELECT * FROM learning_progress WHERE user_id = $1 ORDER BY tanggal DESC LIMIT 30",
      [userId]
    );
    return result.rows;
  },

  getProgressStats: async (userId) => {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(durasi_belajar) as total_minutes,
        AVG(fokus_score) as avg_focus
      FROM learning_progress
      WHERE user_id = $1 AND tanggal >= CURRENT_DATE - INTERVAL '30 days'`,
      [userId]
    );
    return result.rows[0];
  },

  // AI Conversations operations
  saveConversation: async (userId, sessionId, role, message, context) => {
    const result = await pool.query(
      "INSERT INTO ai_conversations (user_id, session_id, role, message, context) VALUES ($1, $2, $3, $4, $5) RETURNING conversation_id",
      [userId, sessionId, role, message, context]
    );
    return result.rows[0];
  },

  getConversationHistory: async (userId) => {
    const result = await pool.query(
      "SELECT * FROM ai_conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    return result.rows;
  },

  getSessionConversations: async (sessionId) => {
    const result = await pool.query(
      "SELECT * FROM ai_conversations WHERE session_id = $1 ORDER BY created_at ASC",
      [sessionId]
    );
    return result.rows;
  },

  getChatSessions: async (userId) => {
    const result = await pool.query(
      `SELECT 
        session_id,
        MIN(created_at) as first_message_at,
        MAX(created_at) as last_message_at,
        COUNT(*) as message_count,
        (SELECT message FROM ai_conversations 
         WHERE session_id = ac.session_id AND role = 'user' 
         ORDER BY created_at ASC LIMIT 1) as first_user_message
      FROM ai_conversations ac
      WHERE user_id = $1 AND session_id IS NOT NULL
      GROUP BY session_id
      ORDER BY MAX(created_at) DESC
      LIMIT 50`,
      [userId]
    );
    return result.rows;
  },

  deleteSession: async (sessionId, userId) => {
    await pool.query(
      "DELETE FROM ai_conversations WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );
  },

  // AI Insights operations
  createInsight: async (
    userId,
    insightType,
    title,
    description,
    data,
    priority
  ) => {
    const result = await pool.query(
      "INSERT INTO ai_insights (user_id, insight_type, title, description, data, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING insight_id",
      [userId, insightType, title, description, data, priority]
    );
    return result.rows[0];
  },

  getUnreadInsights: async (userId) => {
    const result = await pool.query(
      "SELECT * FROM ai_insights WHERE user_id = $1 AND is_read = FALSE ORDER BY priority DESC, created_at DESC",
      [userId]
    );
    return result.rows;
  },

  markInsightRead: async (insightId) => {
    await pool.query(
      "UPDATE ai_insights SET is_read = TRUE WHERE insight_id = $1",
      [insightId]
    );
  },

  // Quiz operations
  saveQuizResult: async (
    userId,
    moduleId,
    score,
    totalQuestions,
    answers,
    timeTaken
  ) => {
    const result = await pool.query(
      "INSERT INTO quiz_results (user_id, module_id, score, total_questions, answers, time_taken) VALUES ($1, $2, $3, $4, $5, $6) RETURNING quiz_id",
      [userId, moduleId, score, totalQuestions, answers, timeTaken]
    );
    return result.rows[0];
  },

  getQuizResultsByUserId: async (userId) => {
    const result = await pool.query(
      "SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
      [userId]
    );
    return result.rows;
  },

  getStudyPlanProgress: async (userId, planId) => {
    // Get total modules for the plan
    const totalModulesResult = await pool.query(
      "SELECT COUNT(*) as total FROM learning_modules WHERE plan_id = $1",
      [planId]
    );
    const totalModules = parseInt(totalModulesResult.rows[0].total);

    // Get completed modules (modules with quiz results)
    const completedModulesResult = await pool.query(
      `SELECT COUNT(DISTINCT qr.module_id) as completed 
       FROM quiz_results qr 
       JOIN learning_modules lm ON qr.module_id = lm.module_id 
       WHERE qr.user_id = $1 AND lm.plan_id = $2`,
      [userId, planId]
    );
    const completedModules = parseInt(completedModulesResult.rows[0].completed);

    // Calculate percentage
    const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    return {
      totalModules,
      completedModules,
      progressPercentage,
      isCompleted: completedModules === totalModules && totalModules > 0
    };
  },

  // Delete operations
  getLearningModuleById: async (moduleId) => {
    const result = await pool.query(
      "SELECT * FROM learning_modules WHERE module_id = $1",
      [moduleId]
    );
    return result.rows[0];
  },

  deleteLearningModule: async (moduleId) => {
    await pool.query("DELETE FROM learning_modules WHERE module_id = $1", [moduleId]);
  },

  deleteQuizResultsByModule: async (moduleId) => {
    await pool.query("DELETE FROM quiz_results WHERE module_id = $1", [moduleId]);
  },

  deleteConversationsByModule: async (moduleId) => {
    await pool.query("DELETE FROM ai_conversations WHERE session_id IN (SELECT session_id FROM learning_sessions WHERE plan_id IN (SELECT plan_id FROM learning_modules WHERE module_id = $1))", [moduleId]);
  },

  // Onboarding operations
  saveOnboardingResponse: async (userId, questionId, answer) => {
    const result = await pool.query(
      "INSERT INTO onboarding_responses (user_id, question_id, answer) VALUES ($1, $2, $3) RETURNING response_id",
      [userId, questionId, answer]
    );
    return result.rows[0];
  },

  getOnboardingResponses: async (userId) => {
    const result = await pool.query(
      "SELECT * FROM onboarding_responses WHERE user_id = $1",
      [userId]
    );
    return result.rows;
  },
};

export default pool;
