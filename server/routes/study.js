import express from 'express';
import { dbHelpers } from '../database/db.js';
import { verifyToken } from '../middleware/auth.js';
import geminiAgent from '../services/geminiAgent.js';
import pool from '../database/db.js';

const router = express.Router();

// Generate module content on-demand (to save API quota)
router.post('/modules/generate-content', verifyToken, async (req, res) => {
  try {
    const { plan_id, module_order, topic } = req.body;
    
    if (!plan_id || !module_order || !topic) {
      return res.status(400).json({ error: 'plan_id, module_order, dan topic harus diisi' });
    }
    
    // Check if module already has content (with caching)
    const existingModule = await dbHelpers.getLearningModule(plan_id, module_order);
    if (existingModule && existingModule.konten && existingModule.konten.trim() !== '') {
      let quiz = [];
      try {
        quiz = JSON.parse(existingModule.quiz_data || '[]');
      } catch (e) {
        console.error('Error parsing quiz data:', e);
        quiz = [];
      }
      return res.json({ 
        content: existingModule.konten, 
        quiz,
        cached: true 
      });
    }
    
    // Get learning persona
    const persona = await dbHelpers.getPersonaByUserId(req.userId);
    if (!persona) {
      return res.status(400).json({ error: 'Learning persona belum dibuat' });
    }
    
    // Get plan details
    const plan = await dbHelpers.getStudyPlanById(plan_id);
    if (!plan) {
      return res.status(404).json({ error: 'Study plan tidak ditemukan' });
    }
    
    // Generate content dengan Gemini
    const content = await geminiAgent.generateModuleContent(
      persona,
      topic,
      module_order === 1 ? 'intro' : 'core'
    );
    
    // Generate quiz
    const quiz = await geminiAgent.generateQuiz(
      topic,
      plan.tingkat_kesulitan,
      35,
      persona
    );
    
    // Update module with generated content
    if (existingModule) {
      await dbHelpers.updateLearningModule(plan_id, module_order, content, JSON.stringify(quiz));
    } else {
      await dbHelpers.createLearningModule(
        plan_id,
        topic,
        content,
        module_order,
        25, // default duration
        plan.tingkat_kesulitan,
        module_order === 1 ? 'intro' : 'core',
        JSON.stringify(quiz)
      );
    }
    
    res.json({ content, quiz });
  } catch (error) {
    console.error('Generate module content error:', error);
    
    if (error.message === 'API_QUOTA_EXCEEDED') {
      return res.status(429).json({
        error: 'Kuota API Gemini telah habis',
        message: 'Tidak dapat generate konten baru saat ini.',
        suggestions: [
          'Coba lagi besok setelah reset kuota harian',
          'Gunakan konten yang sudah ada'
        ]
      });
    }
    
    res.status(500).json({ error: 'Gagal generate konten module: ' + error.message });
  }
});

