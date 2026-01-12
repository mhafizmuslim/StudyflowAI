import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import { 
  Brain, Plus, BookOpen, Clock, TrendingUp, 
  Sparkles, MessageCircle, BarChart3, User, LogOut,
  Target, Calendar, Flame, Home, Menu, X
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, persona, logout, fetchPersona } = useAuthStore();
  const [studyPlans, setStudyPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fixingDates, setFixingDates] = useState(false);
  
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!persona) {
        // Coba fetch persona dulu
        try {
          await fetchPersona();
          // Jika berhasil, persona akan di-set, useEffect akan run lagi
        } catch (error) {
          // Jika gagal fetch, mungkin token expired atau persona belum ada
          // Biarkan useEffect run lagi dengan persona yang mungkin sudah di-set atau masih null
        }
      }
      
      if (!persona) {
        navigate('/onboarding');
        return;
      }
      
      loadDashboardData();
    };
    
    initializeDashboard();
  }, [persona]);
  
  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Load data individually to handle errors gracefully
      const promises = [
        api.getStudyPlans().catch(() => ({ plans: [] })),
        api.getProgress().catch(() => ({ progress: [], stats: null })),
        api.getInsights().catch(() => ({ insights: [] }))
      ];
      
      const [plansData, progressData, insightsData] = await Promise.all(promises);
      
      setStudyPlans(plansData.plans || []);
      setStats(progressData.stats || null);
      setInsights(insightsData.insights || []);
    } catch (error) {
      console.error('Load dashboard error:', error);
      setError('Gagal memuat data dashboard. Pastikan server backend berjalan.');
    } finally {
      setLoading(false);
    }
  };
  
  const getPersonaIcon = (gaya) => {
    const icons = {
      visual: '👁️',
      verbal: '📖',
      kinesthetic: '✋',
      mixed: '🔄'
    };
    return icons[gaya] || '🧠';
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleFixDates = async () => {
    try {
      setFixingDates(true);
      const result = await api.fixStudyPlanDates();
      alert(`✅ ${result.message}\n\nTotal plans: ${result.total_plans}\nUpdated: ${result.updated_count}`);
      // Reload dashboard to show updated dates
      await loadDashboardData();
    } catch (error) {
      console.error('Fix dates error:', error);
      alert('❌ Gagal update tanggal: ' + error.message);
    } finally {
      setFixingDates(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-6 rounded-2xl mb-4">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              loadDashboardData();
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                StudyFlow AI
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-purple-600 font-semibold bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/tutor')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI Tutor
              </button>
              <button 
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            {/* Desktop Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <nav className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-600 font-semibold bg-purple-50 hover:bg-purple-100 transition-colors text-left"
                >
                  <Home className="w-5 h-5" />
                  Dashboard
                </button>
                <button 
                  onClick={() => {
                    navigate('/tutor');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors text-left"
                >
                  <Sparkles className="w-5 h-5" />
                  AI Tutor
                </button>
                <button 
                  onClick={() => {
                    navigate('/analytics');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors text-left"
                >
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </button>
                <button 
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors text-left"
                >
                  <User className="w-5 h-5" />
                  Profile
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.nama}! 👋
          </h1>
          <p className="text-gray-600">
            Siap belajar hari ini? Mari kita maksimalkan potensi kamu!
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Study Plans</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{studyPlans.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Total Menit</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.total_minutes || 0}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Avg Focus</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.avg_focus != null ? Number(stats.avg_focus).toFixed(1) : '0'}/10
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Sessions</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.total_sessions || 0}
            </p>
          </div>
        </div>
        
        {/* Learning Persona Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-xl font-bold">Your Learning Persona</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-purple-200 text-sm mb-1">Gaya Belajar</p>
                  <p className="font-semibold text-lg">
                    {getPersonaIcon(persona?.gaya_belajar)} {persona?.gaya_belajar}
                  </p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">Fokus Level</p>
                  <p className="font-semibold text-lg">
                    {persona?.fokus_level}
                  </p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">Waktu Optimal</p>
                  <p className="font-semibold text-lg">
                    {persona?.preferensi_waktu}
                  </p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">Durasi Ideal</p>
                  <p className="font-semibold text-lg">
                    {persona?.preferensi_durasi} menit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-gray-900">AI Insights untuk kamu</h3>
            </div>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <div 
                  key={insight.insight_id}
                  className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{
                      insight.insight_type === 'strength' ? '💪' :
                      insight.insight_type === 'improvement_suggestion' ? '💡' :
                      insight.insight_type === 'learning_pattern' ? '📊' : '⚠️'
                    }</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-700">{insight.description}</p>
                      {insight.data?.action && (
                        <p className="text-sm text-purple-600 font-medium mt-2">
                          Action: {insight.data.action}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Study Plans */}
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Study Plans Kamu</h3>
            <div className="flex items-center gap-2">
              {studyPlans.length > 0 && (
                <button
                  onClick={handleFixDates}
                  disabled={fixingDates}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Update target tanggal semua study plan ke tanggal realtime"
                >
                  <Calendar className="w-4 h-4" />
                  {fixingDates ? 'Updating...' : 'Fix Tanggal'}
                </button>
              )}
              <button
                onClick={() => navigate('/study-plan/create')}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Buat Baru
              </button>
            </div>
          </div>
          
          {studyPlans.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Belum ada study plan</p>
              <button
                onClick={() => navigate('/study-plan/create')}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Buat Study Plan Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyPlans.map((plan) => (
                <div
                  key={plan.plan_id}
                  onClick={() => navigate(`/study-plan/${plan.plan_id}`)}
                  className="border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-500 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        plan.tingkat_kesulitan === 'mudah' ? 'bg-green-100 text-green-700' :
                        plan.tingkat_kesulitan === 'sedang' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {plan.tingkat_kesulitan}
                      </span>
                      {plan.progress?.isCompleted && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                          ✓ Selesai
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{plan.mata_kuliah}</h4>
                  <p className="text-sm text-gray-600 mb-3">{plan.topik}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{plan.progress?.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${plan.progress?.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{plan.progress?.completedModules || 0} dari {plan.progress?.totalModules || 0} modul</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {plan.durasi} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(plan.target_tanggal).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/tutor')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-purple-500 hover:shadow-md transition-all duration-200 text-left group"
          >
            <MessageCircle className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-gray-900 mb-1">Chat dengan AI Tutor</h4>
            <p className="text-sm text-gray-600">Tanya apa aja, AI siap bantu!</p>
          </button>
          
          <button
            onClick={() => navigate('/analytics')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group"
          >
            <BarChart3 className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-gray-900 mb-1">Lihat Progress</h4>
            <p className="text-sm text-gray-600">Pantau perkembangan belajar kamu</p>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-pink-500 hover:shadow-md transition-all duration-200 text-left group"
          >
            <User className="w-8 h-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-gray-900 mb-1">Profile & Settings</h4>
            <p className="text-sm text-gray-600">Atur preferensi belajar kamu</p>
          </button>
        </div>
      </main>
    </div>
  );
}

