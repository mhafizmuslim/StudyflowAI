import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import onboardingRoutes from './routes/onboarding.js';
import studyRoutes from './routes/study.js';
import chatRoutes from './routes/chat.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StudyFlow AI API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Log when process exits to debug unexpected shutdowns
process.on('exit', (code) => {
  console.log(`Process exiting with code ${code}`);
});

app.listen(PORT, () => {
  console.log(`🚀 StudyFlow AI Server running on http://localhost:${PORT}`);
  console.log(`📊 API docs available at http://localhost:${PORT}/api/health`);
});

