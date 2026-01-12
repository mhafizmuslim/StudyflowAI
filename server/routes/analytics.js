import express from 'express';
import { dbHelpers } from '../database/db.js';
import { verifyToken } from '../middleware/auth.js';
import geminiAgent from '../services/geminiAgent.js';

const router = express.Router();

// Get progress stats
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const progress = await dbHelpers.getProgressByUserId(req.userId);
    const stats = await dbHelpers.getProgressStats(req.userId);
    
    res.json({
      progress,
      stats
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Gagal mengambil progress' });
  }
});

// Save learning progress
router.post('/progress', verifyToken, async (req, res) => {
  try {
    const {
      plan_id,
      durasi_belajar,
      topik_dipelajari,
      fokus_score,
      mood,
      catatan
    } = req.body;
    
    console.log('Saving progress for user:', req.userId, 'plan:', plan_id);
    
    const result = await dbHelpers.createProgress(
      req.userId,
      plan_id || null,
      new Date().toISOString().split('T')[0],
      durasi_belajar || 0,
      topik_dipelajari || 'Unknown Topic',
      null,
      fokus_score || 5,
      mood || 'neutral',
      catatan || ''
    );
    
    console.log('Progress saved successfully:', result.progress_id);
    res.json({
      message: 'Progress saved',
      progress_id: result.progress_id
    });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ error: 'Gagal menyimpan progress: ' + error.message });
  }
});

// Generate AI insights from progress
router.post('/insights/generate', verifyToken, async (req, res) => {
  try {
    const persona = await dbHelpers.getPersonaByUserId(req.userId);
    const progress = await dbHelpers.getProgressByUserId(req.userId);
    
    if (!persona) {
      return res.status(400).json({ error: 'Persona belum dibuat' });
    }
    
    if (progress.length < 3) {
      return res.status(400).json({ 
        error: 'Butuh minimal 3 sesi belajar untuk generate insights' 
      });
    }
    
    // Analyze dengan Gemini
    const analysis = await geminiAgent.analyzeProgress(persona, progress);
    
    // Save insights to database
    const insightIds = [];
    for (const insight of analysis.insights) {
      const result = await dbHelpers.createInsight(
        req.userId,
        insight.type,
        insight.title,
        insight.description,
        JSON.stringify({ action: insight.action }),
        insight.priority
      );
      insightIds.push(result.insight_id);
    }
    
    res.json({
      message: 'Insights generated',
      summary: analysis.summary,
      motivational_message: analysis.motivational_message,
      insights: analysis.insights,
      insight_ids: insightIds
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({ error: 'Gagal generate insights: ' + error.message });
  }
});

// Get unread insights
router.get('/insights', verifyToken, async (req, res) => {
  try {
    const insights = await dbHelpers.getUnreadInsights(req.userId);
    
    // Parse data field
    insights.forEach(i => {
      if (i.data) {
        try {
          i.data = JSON.parse(i.data);
        } catch (e) {
          i.data = {};
        }
      }
    });
    
    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Gagal mengambil insights' });
  }
});

// Mark insight as read
router.put('/insights/:insightId/read', verifyToken, async (req, res) => {
  try {
    await dbHelpers.markInsightRead(req.params.insightId);
    res.json({ message: 'Insight marked as read' });
  } catch (error) {
    console.error('Mark insight error:', error);
    res.status(500).json({ error: 'Gagal mark insight' });
  }
});

// Get quiz results
router.get('/quiz-results', verifyToken, async (req, res) => {
  try {
    const results = await dbHelpers.getQuizResultsByUserId(req.userId);
    
    // Parse answers
    results.forEach(r => {
      if (r.answers) {
        try {
          r.answers = JSON.parse(r.answers);
        } catch (e) {
          r.answers = [];
        }
      }
    });
    
    res.json({ results });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Gagal mengambil quiz results' });
  }
});

export default router;

