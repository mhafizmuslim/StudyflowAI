# 🚀 Quick Start Guide - StudyFlow AI

Panduan cepat untuk menjalankan **StudyFlow AI** di local machine.

---

## ⚡ Setup dalam 5 Menit

### 1. Prerequisites Check

Pastikan sudah terinstall:

```bash
node --version  # Should be v18 or higher
npm --version   # Should be v8 or higher
```

Jika belum, download di [nodejs.org](https://nodejs.org)

### 2. Clone & Install

```bash
# Clone repository
cd path/to/your/project

# Install dependencies
npm install
```

### 3. Get Gemini API Key

1. Buka [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan Google account
3. Klik **"Get API Key"**
4. Copy API key

### 4. Setup PostgreSQL Database

Install PostgreSQL:

- **Windows**: Download dari [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql@15`
- **Linux**: `sudo apt install postgresql postgresql-contrib`

Start PostgreSQL service dan buat database:

```bash
# Start PostgreSQL (Mac/Linux)
sudo service postgresql start

# Login ke PostgreSQL
psql -U postgres

# Buat database (di psql console)
CREATE DATABASE studyflow;
\q
```

### 5. Setup Environment Variables

Buat file `.env` di root directory:

```env
# Gemini AI API Key
VITE_GEMINI_API_KEY=AIzaSyBGG7vE8C38dIt1SXvKQ9YokMHqUB6KULg

# JWT Secret
JWT_SECRET=my-super-secret-key-12345

# Server Port
PORT=3001
VITE_API_URL=http://localhost:3001/api

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studyflow
DB_USER=postgres
DB_PASSWORD=postgres  # Ganti dengan password PostgreSQL kamu
```

### 6. Run Application

**Option A: Run Separately (Recommended for development)**

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

**Option B: Run Together**

```bash
npm run dev:full
```

### 7. Open Browser

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/health

---

## 🎯 First Time Usage

### Step 1: Register Account

1. Klik **"Daftar Sekarang"**
2. Isi:
   - Nama lengkap
   - Email
   - Password (min 6 karakter)
3. Klik **"Daftar Sekarang"**

### Step 2: Complete Onboarding

Jawab 8 pertanyaan tentang gaya belajar kamu:

1. Preferensi belajar (visual/verbal/kinesthetic)
2. Attention span
3. Waktu produktif
4. Tingkat detail yang disukai
5. Motivasi belajar
6. Learning pace
7. Tantangan belajar
8. Deskripsi gaya belajar ideal

**⏱️ AI akan generate learning persona (30-60 detik)**

### Step 3: Explore Dashboard

Setelah onboarding selesai, kamu akan lihat:

- **Learning Persona** - Profil belajar kamu
- **Stats** - Study plans, total minutes, focus score
- **Quick Actions** - AI Tutor, Analytics, Profile

### Step 4: Create First Study Plan

1. Klik **"Buat Baru"** atau **"Buat Study Plan Pertama"**
2. Isi:
   - Mata Kuliah (contoh: "Pemrograman")
   - Topik (contoh: "React Hooks")
   - Tingkat Kesulitan (Mudah/Sedang/Sulit)
3. Klik **"Generate Study Plan dengan AI"**

**⏱️ AI akan generate plan + modules (30-60 detik)**

### Step 5: Start Learning

1. Pilih study plan dari dashboard
2. Klik module yang ingin dipelajari
3. Klik **"Mulai Belajar"**
4. Gunakan **Pomodoro Timer** untuk fokus
5. Selesaikan **Mini Quiz**
6. Simpan progress

### Step 6: Chat dengan AI Tutor

1. Klik **"AI Tutor"** di navigation
2. Tanya apa saja tentang materi belajar
3. AI akan jawab sesuai gaya belajar kamu

### Step 7: View Analytics

1. Klik **"Analytics"** di navigation
2. Lihat:
   - Total minutes belajar
   - Average focus score
   - Streak days
   - AI Insights & recommendations

---

## 🔧 Troubleshooting

### Error: "GEMINI_API_KEY belum di-set"

**Solusi:**

- Pastikan file `.env` ada di root directory
- Pastikan `VITE_GEMINI_API_KEY=...` tertulis dengan benar
- Restart server setelah edit `.env`

### Error: "Port 3001 already in use"

**Solusi:**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

Atau ubah PORT di `.env`:

```env
PORT=3002
```

### Database Connection Error

**Solusi:**

```bash
# Check PostgreSQL service
sudo service postgresql status

# Start PostgreSQL jika belum jalan
sudo service postgresql start

# Verify database exists
psql -U postgres -c "\l" | grep studyflow

# Create database jika belum ada
psql -U postgres -c "CREATE DATABASE studyflow;"
```

Pastikan credentials di `.env` sesuai dengan PostgreSQL kamu.

### AI Response Terlalu Lama

**Kemungkinan:**

- Internet lambat
- Gemini API rate limit
- Server overload

**Solusi:**

- Tunggu beberapa detik
- Coba lagi
- Check API quota di Google AI Studio

### Build Error

**Solusi:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### CORS Error

**Solusi:**

- Pastikan backend berjalan di port 3001
- Pastikan `VITE_API_URL` di `.env` benar
- Clear browser cache

---

## 📱 Development Tips

### Hot Reload

Frontend akan auto-reload saat ada perubahan file.
Backend perlu restart manual.

### Debug Mode

```bash
# Frontend dengan console logs
npm run dev

# Backend dengan nodemon (auto-restart)
npm install -g nodemon
nodemon server/index.js
```

### Database Inspection

```bash
# Install SQLite browser
# Mac: brew install --cask db-browser-for-sqlite
# Windows: Download from sqlitebrowser.org

# Open database
# server/database/studyflow.db
```

### API Testing

Gunakan tools:

- **Postman** - GUI testing
- **Thunder Client** (VS Code extension)
- **cURL** - Command line

Example:

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🎨 Customize

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Change Pomodoro Duration

Edit default di `src/pages/LearningSession.jsx`:

```javascript
const POMODORO_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes
```

### Modify AI Prompts

Edit `server/services/geminiAgent.js`:

```javascript
const SYSTEM_PROMPTS = {
  learningStyleAnalyzer: `Your custom prompt...`,
  // ...
};
```

---

## 📚 Next Steps

1. ✅ Setup complete
2. ✅ Create account
3. ✅ Complete onboarding
4. ✅ Create study plan
5. ✅ Start learning

**Ready to build more?**

Check out:

- `README.md` - Full documentation
- `server/` - Backend code
- `src/` - Frontend code
- API endpoints list in README

---

## 🤝 Need Help?

- Check `README.md` for detailed docs
- Open issue on GitHub
- Contact: your-email@example.com

---

**Happy Learning! 🎉**