// Generate Study Plan
router.post('/plans', verifyToken, async (req, res) => {
  try {
    const { mata_kuliah, topik, tingkat_kesulitan } = req.body;
    
    if (!mata_kuliah || !topik) {
      return res.status(400).json({ error: 'Mata kuliah dan topik harus diisi' });
    }
    
    // Get learning persona
    const persona = await dbHelpers.getPersonaByUserId(req.userId);
    if (!persona) {
      return res.status(400).json({ error: 'Learning persona belum dibuat' });
    }
    
    // Generate study plan dengan Gemini
    const plan = await geminiAgent.generateStudyPlan(
      persona,
      mata_kuliah,
      topik,
      tingkat_kesulitan || 'sedang'
    );
    
    // Parse total_durasi - handle various time formats
    let totalDurasi = plan.total_durasi;
    if (typeof totalDurasi === 'string') {
      // Handle formats like "3 jam 45 menit", "120 menit", "2 jam", etc.
      const jamMatch = totalDurasi.match(/(\d+)\s*jam/i);
      const menitMatch = totalDurasi.match(/(\d+)\s*menit/i);
      
      let totalMenit = 0;
      if (jamMatch) {
        totalMenit += parseInt(jamMatch[1]) * 60; // convert hours to minutes
      }
      if (menitMatch) {
        totalMenit += parseInt(menitMatch[1]);
      }
      
      // If no matches found, try to extract any number
      if (totalMenit === 0) {
        const numberMatch = totalDurasi.match(/(\d+)/);
        totalMenit = numberMatch ? parseInt(numberMatch[1]) : 60;
      }
      
      totalDurasi = totalMenit;
    } else if (typeof totalDurasi !== 'number' || isNaN(totalDurasi)) {
      totalDurasi = 60; // default 60 minutes
    }
    
    // Parse target_hari - handle various formats
    let targetHari = plan.target_hari;
    if (typeof targetHari === 'string') {
      const hariMatch = targetHari.match(/(\d+)\s*hari/i);
      if (hariMatch) {
        targetHari = parseInt(hariMatch[1]);
      } else {
        const numberMatch = targetHari.match(/(\d+)/);
        targetHari = numberMatch ? parseInt(numberMatch[1]) : 7;
      }
    } else if (typeof targetHari !== 'number' || isNaN(targetHari)) {
      targetHari = 7; // default 7 days
    }
    
    // Calculate target date from today (server local time)
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + targetHari);
    const targetTanggal = targetDate.toISOString().split('T')[0];
    
    // Save to database
    const result = await dbHelpers.createStudyPlan(
      req.userId,
      mata_kuliah,
      topik,
      JSON.stringify(plan.jadwal),
      totalDurasi,
      plan.tingkat_kesulitan,
      targetTanggal,
      'active'
    );
    
    const planId = result.plan_id;
    
    // Create modules without content (generate on-demand to save API quota)
    for (let i = 0; i < plan.jadwal.length; i++) {
      const jadwal = plan.jadwal[i];
      
      // Parse module duration
      let moduleDurasi = jadwal.durasi;
      if (typeof moduleDurasi === 'string') {
        // Handle formats like "45 menit", "1 jam 30 menit", etc.
        const jamMatch = moduleDurasi.match(/(\d+)\s*jam/i);

  // Generate Study Plan dari materi (pdf/ppt/doc yang sudah diekstrak jadi teks)
  router.post('/plans/from-material', verifyToken, async (req, res) => {
    try {
      const { mata_kuliah, topik, material_text, tingkat_kesulitan, question_count, learning_goal, preferred_format, detail_level, focus_keywords } = req.body;

      if (!mata_kuliah || !material_text) {
        return res.status(400).json({ error: 'Mata kuliah dan material_text harus diisi' });
      }

      // Get learning persona
      const persona = await dbHelpers.getPersonaByUserId(req.userId);
      if (!persona) {
        return res.status(400).json({ error: 'Learning persona belum dibuat' });
      }

      // Generate study plan berbasis materi
      const plan = await geminiAgent.generateStudyPlanFromMaterial(
        persona,
        mata_kuliah,
        topik || mata_kuliah,
        material_text,
        tingkat_kesulitan || 'sedang',
        {
          learning_goal,
          preferred_format,
          detail_level,
          focus_keywords
        }
      );

      // Parse total_durasi - handle various time formats
      let totalDurasi = plan.total_durasi;
      if (typeof totalDurasi === 'string') {
        const jamMatch = totalDurasi.match(/(\d+)\s*jam/i);
        const menitMatch = totalDurasi.match(/(\d+)\s*menit/i);

        let totalMenit = 0;
        if (jamMatch) totalMenit += parseInt(jamMatch[1]) * 60;
        if (menitMatch) totalMenit += parseInt(menitMatch[1]);
        if (totalMenit === 0) {
          const numberMatch = totalDurasi.match(/(\d+)/);
          totalMenit = numberMatch ? parseInt(numberMatch[1]) : 60;
        }

        totalDurasi = totalMenit;
      } else if (typeof totalDurasi !== 'number' || isNaN(totalDurasi)) {
        totalDurasi = 60;
      }

      // Parse target_hari - handle various formats
      let targetHari = plan.target_hari;
      if (typeof targetHari === 'string') {
        const hariMatch = targetHari.match(/(\d+)\s*hari/i);
        if (hariMatch) {
          targetHari = parseInt(hariMatch[1]);
        } else {
          const numberMatch = targetHari.match(/(\d+)/);
          targetHari = numberMatch ? parseInt(numberMatch[1]) : 7;
        }
      } else if (typeof targetHari !== 'number' || isNaN(targetHari)) {
        targetHari = 7;
      }

      // Calculate target date from today (server local time)
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + targetHari);
      const targetTanggal = targetDate.toISOString().split('T')[0];

      // Save to database
      const result = await dbHelpers.createStudyPlan(
        req.userId,
        mata_kuliah,
        topik || mata_kuliah,
        JSON.stringify(plan.jadwal),
        totalDurasi,
        plan.tingkat_kesulitan,
        targetTanggal,
        'active'
      );

      const planId = result.plan_id;

      // Create modules placeholder
      for (let i = 0; i < plan.jadwal.length; i++) {
        const jadwal = plan.jadwal[i];

        let moduleDurasi = jadwal.durasi;
        if (typeof moduleDurasi === 'string') {
          const jamMatch = moduleDurasi.match(/(\d+)\s*jam/i);
          const menitMatch = moduleDurasi.match(/(\d+)\s*menit/i);

          let totalMenit = 0;
          if (jamMatch) totalMenit += parseInt(jamMatch[1]) * 60;
          if (menitMatch) totalMenit += parseInt(menitMatch[1]);
          if (totalMenit === 0) {
            const numberMatch = moduleDurasi.match(/(\d+)/);
            totalMenit = numberMatch ? parseInt(numberMatch[1]) : 25;
          }

          moduleDurasi = totalMenit;
        } else if (typeof moduleDurasi !== 'number' || isNaN(moduleDurasi)) {
          moduleDurasi = 25;
        }

        await dbHelpers.createLearningModule(
          planId,
          jadwal.topik,
          '',
          i + 1,
          moduleDurasi,
          plan.tingkat_kesulitan,
          i === 0 ? 'intro' : i === plan.jadwal.length - 1 ? 'summary' : 'core',
          '[]'
        );
      }

      // Generate quiz langsung dari materi dosen
      const quiz = await geminiAgent.generateQuizFromMaterial(
        material_text,
        topik || mata_kuliah,
        tingkat_kesulitan || 'sedang',
        Number.isFinite(question_count) ? Math.min(Math.max(question_count, 5), 35) : 15,
        persona
      );

      res.json({
        message: 'Study plan dari materi dosen berhasil dibuat',
        plan: {
          plan_id: planId,
          ...plan
        },
        quiz
      });
    } catch (error) {
      console.error('Create study plan from material error:', error);

      if (error.message === 'MATERIAL_EMPTY') {
        return res.status(400).json({ error: 'Material kosong/tidak terbaca' });
      }

      if (error.message === 'API_QUOTA_EXCEEDED') {
        return res.status(429).json({
          error: 'Kuota API Gemini telah habis',
          message: 'Tidak dapat generate konten baru saat ini. Coba lagi besok setelah reset kuota harian.'
        });
      }

      res.status(500).json({ error: 'Gagal membuat study plan dari materi: ' + error.message });
    }
  });
        const menitMatch = moduleDurasi.match(/(\d+)\s*menit/i);
        
        let totalMenit = 0;
        if (jamMatch) {
          totalMenit += parseInt(jamMatch[1]) * 60;
        }
        if (menitMatch) {
          totalMenit += parseInt(menitMatch[1]);
        }
        
        // If no matches found, try to extract any number
        if (totalMenit === 0) {
          const numberMatch = moduleDurasi.match(/(\d+)/);
          totalMenit = numberMatch ? parseInt(numberMatch[1]) : 25;
        }
        
        moduleDurasi = totalMenit;
      } else if (typeof moduleDurasi !== 'number' || isNaN(moduleDurasi)) {
        moduleDurasi = 25; // default 25 minutes
      }
      
      await dbHelpers.createLearningModule(
        planId,
        jadwal.topik,
        '', // Empty content - will be generated on-demand
        i + 1,
        moduleDurasi,
        plan.tingkat_kesulitan,
        i === 0 ? 'intro' : i === plan.jadwal.length - 1 ? 'summary' : 'core',
        '[]' // Empty quiz - will be generated on-demand
      );
    }
    
    res.json({
      message: 'Study plan berhasil dibuat',
      plan: {
        plan_id: planId,
        ...plan
      }
    });
  } catch (error) {
    console.error('Create study plan error:', error);

    // Handle specific API quota exceeded error
    if (error.message === 'API_QUOTA_EXCEEDED') {
      return res.status(429).json({
        error: 'Kuota API Gemini telah habis',
        message: 'Anda telah mencapai batas penggunaan API Gemini gratis (20 request/hari). Untuk melanjutkan, Anda bisa:',
        suggestions: [
          'Tunggu hingga besok untuk reset kuota harian',
          'Upgrade ke paket berbayar Gemini API',
          'Gunakan fitur yang sudah ada tanpa membuat study plan baru'
        ],
        details: 'Free tier Gemini API hanya mengizinkan 20 request per hari per model.'
      });
    }

    res.status(500).json({ error: 'Gagal membuat study plan: ' + error.message });
  }
});

