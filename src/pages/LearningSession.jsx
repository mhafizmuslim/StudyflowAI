import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Clock, 
  CheckCircle, MessageCircle, Brain, Sparkles,
  Coffee, Target, Loader, AlertCircle
} from 'lucide-react';

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK = 5 * 60; // 5 minutes

export default function LearningSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const { persona } = useAuthStore();
  
  const [module, setModule] = useState(null);
  const [content, setContent] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  
  // Focus & Mood tracking
  const [focusScore, setFocusScore] = useState(7);
  const [mood, setMood] = useState('neutral');
  const [notes, setNotes] = useState('');
  const [totalMinutes, setTotalMinutes] = useState(0);
  
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEndSession, setShowEndSession] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [quizAttempted, setQuizAttempted] = useState(false);
  
  useEffect(() => {
    loadModule();
  }, []);
  
  // Pomodoro Timer Effect
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer selesai
          handleTimerComplete();
          return isBreak ? SHORT_BREAK : POMODORO_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, isBreak]);
  
  // Track total minutes
  useEffect(() => {
    if (isRunning && !isBreak) {
      const interval = setInterval(() => {
        setTotalMinutes((prev) => prev + 1/60);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isBreak]);
  
  const generateContentAsync = async (module, planId) => {
    setContentLoading(true);
    setContentError(null);
    
    try {
      console.log('Generating content for module:', module.judul);
      const generated = await api.generateModuleContent({
        plan_id: planId,
        module_order: module.urutan,
        topic: module.judul
      });
      
      // Update content and quiz
      setContent(generated.content);
      if (generated.quiz && generated.quiz.questions && Array.isArray(generated.quiz.questions) && generated.quiz.questions.length > 0) {
        setQuiz(generated.quiz);
      }
      
      // Show success message if it was cached/fallback
      if (generated.cached || generated.fallback) {
        console.log('Content loaded from cache/fallback');
      }
    } catch (genError) {
      console.error('Failed to generate content:', genError);
      setContentError(genError.message || 'Gagal memuat konten');
      setContent('Gagal memuat konten. Silakan refresh halaman atau coba lagi nanti.');
      setQuiz(null);
    } finally {
      setContentLoading(false);
    }
  };
  
  const loadModule = async () => {
    try {
      let moduleId = location.state?.moduleId;
      let planId = location.state?.planId;
      
      // Try to recover from sessionStorage if location.state is not available
      if (!moduleId || !planId) {
        const stored = sessionStorage.getItem(`learning-session-${sessionId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          moduleId = parsed.moduleId;
          planId = parsed.planId;
        }
      }
      
      if (!moduleId || !planId) {
        throw new Error('Module ID atau Plan ID tidak ditemukan. Silakan mulai ulang sesi belajar dari Study Plan.');
      }
      
      // Store in sessionStorage for recovery
      sessionStorage.setItem(`learning-session-${sessionId}`, JSON.stringify({ moduleId, planId }));
      
      const data = await api.getStudyPlan(planId);
      const foundModule = data.modules.find(m => m.module_id === moduleId);
      
      if (!foundModule) {
        throw new Error('Module tidak ditemukan');
      }
      
      setModule(foundModule);
      
      // Set initial content (might be empty)
      setContent(foundModule.konten || 'Konten sedang dimuat...');
      
      // Generate content asynchronously if not present
      if (!foundModule.konten || foundModule.konten.trim() === '') {
        generateContentAsync(foundModule, planId);
      } else {
        // Content already exists, parse quiz if available
        const quizData = foundModule.quiz_data;
        if (quizData && quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
          setQuiz(quizData);
        }
      }
      
      // Set timer based on persona preference
      if (persona?.preferensi_durasi) {
        setTimeLeft(persona.preferensi_durasi * 60);
      }
    } catch (err) {
      alert(err.message);
      navigate('/dashboard');
    } finally {
      setContentLoading(false);
    }
  };
  
  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (!isBreak) {
      // Pomodoro selesai
      setPomodoroCount((prev) => prev + 1);
      setIsBreak(true);
      setTimeLeft(SHORT_BREAK);
      
      // Play sound or notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro selesai! 🎉', {
          body: 'Waktunya istirahat 5 menit',
        });
      }
    } else {
      // Break selesai
      setIsBreak(false);
      setTimeLeft(persona?.preferensi_durasi * 60 || POMODORO_DURATION);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break selesai! 💪', {
          body: 'Lanjut belajar lagi yuk!',
        });
      }
    }
  };
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(persona?.preferensi_durasi * 60 || POMODORO_DURATION);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStartQuiz = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      alert('Quiz tidak tersedia untuk module ini.');
      return;
    }
    
    // Initialize userAnswers array
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQuizIndex(0);
    setShowResults(false);
    setShowQuiz(true);
    setIsRunning(false);
    
    // Don't reset moduleCompleted if quiz was already attempted
    if (!quizAttempted) {
      setModuleCompleted(false);
    }
  };
  
  const handleAnswerQuiz = (answer) => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      console.error('Quiz data not available');
      return;
    }
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuizIndex] = answer;
    setUserAnswers(newAnswers);
    
    if (currentQuizIndex < quiz.questions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      // Quiz selesai
      calculateQuizResults(newAnswers);
    }
  };
  
  const calculateQuizResults = async (answers) => {
    const correctCount = answers.filter((answer, idx) => 
      answer === quiz.questions[idx].correct_answer
    ).length;
    
    setShowResults(true);
    setQuizAttempted(true);
    setModuleCompleted(true); // Mark module as completed when quiz is finished
    
    // Save quiz result
    try {
      await api.saveQuizResult({
        module_id: module.module_id,
        score: correctCount,
        total_questions: quiz.questions.length,
        answers: answers,
        time_taken: Math.floor(totalMinutes * 60)
      });
    } catch (err) {
      console.error('Failed to save quiz result:', err);
    }
  };
  
  const handleEndSession = async () => {
    if (!sessionId) {
      alert('Session ID tidak ditemukan');
      navigate('/dashboard');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Ending session:', sessionId);
      
      // End session
      console.log('Calling endSession API...');
      await api.endSession(sessionId, {
        durasi_menit: Math.floor(totalMinutes),
        pomodoro_count: pomodoroCount
      });
      console.log('endSession API call successful');
      
      // Save progress
      console.log('Calling saveProgress API...');
      await api.saveProgress({
        plan_id: location.state?.planId,
        durasi_belajar: Math.floor(totalMinutes),
        topik_dipelajari: module?.judul || 'Unknown Topic',
        fokus_score: focusScore,
        mood: mood,
        catatan: notes
      });
      console.log('saveProgress API call successful');
      
      // Navigate to dashboard
      console.log('Navigating to dashboard...');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('End session error:', err);
      alert('Gagal mengakhiri sesi: ' + (err.message || 'Terjadi kesalahan'));
      // Don't navigate if there's an error
      // setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading || !module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Brain className="w-8 h-8 text-purple-600 animate-pulse" />
          <p className="text-gray-600">Memuat sesi belajar...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowEndSession(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              End Session
            </button>
            
            {/* Pomodoro Count */}
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">
                {pomodoroCount} Pomodoro
              </span>
            </div>
            
            {/* Module Completion Status */}
            {moduleCompleted && (
              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full animate-pulse">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">
                  Modul Selesai! 🎉
                </span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Area */}
          <div className="lg:col-span-2">
            {!showQuiz ? (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-gray-900">{module?.judul}</h1>
                      {moduleCompleted && (
                        <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-900">Selesai</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Learning Module</p>
                  </div>
                </div>
                
                {/* Content */}
                {contentLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-600 text-center">
                      Sedang generate konten AI...<br/>
                      <span className="text-sm text-gray-500">Mungkin butuh 10-30 detik</span>
                    </p>
                  </div>
                ) : contentError ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-red-900">Gagal Memuat Konten</h3>
                    </div>
                    <p className="text-red-700 mb-4">{contentError}</p>
                    <button
                      onClick={() => generateContentAsync(module, location.state?.planId)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <div 
                    className="prose prose-purple max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleStartQuiz}
                    disabled={!quiz || !quiz.questions || quiz.questions.length === 0}
                    className={`flex-1 font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      !quiz || !quiz.questions || quiz.questions.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : moduleCompleted
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {moduleCompleted 
                      ? 'Ulangi Quiz' 
                      : (!quiz || !quiz.questions || quiz.questions.length === 0 ? 'Quiz Tidak Tersedia' : 'Mulai Mini Quiz')
                    }
                  </button>
                  
                  <button
                    onClick={() => navigate('/tutor', { state: { sessionId, moduleId: module?.module_id, planId: location.state?.planId } })}
                    className="flex-1 bg-white border-2 border-purple-600 text-purple-600 font-semibold py-3 rounded-xl hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Tanya AI Tutor
                  </button>
                </div>
              </div>
            ) : showResults ? (
              <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
                {/* Celebration Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-purple-50 opacity-50"></div>
                <div className="absolute top-4 right-4 text-6xl animate-bounce">🎉</div>
                <div className="absolute bottom-4 left-4 text-4xl animate-pulse">✨</div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-pulse">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Modul Selesai! 🎉</h2>
                    <p className="text-lg text-gray-600 mb-2">
                      Score: <span className="font-bold text-green-600">
                        {userAnswers.filter((a, i) => a && quiz && quiz.questions && a === quiz.questions[i]?.correct_answer).length} / {(quiz && quiz.questions) ? quiz.questions.length : 0}
                      </span>
                    </p>
                    <p className="text-green-700 font-semibold">Selamat! Kamu telah menyelesaikan modul ini dengan baik! 🌟</p>
                  </div>
                
                <div className="space-y-4 mb-8">
                  {quiz && quiz.questions && quiz.questions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4">
                      <p className="font-semibold text-gray-900 mb-2">{q.question}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Your answer:</span>
                        <span className={`font-medium ${
                          userAnswers[idx] === q.correct_answer ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {userAnswers[idx] || 'Not answered'}
                          {userAnswers[idx] === q.correct_answer ? ' ✓' : ' ✗'}
                        </span>
                      </div>
                      {userAnswers[idx] !== q.correct_answer && q.correct_answer && (
                        <p className="text-sm text-gray-600 mt-2">
                          Correct: <span className="text-green-600 font-medium">{q.correct_answer}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowEndSession(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 animate-pulse"
                >
                  <CheckCircle className="w-5 h-5" />
                  Modul Selesai - Simpan Progress & Lanjutkan
                </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                {quiz && quiz.questions && quiz.questions[currentQuizIndex] ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Pertanyaan {currentQuizIndex + 1} dari {quiz.questions.length}
                    </h2>
                    
                    <p className="text-lg text-gray-800 mb-6">
                      {quiz.questions[currentQuizIndex].question}
                    </p>
                    
                    <div className="space-y-3">
                      {quiz.questions[currentQuizIndex].options && quiz.questions[currentQuizIndex].options.map((option, idx) => (
                        <button
                          key={`${currentQuizIndex}-${idx}`}
                          onClick={() => handleAnswerQuiz(option)}
                          className="w-full text-left px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
                        >
                          <span className="font-medium text-gray-900">{option}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Memuat quiz...</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar - Pomodoro Timer */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24">
              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
                  {isBreak ? (
                    <>
                      <Coffee className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">Break Time</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">Focus Time</span>
                    </>
                  )}
                </div>
                
                <div className="text-6xl font-bold text-gray-900 mb-4">
                  {formatTime(timeLeft)}
                </div>
                
                {/* Timer Controls */}
                <div className="flex gap-3 justify-center mb-6">
                  <button
                    onClick={toggleTimer}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  
                  <button
                    onClick={resetTimer}
                    className="bg-gray-200 text-gray-700 p-4 rounded-xl hover:bg-gray-300 transition-all duration-200"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* Stats */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Time</span>
                  <span className="font-semibold text-gray-900">
                    {Math.floor(totalMinutes)} min
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-gray-900">
                    {pomodoroCount} 🍅
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* End Session Modal */}
      {showEndSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Akhiri Sesi Belajar?
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fokus Score (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={focusScore}
                  onChange={(e) => setFocusScore(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center font-bold text-2xl text-purple-600">{focusScore}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood kamu?
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'happy', emoji: '😊' },
                    { value: 'neutral', emoji: '😐' },
                    { value: 'frustrated', emoji: '😤' },
                    { value: 'tired', emoji: '😴' }
                  ].map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`flex-1 text-3xl p-3 rounded-xl border-2 transition-all ${
                        mood === m.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Apa yang kamu pelajari hari ini?"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndSession(false)}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEndSession}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Simpan & Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

