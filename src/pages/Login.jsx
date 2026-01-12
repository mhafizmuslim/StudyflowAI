import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-3 sm:px-4 py-2 shadow-lg mb-3 sm:mb-4">
            <Brain className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600" />
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              StudyFlow AI
            </span>
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Belajar sesuai gaya kamu, powered by AI
          </p>
        </div>
        
        {/* Login Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="nama@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Login'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <Link to="/register" className="text-purple-600 font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
        
        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-4">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs text-gray-700 font-medium">Personal</div>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-4">
            <div className="text-2xl mb-1">🧠</div>
            <div className="text-xs text-gray-700 font-medium">AI-Powered</div>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-4">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs text-gray-700 font-medium">Adaptif</div>
          </div>
        </div>
      </div>
    </div>
  );
}

