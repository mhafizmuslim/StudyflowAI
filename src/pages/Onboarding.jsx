import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import { Brain, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';

const ONBOARDING_QUESTIONS = [
  {
    id: 'q1_learning_preference',
    question: 'Saat belajar hal baru, kamu lebih suka...',
    type: 'single',
    options: [
      { value: 'visual', label: '📊 Lihat diagram, video, atau gambar', score: { visual: 3 } },
      { value: 'verbal', label: '📖 Baca penjelasan atau diskusi', score: { verbal: 3 } },
      { value: 'kinesthetic', label: '✋ Langsung praktek dan coba-coba', score: { kinesthetic: 3 } },
      { value: 'mixed', label: '🔄 Kombinasi semuanya', score: { visual: 1, verbal: 1, kinesthetic: 1 } }
    ]
  },
  {
    id: 'q2_attention_span',
    question: 'Berapa lama kamu bisa fokus belajar tanpa distraksi?',
    type: 'single',
    options: [
      { value: '15', label: '⚡ 10-15 menit (cepat bosan)', score: { fokus: 'rendah', durasi: 15 } },
      { value: '25', label: '🎯 20-30 menit (standar)', score: { fokus: 'sedang', durasi: 25 } },
      { value: '45', label: '🔥 40-60 menit (deep focus)', score: { fokus: 'tinggi', durasi: 45 } }
    ]
  },
  {
    id: 'q3_study_time',
    question: 'Kapan kamu paling produktif belajar?',
    type: 'single',
    options: [
      { value: 'pagi', label: '🌅 Pagi (06:00-11:00)', score: { waktu: 'pagi' } },
      { value: 'sore', label: '☀️ Sore (14:00-18:00)', score: { waktu: 'sore' } },
      { value: 'malam', label: '🌙 Malam (19:00-23:00)', score: { waktu: 'malam' } },
      { value: 'flexible', label: '🔄 Tergantung mood', score: { waktu: 'flexible' } }
    ]
  },
  {
    id: 'q4_content_depth',
    question: 'Saat belajar, kamu lebih suka materi yang...',
    type: 'single',
    options: [
      { value: 'ringkas', label: '⚡ Ringkas & to the point', score: { detail: 'ringkas' } },
      { value: 'sedang', label: '📝 Cukup detail tapi tidak bertele-tele', score: { detail: 'sedang' } },
      { value: 'detail', label: '📚 Sangat detail dan mendalam', score: { detail: 'detail' } }
    ]
  },
  {
    id: 'q5_motivation',
    question: 'Apa yang paling memotivasi kamu belajar?',
    type: 'single',
    options: [
      { value: 'achievement', label: '🏆 Dapat nilai bagus / achievement', score: { motivasi: 'achievement' } },
      { value: 'social', label: '👥 Agar tidak ketinggalan teman', score: { motivasi: 'social' } },
      { value: 'personal', label: '🌱 Pengembangan diri dan rasa ingin tahu', score: { motivasi: 'personal_growth' } }
    ]
  },
  {
    id: 'q6_learning_pace',
    question: 'Dalam mempelajari topik baru, kamu...',
    type: 'single',
    options: [
      { value: 'cepat', label: '🚀 Cepat paham, langsung next', score: { pace: 'cepat' } },
      { value: 'normal', label: '🎯 Butuh beberapa kali review', score: { pace: 'normal' } },
      { value: 'santai', label: '🐢 Perlu waktu ekstra dan pengulangan', score: { pace: 'santai' } }
    ]
  },
  {
    id: 'q7_study_challenges',
    question: 'Tantangan terbesar kamu saat belajar?',
    type: 'multiple',
    options: [
      { value: 'fokus', label: '😵 Susah fokus / mudah teralihkan' },
      { value: 'motivasi', label: '😴 Kurang motivasi / sering prokrastinasi' },
      { value: 'pemahaman', label: '🤔 Sulit memahami konsep' },
      { value: 'waktu', label: '⏰ Manajemen waktu' },
      { value: 'konsistensi', label: '📅 Tidak konsisten' }
    ]
  },
  {
    id: 'q8_ideal_learning',
    question: 'Gaya belajar ideal kamu seperti apa?',
    type: 'text',
    placeholder: 'Contoh: "Aku lebih suka belajar dengan video pendek, terus langsung praktek, sambil dengerin musik..."'
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setPersona, persona } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const currentQuestion = ONBOARDING_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100;

  useEffect(() => {
    if (persona) {
      // User has already completed onboarding, redirect to dashboard
      navigate('/dashboard');
    }
  }, [persona, navigate]);

  const handleSingleChoice = (questionId, value, score) => {
    setResponses({
      ...responses,
      [questionId]: { value, score }
    });
  };
  
  const handleMultipleChoice = (questionId, value) => {
    const current = responses[questionId]?.value || [];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    setResponses({
      ...responses,
      [questionId]: { value: newValue }
    });
  };
  
  const handleTextInput = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: { value }
    });
  };
  
  const canProceed = () => {
    const response = responses[currentQuestion.id];
    if (!response) return false;
    
    if (currentQuestion.type === 'text') {
      return response.value && response.value.trim().length > 10;
    }
    
    if (currentQuestion.type === 'multiple') {
      return response.value && response.value.length > 0;
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleFinish = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Format responses untuk API
      const formattedResponses = Object.entries(responses).map(([question_id, data]) => ({
        question_id,
        answer: data.value
      }));
      
      // Save responses
      await api.saveOnboardingResponses(formattedResponses);
      
      // Generate persona dengan Gemini AI
      const result = await api.generatePersona();
      
      setPersona(result.persona);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              StudyFlow AI
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kenalan dulu yuk, {user?.nama}! 👋
          </h1>
          <p className="text-gray-600">
            Bantu kami memahami gaya belajar kamu untuk pengalaman yang lebih personal
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Pertanyaan {currentStep + 1} dari {ONBOARDING_QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}
          
          {/* Single Choice */}
          {currentQuestion.type === 'single' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = responses[currentQuestion.id]?.value === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSingleChoice(currentQuestion.id, option.value, option.score)}
                    className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      {isSelected && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Multiple Choice */}
          {currentQuestion.type === 'multiple' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = responses[currentQuestion.id]?.value?.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleMultipleChoice(currentQuestion.id, option.value)}
                    className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      {isSelected && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Text Input */}
          {currentQuestion.type === 'text' && (
            <textarea
              value={responses[currentQuestion.id]?.value || ''}
              onChange={(e) => handleTextInput(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.placeholder}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                Generating...
              </>
            ) : currentStep === ONBOARDING_QUESTIONS.length - 1 ? (
              <>
                Selesai
                <Sparkles className="w-5 h-5" />
              </>
            ) : (
              <>
                Lanjut
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

