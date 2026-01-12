import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  ArrowLeft, TrendingUp, Clock, Target, Flame, 
  Calendar, Brain, Sparkles, Award, BarChart3
} from 'lucide-react';

export default function Analytics() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  
  console.log('Analytics component mounted');
  
  useEffect(() => {
    console.log('Analytics useEffect triggered');
    loadAnalytics();
  }, []);
  
  const loadAnalytics = async () => {
    try {
      console.log('Loading analytics data...');
      
      const [progressData, insightsData, quizData] = await Promise.all([
        api.getProgress().catch(err => {
          console.error('Failed to load progress:', err);
          return { progress: [], stats: null };
        }),
        api.getInsights().catch(err => {
          console.error('Failed to load insights:', err);
          return { insights: [] };
        }),
        api.getQuizResults().catch(err => {
          console.error('Failed to load quiz results:', err);
          return { results: [] };
        })
      ]);
      
      console.log('Analytics data loaded:', { progressData, insightsData, quizData });
      
      setProgress(progressData.progress || []);
      setStats(progressData.stats || null);
      setInsights(insightsData.insights || []);
      setQuizResults(quizData.results || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      // Set empty data as fallback
      setProgress([]);
      setStats(null);
      setInsights([]);
      setQuizResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateInsights = async () => {
    setGeneratingInsights(true);
    try {
      const result = await api.generateInsights();
      setInsights(result.insights || []);
      alert('Insights berhasil di-generate! ✨');
    } catch (err) {
      alert(err.message);
    } finally {
      setGeneratingInsights(false);
    }
  };
  
  const getStreakDays = () => {
    if (!Array.isArray(progress) || progress.length === 0) return 0;
    
    try {
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      // Sort progress by date ascending (oldest first) for streak calculation
      const sortedProgress = [...progress].sort((a, b) => 
        new Date(a.tanggal) - new Date(b.tanggal)
      );
      
      for (let i = sortedProgress.length - 1; i >= 0; i--) {
        const progressDate = new Date(sortedProgress[i].tanggal);
        progressDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today - progressDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };
  
  const getAverageQuizScore = () => {
    if (!Array.isArray(quizResults) || quizResults.length === 0) return 0;
    
    try {
      const totalPercentage = quizResults.reduce((sum, result) => {
        if (result && typeof result.score === 'number' && typeof result.total_questions === 'number' && result.total_questions > 0) {
          return sum + (result.score / result.total_questions * 100);
        }
        return sum;
      }, 0);
      
      return Math.round(totalPercentage / quizResults.length);
    } catch (error) {
      console.error('Error calculating average quiz score:', error);
      return 0;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-8 h-8 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics & Progress 📊
          </h1>
          <p className="text-gray-600">
            Lihat perkembangan belajar kamu dan insight dari AI
          </p>
        </div>
        
        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <p className="text-sm text-yellow-700">
            Progress: {Array.isArray(progress) ? progress.length : 'N/A'} items<br/>
            Stats: {stats ? 'Available' : 'Null'}<br/>
            Insights: {Array.isArray(insights) ? insights.length : 'N/A'} items<br/>
            Quiz Results: {Array.isArray(quizResults) ? quizResults.length : 'N/A'} items
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Total Minutes</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats?.total_minutes || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Avg Focus</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {stats?.avg_focus ? Math.round(stats.avg_focus * 10) / 10 : '0'}/10
              </p>
              <p className="text-sm text-gray-600 mt-1">Focus score</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Streak</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{getStreakDays()}</p>
            <p className="text-sm text-gray-600 mt-1">Days in a row</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Quiz Score</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{getAverageQuizScore()}%</p>
            <p className="text-sm text-gray-600 mt-1">Average</p>
          </div>
        </div>
        
        {/* AI Insights */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
            </div>
            
            <button
              onClick={handleGenerateInsights}
              disabled={generatingInsights || progress.length < 3}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingInsights ? 'Generating...' : 'Generate New Insights'}
            </button>
          </div>
          
          {insights.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Belum ada insights</p>
              <p className="text-sm text-gray-500">
                Minimal 3 sesi belajar untuk generate insights
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.insight_id}
                  className={`rounded-xl p-6 border-2 ${
                    insight.insight_type === 'strength' 
                      ? 'bg-green-50 border-green-200' 
                      : insight.insight_type === 'improvement_suggestion'
                      ? 'bg-yellow-50 border-yellow-200'
                      : insight.insight_type === 'learning_pattern'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">
                      {insight.insight_type === 'strength' ? '💪' :
                       insight.insight_type === 'improvement_suggestion' ? '💡' :
                       insight.insight_type === 'learning_pattern' ? '📊' : '⚠️'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {insight.title}
                      </h3>
                      <p className="text-gray-700 mb-3">{insight.description}</p>
                      {insight.data?.action && (
                        <div className="bg-white/50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-semibold text-purple-600">
                            💡 Action: {insight.data.action}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Progress */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Recent Progress</h2>
          </div>
          
          {progress.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada progress</p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.slice(0, 10).map((item) => (
                <div
                  key={item.progress_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {item.topik_dipelajari}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.durasi_belajar} menit
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Focus: {item.fokus_score}/10
                      </span>
                      <span>
                        {item.mood === 'happy' ? '😊' : 
                         item.mood === 'neutral' ? '😐' :
                         item.mood === 'frustrated' ? '😤' : '😴'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Quiz Results */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quiz Results</h2>
          </div>
          
          {quizResults.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada quiz yang dikerjakan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizResults.slice(0, 6).map((result) => (
                <div
                  key={result.quiz_id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {new Date(result.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                    <span className={`text-2xl font-bold ${
                      (result.score / result.total_questions * 100) >= 70 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {Math.round(result.score / result.total_questions * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {result.score} / {result.total_questions} correct
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Time: {Math.floor(result.time_taken / 60)}:{(result.time_taken % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

