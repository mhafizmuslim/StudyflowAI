import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  ArrowLeft, BookOpen, Clock, Target, Calendar,
  Play, CheckCircle, Sparkles, Loader, Trash2
} from 'lucide-react';

export default function StudyPlanDetail() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moduleProgress, setModuleProgress] = useState({});
  const [planProgress, setPlanProgress] = useState(null);
  
  useEffect(() => {
    loadPlanDetail();
  }, [planId]);
  
  const loadPlanDetail = async () => {
    try {
      const data = await api.getStudyPlan(planId);
      console.log('Loaded plan data:', data);
      console.log('Modules:', data.modules);
      console.log('Progress:', data.progress);
      
      setPlan(data.plan);
      setModules(data.modules);
      setPlanProgress(data.progress);
      
      // Load quiz results to get detailed progress per module
      const quizResponse = await api.getQuizResults();
      console.log('Quiz response:', quizResponse);
      const allQuizResults = Array.isArray(quizResponse) ? quizResponse : (quizResponse.results || []);
      console.log('All quiz results:', allQuizResults);
      
      // Filter quiz results to only include those for modules in this plan
      const planModuleIds = data.modules.map(module => module.module_id);
      const quizResults = allQuizResults.filter(result => 
        result && result.module_id && planModuleIds.includes(result.module_id)
      );
      console.log('Filtered quiz results for this plan:', quizResults);
      
      // Create detailed progress map for each module
      const progressMap = {};
      data.modules.forEach(module => {
        const moduleQuizResult = quizResults.find(r => r.module_id === module.module_id);
        progressMap[module.module_id] = {
          isCompleted: !!moduleQuizResult,
          quizScore: moduleQuizResult ? moduleQuizResult.score : null,
          timeTaken: moduleQuizResult ? moduleQuizResult.time_taken : null,
          completedAt: moduleQuizResult ? moduleQuizResult.created_at : null
        };
      });
      console.log('Detailed progress map:', progressMap);
      setModuleProgress(progressMap);
    } catch (err) {
      console.error('Error loading plan detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartLearning = async (moduleId) => {
    try {
      // Find the current module index
      const currentModuleIndex = modules.findIndex(m => m.module_id === moduleId);
      
      // Check if this is not the first module and if the previous module is not completed
      if (currentModuleIndex > 0) {
        const previousModule = modules[currentModuleIndex - 1];
        const previousProgress = moduleProgress[previousModule.module_id];
        
        if (!previousProgress?.isCompleted) {
          alert(`Anda harus menyelesaikan modul "${previousModule.judul}" terlebih dahulu sebelum dapat mengakses modul ini.`);
          return;
        }
      }
      
      const result = await api.startSession(plan.plan_id);
      
      navigate(`/session/${result.session_id}`, {
        state: { moduleId, planId: plan.plan_id }
      });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
  
  const handleDeleteStudyPlan = async (planId, planTitle) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus study plan "${planTitle}"?\n\nSemua modul, quiz results, dan progress terkait akan dihapus secara permanen.`
    );
    
    if (!confirmDelete) return;
    
    try {
      await api.deleteStudyPlan(planId);
      alert('Study plan berhasil dihapus!');
      navigate('/dashboard');
    } catch (err) {
      alert('Error menghapus study plan: ' + err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }
  
  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Plan tidak ditemukan'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-purple-600 hover:underline"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Kembali ke Dashboard</span>
            </button>
            
            <button
              onClick={() => handleDeleteStudyPlan(plan.plan_id, plan.mata_kuliah)}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-colors font-semibold text-sm"
              title="Hapus Study Plan"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hapus Study Plan</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Plan Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-2 md:p-3 rounded-xl">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">{plan.mata_kuliah}</h1>
                  <p className="text-gray-600 text-sm md:text-base">{plan.topik}</p>
                </div>
              </div>
            </div>
            <span className={`text-xs md:text-sm font-semibold px-2 md:px-3 py-1 rounded-full ${
              plan.tingkat_kesulitan === 'mudah' ? 'bg-green-100 text-green-700' :
              plan.tingkat_kesulitan === 'sedang' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {plan.tingkat_kesulitan}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Total Durasi</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{plan.durasi} menit</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Modul</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{modules.length} modul</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {planProgress ? `${planProgress.completedModules}/${planProgress.totalModules}` : '0/0'}
              </p>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${planProgress ? planProgress.progressPercentage : 0}%` 
                  }}
                ></div>
              </div>
              {planProgress && planProgress.isCompleted && (
                <p className="text-xs text-green-700 font-medium mt-1">🎉 Study Plan Selesai!</p>
              )}
            </div>
            
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Target</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(plan.target_tanggal).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Learning Modules */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Learning Modules</h2>
          </div>
          
          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada modul ditemukan
              </div>
            ) : (
              modules.map((module, index) => {
                const progress = moduleProgress[module.module_id] || { isCompleted: false, quizScore: null };
                
                // Check if previous module is completed (for modules after the first)
                const isPreviousCompleted = index === 0 || (moduleProgress[modules[index - 1].module_id]?.isCompleted);
                const isLocked = !isPreviousCompleted && !progress.isCompleted;
                
                return (
                  <div
                    key={module.module_id}
                    className={`border-2 rounded-2xl p-6 hover:border-purple-500 transition-all duration-200 group ${
                      progress.isCompleted 
                        ? 'border-green-300 bg-green-50' 
                        : isLocked
                        ? 'border-gray-300 bg-gray-50 opacity-60'
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl group-hover:bg-purple-200 transition-colors ${
                        progress.isCompleted ? 'bg-green-200' : isLocked ? 'bg-gray-200' : 'bg-purple-100'
                      }`}>
                        {progress.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : isLocked ? (
                          <span className="text-lg font-bold text-gray-400">
                            🔒
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-purple-600">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className={`text-lg font-bold mb-1 ${
                              progress.isCompleted ? 'text-green-900' : 'text-gray-900'
                            }`}>
                              {module.judul}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {module.durasi_estimasi} menit
                              </span>
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                {module.module_type}
                              </span>
                              {progress.isCompleted && progress.quizScore !== null && (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                  Score: {progress.quizScore}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {progress.isCompleted && (
                              <div className="text-green-600">
                                <CheckCircle className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={() => handleStartLearning(module.module_id)}
                            disabled={isLocked}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200 ${
                              progress.isCompleted 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : isLocked
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                            }`}
                          >
                            {progress.isCompleted ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Review Module
                              </>
                            ) : isLocked ? (
                              <>
                                <span className="text-lg">🔒</span>
                                Terkunci
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Mulai Belajar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

