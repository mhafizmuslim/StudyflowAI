const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  // Helper untuk fetch dengan auth
  fetch: async (endpoint, options = {}) => {
    const token = localStorage.getItem('studyflow-auth')
      ? JSON.parse(localStorage.getItem('studyflow-auth')).state.token
      : null;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        // Token expired, logout
        localStorage.removeItem('studyflow-auth');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
      const error = await res.json();
      const errorObj = new Error(error.error || 'Request failed');
      errorObj.response = res;
      errorObj.details = error;
      throw errorObj;
    }
    
    return res.json();
  },
  
  // Onboarding
  saveOnboardingResponses: (responses) => 
    api.fetch('/onboarding/responses', {
      method: 'POST',
      body: JSON.stringify({ responses })
    }),
  
  generatePersona: () => 
    api.fetch('/onboarding/generate-persona', { method: 'POST' }),
  
  getPersona: () => 
    api.fetch('/onboarding/persona'),
  
  getOnboardingStatus: () => 
    api.fetch('/onboarding/status'),
  
  // Study Plans
  createStudyPlan: (data) => 
    api.fetch('/study/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  createStudyPlanFromMaterial: (data) =>
    api.fetch('/study/plans/from-material', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  getStudyPlans: () => 
    api.fetch('/study/plans'),
  
  getStudyPlan: (planId) => 
    api.fetch(`/study/plans/${planId}`),
  
  generateModuleContent: (data) => 
    api.fetch('/study/modules/generate-content', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  // Sessions
  startSession: (plan_id) => 
    api.fetch('/study/sessions', {
      method: 'POST',
      body: JSON.stringify({ plan_id })
    }),
  
  getActiveSession: () => 
    api.fetch('/study/sessions/active'),
  
  endSession: (sessionId, data) => 
    api.fetch(`/study/sessions/${sessionId}/end`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getReviewQueue: () => 
    api.fetch('/study/review-queue'),
  
  // Quiz
  saveQuizResult: (data) => 
    api.fetch('/study/quiz-results', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  // Chat
  chatWithTutor: (message, session_id, userTimeMeta) => 
    api.fetch('/chat/tutor', {
      method: 'POST',
      body: JSON.stringify({ message, session_id, userTimeMeta })
    }),
  
  getChatHistory: (session_id) => 
    api.fetch(`/chat/history${session_id ? `?session_id=${session_id}` : ''}`),
  
  getChatSessions: () =>
    api.fetch('/chat/sessions'),
  
  deleteSession: (sessionId) =>
    api.fetch(`/chat/sessions/${sessionId}`, { method: 'DELETE' }),
  
  // Analytics
  getProgress: () => 
    api.fetch('/analytics/progress'),
  
  saveProgress: (data) => 
    api.fetch('/analytics/progress', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  generateInsights: () => 
    api.fetch('/analytics/insights/generate', { method: 'POST' }),
  
  getInsights: () => 
    api.fetch('/analytics/insights'),
  
  markInsightRead: (insightId) => 
    api.fetch(`/analytics/insights/${insightId}/read`, { method: 'PUT' }),
  
  getQuizResults: () => 
    api.fetch('/analytics/quiz-results'),
  
  // User Management
  changePassword: (data) => 
    api.fetch('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  // Email Verification
  sendEmailVerification: () => 
    api.fetch('/auth/send-email-verification', { method: 'POST' }),
  
  verifyEmail: (token) => 
    api.fetch('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    }),
  
  // Phone Verification
  updatePhone: (phone) => 
    api.fetch('/auth/phone', {
      method: 'PUT',
      body: JSON.stringify({ phone })
    }),
  
  sendPhoneVerification: () => 
    api.fetch('/auth/send-phone-verification', { method: 'POST' }),
  
  verifyPhone: (code) => 
    api.fetch('/auth/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ code })
    }),
  
  getVerificationStatus: () => 
    api.fetch('/auth/verification-status'),
  
  deleteModule: (moduleId) => 
    api.fetch(`/study/modules/${moduleId}`, { method: 'DELETE' }),
  
  deleteStudyPlan: (planId) => 
    api.fetch(`/study/plans/${planId}`, { method: 'DELETE' }),
  
  fixStudyPlanDates: () =>
    api.fetch('/study/plans/fix-dates', { method: 'POST' })
};

