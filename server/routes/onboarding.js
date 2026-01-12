import express from 'express';
import { dbHelpers } from '../database/db.js';
import { verifyToken } from '../middleware/auth.js';
import geminiAgent from '../services/geminiAgent.js';

const router = express.Router();

// Save onboarding responses
router.post('/responses', verifyToken, async (req, res) => {
  try {
    const { responses } = req.body; // Array of { question_id, answer }
    
    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ error: 'Responses harus berupa array' });
    }
    
    // Save all responses
    for (const { question_id, answer } of responses) {
      await dbHelpers.saveOnboardingResponse(
        req.userId,
        question_id,
        typeof answer === 'object' ? JSON.stringify(answer) : answer
      );
    }
    
    res.json({ message: 'Responses saved successfully' });
  } catch (error) {
    console.error('Save onboarding error:', error);
    res.status(500).json({ error: 'Gagal menyimpan responses' });
  }
});

// Generate Learning Persona from onboarding data
router.post('/generate-persona', verifyToken, async (req, res) => {
  try {
    // Get onboarding responses
    const responses = await dbHelpers.getOnboardingResponses(req.userId);
    
    if (responses.length === 0) {
      return res.status(400).json({ error: 'Belum ada data onboarding' });
    }
    
    // Format data untuk Gemini
    const onboardingData = responses.reduce((acc, r) => {
      try {
        acc[r.question_id] = JSON.parse(r.answer);
      } catch {
        acc[r.question_id] = r.answer;
      }
      return acc;
    }, {});
    
    // Analyze dengan Gemini AI
    const analysis = await geminiAgent.analyzeLearningStyle(onboardingData);
    
    // Save to database
    const result = await dbHelpers.createPersona(
      req.userId,
      analysis.gaya_belajar,
      analysis.fokus_level,
      analysis.preferensi_waktu,
      analysis.preferensi_durasi,
      analysis.tingkat_detail,
      analysis.motivasi_type,
      analysis.learning_pace,
      JSON.stringify(analysis)
    );
    
    res.json({
      message: 'Learning Persona berhasil dibuat',
      persona: {
        persona_id: result.persona_id,
        ...analysis
      }
    });
  } catch (error) {
    console.error('Generate persona error:', error);
    res.status(500).json({ error: 'Gagal generate persona: ' + error.message });
  }
});

// Get Learning Persona
router.get('/persona', verifyToken, async (req, res) => {
  try {
    const persona = await dbHelpers.getPersonaByUserId(req.userId);
    
    if (!persona) {
      return res.status(404).json({ error: 'Persona belum dibuat' });
    }
    
    // Parse raw_analysis
    if (persona.raw_analysis) {
      try {
        persona.analysis = JSON.parse(persona.raw_analysis);
      } catch (e) {
        persona.analysis = {};
      }
    }
    
    res.json({ persona });
  } catch (error) {
    console.error('Get persona error:', error);
    res.status(500).json({ error: 'Gagal mengambil persona' });
  }
});

// Check if onboarding is completed
router.get('/status', verifyToken, async (req, res) => {
  try {
    const completed = await dbHelpers.isOnboardingCompleted(req.userId);
    res.json({ onboarding_completed: completed });
  } catch (error) {
    console.error('Check onboarding status error:', error);
    res.status(500).json({ error: 'Gagal cek status onboarding' });
  }
});

export default router;

