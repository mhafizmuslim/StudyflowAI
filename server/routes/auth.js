import express from 'express';
import bcrypt from 'bcryptjs';
import { dbHelpers } from '../database/db.js';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    
    // Validasi
    if (!nama || !email || !password) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }
    
    // Cek apakah email sudah terdaftar
    const existingUser = await dbHelpers.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await dbHelpers.createUser(nama, email, hashedPassword);
    const userId = result.user_id;
    
    // Generate token
    const token = generateToken(userId);
    
    // Get user data
    const user = await dbHelpers.getUserById(userId);
    
    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validasi
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' });
    }
    
    // Get user
    const user = await dbHelpers.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    
    // Generate token
    const token = generateToken(user.user_id);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login berhasil',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'studyflow-ai-secret-key-change-in-production';
    const decoded = jwt.default.verify(token, JWT_SECRET);
    
    const user = await dbHelpers.getUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validasi
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password saat ini dan password baru harus diisi' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    }
    
    // Get user
    const user = await dbHelpers.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Password saat ini salah' });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password in database
    await dbHelpers.updateUserPassword(req.userId, hashedNewPassword);
    
    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengubah password' });
  }
});

// Send email verification
router.post('/send-email-verification', verifyToken, async (req, res) => {
  try {
    const user = await dbHelpers.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email sudah terverifikasi' });
    }

    // Generate verification token
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    // Save token to database
    await dbHelpers.setEmailVerificationToken(req.userId, token);

    // In a real application, you would send an email here
    // For now, we'll just return the token for testing
    console.log('Email verification token for user', user.email, ':', token);

    res.json({
      message: 'Email verifikasi telah dikirim',
      note: 'Untuk testing: gunakan token dari console log server'
    });
  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengirim email verifikasi' });
  }
});

// Verify email
router.post('/verify-email', verifyToken, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token verifikasi diperlukan' });
    }

    const result = await dbHelpers.verifyEmail(token);
    if (!result) {
      return res.status(400).json({ error: 'Token verifikasi tidak valid atau sudah expired' });
    }

    res.json({ message: 'Email berhasil diverifikasi' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat verifikasi email' });
  }
});

// Update phone number
router.put('/phone', verifyToken, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Nomor telepon diperlukan' });
    }

    // Basic phone validation (Indonesian format)
    const phoneRegex = /^(\+62|62|0)[8-9][0-9]{7,11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Format nomor telepon tidak valid' });
    }

    await dbHelpers.updateUserPhone(req.userId, phone);

    res.json({ message: 'Nomor telepon berhasil diupdate' });
  } catch (error) {
    console.error('Update phone error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat update nomor telepon' });
  }
});

// Send phone verification
router.post('/send-phone-verification', verifyToken, async (req, res) => {
  try {
    const user = await dbHelpers.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    if (!user.phone) {
      return res.status(400).json({ error: 'Nomor telepon belum diatur' });
    }

    if (user.phone_verified) {
      return res.status(400).json({ error: 'Nomor telepon sudah terverifikasi' });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save code to database
    await dbHelpers.setPhoneVerificationCode(req.userId, code);

    // In a real application, you would send an SMS here
    // For now, we'll just return the code for testing
    console.log('Phone verification code for user', user.phone, ':', code);

    res.json({
      message: 'Kode verifikasi SMS telah dikirim',
      note: 'Untuk testing: gunakan kode dari console log server'
    });
  } catch (error) {
    console.error('Send phone verification error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengirim kode verifikasi' });
  }
});

// Verify phone
router.post('/verify-phone', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Kode verifikasi diperlukan' });
    }

    const result = await dbHelpers.verifyPhone(req.userId, code);
    if (!result) {
      return res.status(400).json({ error: 'Kode verifikasi tidak valid atau sudah expired' });
    }

    res.json({ message: 'Nomor telepon berhasil diverifikasi' });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat verifikasi nomor telepon' });
  }
});

// Get verification status
router.get('/verification-status', verifyToken, async (req, res) => {
  try {
    const status = await dbHelpers.getUserVerificationStatus(req.userId);
    res.json(status);
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil status verifikasi' });
  }
});

export default router;

