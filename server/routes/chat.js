import express from 'express';
import { dbHelpers } from '../database/db.js';
import { verifyToken } from '../middleware/auth.js';
import geminiAgent from '../services/geminiAgent.js';

const router = express.Router();

// Chat with AI Tutor
router.post('/tutor', verifyToken, async (req, res) => {
  try {
    const { message, session_id: incomingSessionId, userTimeMeta } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message tidak boleh kosong' });
    }
    
    // Generate session_id jika belum ada
    let session_id = incomingSessionId;
    if (!session_id) {
      // Get last session_id from database and increment
      const lastSessionResult = await dbHelpers.pool.query(
        'SELECT MAX(session_id) as max_id FROM ai_conversations WHERE user_id = $1',
        [req.userId]
      );
      const maxId = lastSessionResult.rows[0]?.max_id || 0;
      session_id = maxId + 1;
    }

    // Get learning persona
    const persona = await dbHelpers.getPersonaByUserId(req.userId);
    if (!persona) {
      return res.status(400).json({ error: 'Learning persona belum dibuat' });
    }
    
    // Get conversation history (last 10 messages)
    const history = session_id
      ? (await dbHelpers.getSessionConversations(session_id)).slice(-10)
      : (await dbHelpers.getConversationHistory(req.userId)).slice(0, 10).reverse();
    
    // Save user message
    await dbHelpers.saveConversation(
      req.userId,
      session_id,
      'user',
      message,
      null
    );
    
    // Get AI response
    const response = await geminiAgent.chatWithTutor(
      message,
      persona,
      history,
      userTimeMeta
    );
    
    // Save AI response
    await dbHelpers.saveConversation(
      req.userId,
      session_id,
      'assistant',
      response,
      null
    );
    
    res.json({
      message: response,
      session_id: session_id
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Gagal chat dengan AI: ' + error.message });
  }
});

// Get chat history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { session_id } = req.query;
    
    const history = session_id
      ? await dbHelpers.getSessionConversations(session_id)
      : await dbHelpers.getConversationHistory(req.userId);
    
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Gagal mengambil history' });
  }
});

// Get all chat sessions
router.get('/sessions', verifyToken, async (req, res) => {
  try {
    const sessions = await dbHelpers.getChatSessions(req.userId);
    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Gagal mengambil sessions' });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    await dbHelpers.deleteSession(sessionId, req.userId);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Gagal menghapus session' });
  }
});

export default router;

