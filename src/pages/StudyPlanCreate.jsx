import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Brain, ArrowLeft, Sparkles, Loader } from 'lucide-react';

export default function StudyPlanCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mata_kuliah: '',
    topik: '',
    tingkat_kesulitan: 'sedang'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetails(null);
    setLoading(true);
    
    try {
      const result = await api.createStudyPlan(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      if (err.details) {
        setErrorDetails(err.details);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buat Study Plan Baru ✨
          </h1>
          <p className="text-gray-600">
            AI akan membuat rencana belajar yang disesuaikan dengan gaya belajar kamu
          </p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <p className="font-semibold mb-2">❌ {error}</p>
                {errorDetails && errorDetails.message && (
                  <p className="mb-2">{errorDetails.message}</p>
                )}
                {errorDetails && errorDetails.suggestions && (
                  <div>
                    <p className="font-medium mb-1">Solusi:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {errorDetails.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mata Kuliah / Subject 📚
              </label>
              <input
                type="text"
                required
                value={formData.mata_kuliah}
                onChange={(e) => setFormData({ ...formData, mata_kuliah: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Contoh: Matematika, Pemrograman, Sejarah"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topik Spesifik 🎯
              </label>
              <input
                type="text"
                required
                value={formData.topik}
                onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Contoh: Kalkulus Integral, React Hooks, Perang Dunia II"
              />
              <p className="mt-2 text-sm text-gray-500">
                Semakin spesifik, semakin baik AI bisa personalisasi rencana belajar kamu
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tingkat Kesulitan 📊
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'mudah', label: 'Mudah', emoji: '😊', desc: 'Dasar & Pengenalan' },
                  { value: 'sedang', label: 'Sedang', emoji: '🎯', desc: 'Pemahaman Mendalam' },
                  { value: 'sulit', label: 'Sulit', emoji: '🔥', desc: 'Advanced & Kompleks' }
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, tingkat_kesulitan: level.value })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.tingkat_kesulitan === level.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                    }`}
                  >
                    <div className="text-3xl mb-2">{level.emoji}</div>
                    <div className="font-semibold text-gray-900 mb-1">{level.label}</div>
                    <div className="text-xs text-gray-600">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-900">
                  <p className="font-semibold mb-1">AI akan generate:</p>
                  <ul className="list-disc list-inside space-y-1 text-purple-700">
                    <li>Study plan yang disesuaikan dengan learning persona kamu</li>
                    <li>Breakdown materi menjadi modul-modul kecil yang manageable</li>
                    <li>Konten belajar yang sesuai gaya belajar kamu</li>
                    <li>Mini quiz untuk evaluasi pemahaman</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  AI sedang generate study plan... (30-60 detik)
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Study Plan dengan AI
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

