import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({ 
    nama: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(formData.nama, formData.email, formData.password);
      navigate('/onboarding');
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
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              StudyFlow AI
            </span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mulai belajar lebih smart ✨
          </h1>
          <p className="text-gray-600">
            Daftar gratis dan temukan gaya belajar terbaik kamu
          </p>
        </div>
        
        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nama kamu"
              />
            </div>
            
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
                placeholder="Min. 6 karakter"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ulangi password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Daftar Sekarang'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