// Get all study plans
router.get('/plans', verifyToken, async (req, res) => {
  try {
    const plans = await dbHelpers.getStudyPlansByUserId(req.userId);
    
    // Parse jadwal_belajar and add progress for each plan
    const plansWithProgress = await Promise.all(plans.map(async (plan) => {
      const progress = await dbHelpers.getStudyPlanProgress(req.userId, plan.plan_id);
      return {
        ...plan,
        jadwal_belajar: JSON.parse(plan.jadwal_belajar || '[]'),
        progress
      };
    }));
    
    res.json({ plans: plansWithProgress });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Gagal mengambil study plans' });
  }
});

// Get study plan by ID with modules
router.get('/plans/:planId', verifyToken, async (req, res) => {
  try {
    const plan = await dbHelpers.getStudyPlanById(req.params.planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Study plan tidak ditemukan' });
    }
    
    if (plan.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get modules
    const modules = await dbHelpers.getModulesByPlanId(plan.plan_id);
    
    // Get progress for this plan
    const progress = await dbHelpers.getStudyPlanProgress(req.userId, plan.plan_id);
    
    // Parse JSON fields
    plan.jadwal_belajar = JSON.parse(plan.jadwal_belajar || '[]');
    modules.forEach(m => {
      m.quiz_data = JSON.parse(m.quiz_data || '{}');
    });
    
    res.json({
      plan,
      modules,
      progress
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Gagal mengambil plan' });
  }
});

// Start learning session
router.post('/sessions', verifyToken, async (req, res) => {
  try {
    const { plan_id } = req.body;
    
    console.log('Starting session for user:', req.userId, 'plan:', plan_id);
    
    if (!plan_id) {
      return res.status(400).json({ error: 'Plan ID diperlukan' });
    }
    
    // Check if plan exists and belongs to user
    const plan = await dbHelpers.getStudyPlanById(plan_id);
    if (!plan) {
      return res.status(404).json({ error: 'Study plan tidak ditemukan' });
    }
    
    if (plan.user_id !== req.userId) {
      return res.status(403).json({ error: 'Plan tidak milik user ini' });
    }
    
    // Check if there's active session
    const activeSession = await dbHelpers.getActiveSession(req.userId);
    if (activeSession) {
      // Return the active session instead of error
      console.log('Found active session:', activeSession.session_id);
      return res.json({
        message: 'Melanjutkan sesi aktif',
        session_id: activeSession.session_id,
        resumed: true
      });
    }
    
    const result = await dbHelpers.createSession(req.userId, plan_id);
    console.log('Created new session:', result.session_id);
    
    res.json({
      message: 'Sesi belajar dimulai',
      session_id: result.session_id,
      resumed: false
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Gagal memulai sesi: ' + error.message });
  }
});

// End learning session
router.put('/sessions/:sessionId/end', verifyToken, async (req, res) => {
  try {
    const { durasi_menit, pomodoro_count } = req.body;
    const sessionId = req.params.sessionId;
    
    console.log('Ending session:', sessionId, 'for user:', req.userId);
    
    // Validate session exists and belongs to user
    const session = await dbHelpers.getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session tidak ditemukan' });
    }
    
    if (session.user_id !== req.userId) {
      return res.status(403).json({ error: 'Session tidak milik user ini' });
    }
    
    await dbHelpers.updateSession(
      sessionId,
      durasi_menit,
      pomodoro_count
    );
    
    console.log('Session ended successfully:', sessionId);

    // Create simple session summary
    let summary = `Sesi selesai (${durasi_menit} menit). ${pomodoro_count || 0} pomodoro.`;
    
    // Get next module if session has a plan_id
    if (session.plan_id) {
      try {
        const modules = await dbHelpers.getModulesByPlanId(session.plan_id);
        const nextModule = modules.find(m => !m.konten || m.konten.trim() === '') || modules.find(m => m.urutan === (modules?.length ? modules.length : 1));
        if (nextModule) {
          summary += ` Lanjutkan ke modul berikutnya: ${nextModule?.judul || nextModule?.topik || 'modul selanjutnya'}.`;
        }
      } catch (err) {
        console.log('Could not fetch next module:', err.message);
      }
    }

    res.json({ message: 'Sesi berakhir', summary });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Gagal mengakhiri sesi: ' + error.message });
  }
});
// Get active session
router.get('/sessions/active', verifyToken, async (req, res) => {
  try {
    const activeSession = await dbHelpers.getActiveSession(req.userId);
    
    if (activeSession) {
      res.json({ session: activeSession });
    } else {
      res.json({ session: null });
    }
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ error: 'Gagal mengambil sesi aktif' });
  }
});

// Review queue: compile wrong answers from recent quiz results
router.get('/review-queue', verifyToken, async (req, res) => {
  try {
    const results = await dbHelpers.getQuizResultsByUserId(req.userId);
    const queue = [];
    for (const r of results.slice(0, 50)) { // limit
      let answers = [];
      try { answers = JSON.parse(r.answers || '[]'); } catch { answers = []; }
      const wrongs = answers.filter(a => a && a.is_correct === false);
      wrongs.forEach(a => {
        queue.push({
          module_id: r.module_id,
          question: a.question,
          user_answer: a.user_answer,
          correct_answer: a.correct_answer,
          time_taken: r.time_taken
        });
      });
    }
    res.json({ items: queue });
  } catch (error) {
    console.error('Get review queue error:', error);
    res.status(500).json({ error: 'Gagal mengambil review queue' });
  }
});
// Save quiz result
router.post('/quiz-results', verifyToken, async (req, res) => {
  try {
    const { module_id, score, total_questions, answers, time_taken } = req.body;
    
    const result = await dbHelpers.saveQuizResult(
      req.userId,
      module_id,
      score,
      total_questions,
      JSON.stringify(answers),
      time_taken
    );
    
    // Save to progress
    await dbHelpers.createProgress(
      req.userId,
      null,
      new Date().toISOString().split('T')[0],
      Math.floor(time_taken / 60),
      `Quiz module ${module_id}`,
      JSON.stringify({ score, total_questions, percentage: (score / total_questions * 100) }),
      score >= total_questions * 0.7 ? 8 : 5,
      score >= total_questions * 0.7 ? 'happy' : 'neutral',
      null
    );
    
    // Explain mistakes for wrong answers
    const module = await dbHelpers.getLearningModuleById(module_id);
    let mistakeExplanations = [];
    if (module && Array.isArray(answers)) {
      for (const a of answers) {
        // expected shape: { question, user_answer, correct_answer, is_correct }
        if (!a?.is_correct && a?.question && a?.user_answer && a?.correct_answer) {
          try {
            const exp = await geminiAgent.explainMistake(
              module.konten || '',
              a.question,
              a.user_answer,
              a.correct_answer
            );
            mistakeExplanations.push({ question: a.question, explanation: exp });
          } catch (e) {
            mistakeExplanations.push({ question: a.question, explanation: 'Penjelasan tidak tersedia saat ini.' });
          }
        }
      }
    }

    // Adaptive difficulty: update upcoming modules based on score
    try {
      if (module) {
        const planId = module.plan_id;
        const currentOrder = module.urutan;
        const percentage = (score / total_questions) * 100;
        let newDifficulty;
        if (percentage >= 85) newDifficulty = 'sulit';
        else if (percentage >= 60) newDifficulty = 'sedang';
        else newDifficulty = 'mudah';

        await pool.query(
          `UPDATE learning_modules SET tingkat_kesulitan = $1 WHERE plan_id = $2 AND urutan > $3`,
          [newDifficulty, planId, currentOrder]
        );
      }
    } catch (e) {
      console.warn('Adaptive difficulty update failed:', e.message);
    }

    res.json({
      message: 'Quiz result saved',
      quiz_id: result.quiz_id,
      mistake_explanations: mistakeExplanations
    });
  } catch (error) {
    console.error('Save quiz error:', error);
    res.status(500).json({ error: 'Gagal menyimpan quiz result' });
  }
});

// Delete learning module
router.delete('/modules/:moduleId', verifyToken, async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    
    // Check if module exists and get plan info
    const module = await dbHelpers.getLearningModuleById(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module tidak ditemukan' });
    }
    
    // Check if plan belongs to user
    const plan = await dbHelpers.getStudyPlanById(module.plan_id);
    if (!plan) {
      return res.status(404).json({ error: 'Study plan tidak ditemukan' });
    }
    
    if (plan.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Delete related data first (cascade delete will handle this, but let's be explicit)
    await dbHelpers.deleteQuizResultsByModule(moduleId);
    await dbHelpers.deleteConversationsByModule(moduleId);
    
    // Delete the module
    await dbHelpers.deleteLearningModule(moduleId);
    
    res.json({ message: 'Module berhasil dihapus' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Gagal menghapus module: ' + error.message });
  }
});

// Update target tanggal study plan
router.put('/plans/:planId/target-date', verifyToken, async (req, res) => {
  try {
    const planId = req.params.planId;
    const { target_days } = req.body; // Number of days from today
    
    // Check if plan exists and belongs to user
    const plan = await dbHelpers.getStudyPlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Study plan tidak ditemukan' });
    }
    
    if (plan.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Calculate new target date from today
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (target_days || 7));
    const targetTanggal = targetDate.toISOString().split('T')[0];
    
    // Update target_tanggal
    await pool.query(
      "UPDATE study_plan SET target_tanggal = $1 WHERE plan_id = $2",
      [targetTanggal, planId]
    );
    
    res.json({ 
      message: 'Target tanggal berhasil diupdate',
      target_tanggal: targetTanggal
    });
  } catch (error) {
    console.error('Update target date error:', error);
    res.status(500).json({ error: 'Gagal update target tanggal: ' + error.message });
  }
});

// Fix all study plans target dates to be calculated from today
router.post('/plans/fix-dates', verifyToken, async (req, res) => {
  try {
    // Get all user's active study plans
    const plans = await dbHelpers.getStudyPlansByUserId(req.userId);
    
    let updated = 0;
    for (const plan of plans) {
      // Parse jadwal to get target_hari
      let jadwal;
      try {
        jadwal = typeof plan.jadwal_belajar === 'string' 
          ? JSON.parse(plan.jadwal_belajar) 
          : plan.jadwal_belajar;
      } catch {
        jadwal = [];
      }
      
      // Estimate target days (use jadwal length as base)
      const targetDays = jadwal.length || 7;
      
      // Calculate new target date from today
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + targetDays);
      const targetTanggal = targetDate.toISOString().split('T')[0];
      
      // Update only if different
      if (plan.target_tanggal !== targetTanggal) {
        await pool.query(
          "UPDATE study_plan SET target_tanggal = $1 WHERE plan_id = $2",
          [targetTanggal, plan.plan_id]
        );
        updated++;
      }
    }
    
    res.json({ 
      message: `Berhasil update ${updated} study plan(s)`,
      total_plans: plans.length,
      updated_count: updated
    });
  } catch (error) {
    console.error('Fix dates error:', error);
    res.status(500).json({ error: 'Gagal fix tanggal: ' + error.message });
  }
});

// Delete study plan
router.delete('/plans/:planId', verifyToken, async (req, res) => {
  try {
    const planId = req.params.planId;
    
    // Check if plan exists and belongs to user
    const plan = await dbHelpers.getStudyPlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Study plan tidak ditemukan' });
    }
    
    if (plan.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get all modules for this plan
    const modules = await dbHelpers.getModulesByPlanId(planId);
    
    // Delete related data for each module
    for (const module of modules) {
      await dbHelpers.deleteQuizResultsByModule(module.module_id);
      await dbHelpers.deleteConversationsByModule(module.module_id);
    }
    
    // Delete all modules (cascade delete should handle this, but let's be explicit)
    // Note: In a real implementation, you'd want cascade delete in the database schema
    
    // Delete the plan (this will cascade delete modules if set up properly)
    // For now, we'll delete modules manually
    await pool.query("DELETE FROM learning_modules WHERE plan_id = $1", [planId]);
    await pool.query("DELETE FROM study_plan WHERE plan_id = $1", [planId]);
    
    res.json({ message: 'Study plan berhasil dihapus' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Gagal menghapus study plan: ' + error.message });
  }
});

export default router;

