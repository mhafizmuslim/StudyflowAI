import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import { ArrowLeft, User, Brain, Clock, Target, LogOut, Lock, Eye, EyeOff, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, persona, logout } = useAuthStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Verification states
  const [verificationStatus, setVerificationStatus] = useState({
    email_verified: false,
    phone_verified: false,
    phone: null
  });
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  useEffect(() => {
    loadVerificationStatus();
  }, []);
  
  const loadVerificationStatus = async () => {
    try {
      const status = await api.getVerificationStatus();
      setVerificationStatus(status);
      setPhoneNumber(status.phone || '');
    } catch (error) {
      console.error('Error loading verification status:', error);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Password baru dan konfirmasi password tidak cocok');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage('Password baru harus minimal 6 karakter');
      return;
    }
    
    setLoading(true);
    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage('Password berhasil diubah!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage(error.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Email verification handlers
  const handleSendEmailVerification = async () => {
    setVerificationLoading(true);
    try {
      await api.sendEmailVerification();
      setMessage('Email verifikasi telah dikirim! Periksa console log server untuk token testing.');
      setShowEmailVerification(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setVerificationLoading(false);
    }
  };
  
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!emailVerificationToken.trim()) {
      setMessage('Token verifikasi diperlukan');
      return;
    }
    
    setVerificationLoading(true);
    try {
      await api.verifyEmail(emailVerificationToken);
      setMessage('Email berhasil diverifikasi!');
      setShowEmailVerification(false);
      setEmailVerificationToken('');
      loadVerificationStatus(); // Reload status
    } catch (error) {
      setMessage(error.message);
    } finally {
      setVerificationLoading(false);
    }
  };
  
  // Phone verification handlers
  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setMessage('Nomor telepon diperlukan');
      return;
    }
    
    setVerificationLoading(true);
    try {
      await api.updatePhone(phoneNumber);
      setMessage('Nomor telepon berhasil diupdate!');
      loadVerificationStatus(); // Reload status
    } catch (error) {
      setMessage(error.message);
    } finally {
      setVerificationLoading(false);
    }
  };
  
  const handleSendPhoneVerification = async () => {
    setVerificationLoading(true);
    try {
      await api.sendPhoneVerification();
      setMessage('Kode verifikasi SMS telah dikirim! Periksa console log server untuk kode testing.');
      setShowPhoneVerification(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setVerificationLoading(false);
    }
  };
  
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (!phoneVerificationCode.trim()) {
      setMessage('Kode verifikasi diperlukan');
      return;
    }
    
    setVerificationLoading(true);
    try {
      await api.verifyPhone(phoneVerificationCode);
      setMessage('Nomor telepon berhasil diverifikasi!');
      setShowPhoneVerification(false);
      setPhoneVerificationCode('');
      loadVerificationStatus(); // Reload status
    } catch (error) {
      setMessage(error.message);
    } finally {
      setVerificationLoading(false);
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">Profile</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Profile & Settings
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Kelola akun dan preferensi belajar kamu
          </p>
        </div>
        
        {/* User Info */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{user?.nama}</h2>
              <p className="text-gray-600 text-sm sm:text-base">{user?.email}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Member sejak {new Date(user?.tanggal_daftar).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Learning Persona */}
        {persona && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Learning Persona</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getPersonaIcon(persona.gaya_belajar)}</span>
                  <div>
                    <p className="text-sm text-gray-600">Gaya Belajar</p>
                    <p className="font-bold text-gray-900 capitalize">{persona.gaya_belajar}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Fokus Level</p>
                    <p className="font-bold text-gray-900 capitalize">{persona.fokus_level}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Waktu Optimal</p>
                    <p className="font-bold text-gray-900 capitalize">{persona.preferensi_waktu}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">⏱️</span>
                  <div>
                    <p className="text-sm text-gray-600">Durasi Ideal</p>
                    <p className="font-bold text-gray-900">{persona.preferensi_durasi} menit</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Preferensi Lainnya:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tingkat Detail:</span>
                  <span className="ml-2 font-medium text-gray-900 capitalize">
                    {persona.tingkat_detail}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Motivasi:</span>
                  <span className="ml-2 font-medium text-gray-900 capitalize">
                    {persona.motivasi_type?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Learning Pace:</span>
                  <span className="ml-2 font-medium text-gray-900 capitalize">
                    {persona.learning_pace}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/onboarding')}
              className="mt-6 w-full bg-purple-100 text-purple-700 font-semibold py-3 rounded-xl hover:bg-purple-200 transition-colors"
            >
              Update Learning Persona
            </button>
          </div>
        )}
        
        {/* Change Password */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Keamanan Akun</h3>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-purple-600 hover:text-purple-800 font-semibold"
            >
              {showPasswordForm ? 'Batal' : 'Ubah Password'}
            </button>
          </div>
          
          {message && (
            <div className={`mb-4 p-4 rounded-xl ${
              message.includes('berhasil') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          {/* Email Verification */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-900">Verifikasi Email</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              {verificationStatus.email_verified ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Terverifikasi</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Belum Terverifikasi</span>
                </div>
              )}
            </div>
            
            {!verificationStatus.email_verified && (
              <div className="space-y-3">
                {!showEmailVerification ? (
                  <button
                    onClick={handleSendEmailVerification}
                    disabled={verificationLoading}
                    className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {verificationLoading ? 'Mengirim...' : 'Kirim Email Verifikasi'}
                  </button>
                ) : (
                  <form onSubmit={handleVerifyEmail} className="space-y-3">
                    <input
                      type="text"
                      value={emailVerificationToken}
                      onChange={(e) => setEmailVerificationToken(e.target.value)}
                      placeholder="Masukkan token verifikasi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={verificationLoading}
                        className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {verificationLoading ? 'Memverifikasi...' : 'Verifikasi Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmailVerification(false);
                          setEmailVerificationToken('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
          
          {/* Phone Verification */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-900">Verifikasi Nomor Telepon</p>
                  <p className="text-sm text-gray-600">
                    {verificationStatus.phone || 'Belum diatur'}
                  </p>
                </div>
              </div>
              {verificationStatus.phone_verified ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Terverifikasi</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Belum Terverifikasi</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {!verificationStatus.phone ? (
                <form onSubmit={handleUpdatePhone} className="space-y-3">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Masukkan nomor telepon (contoh: 081234567890)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    disabled={verificationLoading}
                    className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {verificationLoading ? 'Menyimpan...' : 'Simpan Nomor Telepon'}
                  </button>
                </form>
              ) : !verificationStatus.phone_verified && (
                <div className="space-y-3">
                  {!showPhoneVerification ? (
                    <button
                      onClick={handleSendPhoneVerification}
                      disabled={verificationLoading}
                      className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {verificationLoading ? 'Mengirim...' : 'Kirim Kode Verifikasi SMS'}
                    </button>
                  ) : (
                    <form onSubmit={handleVerifyPhone} className="space-y-3">
                      <input
                        type="text"
                        value={phoneVerificationCode}
                        onChange={(e) => setPhoneVerificationCode(e.target.value)}
                        placeholder="Masukkan kode verifikasi 6 digit"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength="6"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={verificationLoading}
                          className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {verificationLoading ? 'Memverifikasi...' : 'Verifikasi Nomor Telepon'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPhoneVerification(false);
                            setPhoneVerificationCode('');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Masukkan password saat ini"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Masukkan password baru (minimal 6 karakter)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Konfirmasi password baru"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setMessage('');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Actions */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-600">Logout</span>
              </div>
              <span className="text-red-400 group-hover:text-red-600 transition-colors">→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

