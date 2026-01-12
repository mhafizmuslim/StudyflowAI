# 🧠 StudyFlow AI

> **AI pembuat modul belajar pribadi berdasarkan cara belajar kamu**
> 
> Powered by **Google Gemini AI Agent 2.0 Flash**

![StudyFlow AI](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-blueviolet)
![React](https://img.shields.io/badge/React-18.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📖 Tentang Proyek

**StudyFlow AI** adalah aplikasi pembelajaran adaptif yang menggunakan **Google Gemini AI Agent** untuk menciptakan pengalaman belajar yang 100% personal. Aplikasi ini menganalisis gaya belajar user, kemudian menghasilkan:

- ✨ **Learning Persona** yang disesuaikan dengan preferensi belajar
- 📚 **Study Plan** yang adaptif dan realistis
- 📝 **Learning Modules** dengan konten yang dipersonalisasi
- ⏱️ **Pomodoro Timer** untuk fokus maksimal
- 🤖 **AI Chat Tutor** yang conversational dan kontekstual
- 📊 **Analytics & Insights** berbasis AI

---

## 🎯 Problem Statement

Tidak semua Gen Z nyaman dengan gaya belajar yang sama:

- Beberapa lebih **visual** daripada tekstual
- Beberapa lebih **verbal** dan diskusi
- Beberapa **cepat bosan** dengan fokus pendek
- Hanya efektif belajar di **waktu tertentu**

Platform belajar konvensional bersifat **statis** dan tidak beradaptasi.

### ✅ Solusi

StudyFlow AI menggunakan **Google Gemini AI Agent** untuk:

1. Menganalisis gaya belajar melalui **onboarding quiz**
2. Mengidentifikasi pola fokus dan preferensi
3. Menghasilkan modul belajar yang **adaptif**
4. Belajar dari interaksi user untuk meningkatkan personalisasi

---

## 🏗️ Arsitektur Sistem

### Tech Stack

#### Frontend
- **React 18.3** - UI Library
- **React Router DOM** - Routing
- **Zustand** - State Management
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Framer Motion** - Animations (optional)

#### Backend
- **Node.js + Express** - REST API Server
- **PostgreSQL (pg)** - Database
- **Google Generative AI SDK** - Gemini Integration
- **JWT** - Authentication
- **bcryptjs** - Password Hashing

#### AI Layer
- **Google Gemini 2.0 Flash** - Core AI Agent
  - Learning Style Analysis
  - Content Generation
  - Conversational Tutoring
  - Progress Analytics

### Database Schema

```
📦 Database: studyflow (PostgreSQL)

├── users (user accounts)
├── learning_persona (AI-generated learning profiles)
├── study_plan (adaptive study plans)
├── learning_modules (AI-generated content)
├── learning_sessions (pomodoro tracking)
├── learning_progress (progress history)
├── quiz_results (evaluation data)
├── ai_conversations (chat history)
├── ai_insights (AI recommendations)
└── onboarding_responses (quiz data)
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### 1. Clone Repository

```bash
git clone <repository-url>
cd integrated-ai-scanning
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install

# Install Tailwind (if not installed)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Setup PostgreSQL

```bash
# Install PostgreSQL (if not installed)
# Windows: Download from postgresql.org
# Mac: brew install postgresql@15
# Linux: sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Create database
psql -U postgres
CREATE DATABASE studyflow;
\q
```

### 4. Setup Environment Variables

Create a `.env` file in the root directory:

```env
# Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Port
PORT=3001

# API URL (for frontend)
VITE_API_URL=http://localhost:3001/api

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studyflow
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

### 5. Initialize Database

Database schema akan otomatis di-initialize saat server pertama kali berjalan.

### 6. Run Development Server

```bash
# Terminal 1 - Backend Server
npm run server

# Terminal 2 - Frontend Dev Server
npm run dev

# Or run both simultaneously
npm run dev:full
```

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:3001/api

---

## 📱 Fitur Lengkap

### 1. 🔐 Authentication
- Register dengan email & password
- Login dengan JWT token
- Secure password hashing dengan bcrypt

### 2. 🎓 Onboarding & Learning Persona
- **8 pertanyaan** untuk analisis mendalam
- AI analyze responses dengan Gemini
- Generate **Learning Persona**:
  - Gaya belajar (visual, verbal, kinesthetic, mixed)
  - Fokus level (rendah, sedang, tinggi)
  - Preferensi waktu (pagi, sore, malam)
  - Durasi ideal (15, 25, 45 menit)
  - Tingkat detail (ringkas, sedang, detail)
  - Tipe motivasi (achievement, social, personal_growth)
  - Learning pace (cepat, normal, santai)

### 3. 📚 Study Plan Generator
- Input: Mata kuliah + Topik + Tingkat kesulitan
- AI generate:
  - Breakdown materi menjadi modul kecil
  - Estimasi durasi realistis
  - Jadwal belajar adaptif
  - Target completion date

### 4. 📝 Learning Modules
- Konten disesuaikan dengan learning persona
- Format: Markdown dengan struktur jelas
- Tujuan pembelajaran
- Konsep utama
- Contoh praktis
- Key takeaways
- Mini quiz untuk evaluasi

### 5. ⏱️ Pomodoro Timer
- Customizable duration (based on persona)
- Focus time + Break time
- Visual countdown
- Browser notifications
- Pomodoro counter
- Total time tracking

### 6. 🤖 AI Chat Tutor
- Conversational & natural
- Context-aware (remember chat history)
- Adapted to learning persona
- Supportive & motivational
- Real-time responses

### 7. 📊 Analytics & Progress
- Total learning minutes
- Average focus score
- Streak days
- Quiz performance
- Progress history
- Mood tracking

### 8. ✨ AI Insights
- Learning pattern analysis
- Strength identification
- Improvement suggestions
- Actionable recommendations
- Generated from 3+ sessions

### 9. 👤 Profile & Settings
- User information
- Learning persona display
- Update persona option
- Account management

---

## 🎨 UI/UX Design Principles

### Gen Z Friendly Design

1. **Visual Appeal**
   - Gradient colors (purple-pink)
   - Rounded corners (2xl, 3xl)
   - Subtle shadows & hover effects
   - Emoji untuk visual cues

2. **User Experience**
   - Low cognitive load
   - Clear call-to-actions
   - Instant feedback
   - Smooth transitions
   - Mobile responsive

3. **Typography**
   - Inter font family
   - Clear hierarchy
   - Readable font sizes
   - Good contrast

4. **Colors**
   - Primary: Purple (#9333ea)
   - Secondary: Pink (#db2777)
   - Neutral: Gray scale
   - Success: Green
   - Warning: Yellow/Orange

---

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
```

### Onboarding
```
POST   /api/onboarding/responses       - Save quiz responses
POST   /api/onboarding/generate-persona - Generate learning persona with AI
GET    /api/onboarding/persona         - Get learning persona
```

### Study Plans
```
POST   /api/study/plans           - Create study plan (AI generated)
GET    /api/study/plans           - Get all study plans
GET    /api/study/plans/:id       - Get study plan with modules
```

### Learning Sessions
```
POST   /api/study/sessions        - Start learning session
PUT    /api/study/sessions/:id/end - End learning session
```

### Quiz
```
POST   /api/study/quiz-results    - Save quiz result
```

### AI Chat
```
POST   /api/chat/tutor            - Chat with AI tutor
GET    /api/chat/history          - Get chat history
```

### Analytics
```
GET    /api/analytics/progress         - Get progress data
POST   /api/analytics/progress         - Save progress
POST   /api/analytics/insights/generate - Generate AI insights
GET    /api/analytics/insights         - Get unread insights
PUT    /api/analytics/insights/:id/read - Mark insight as read
GET    /api/analytics/quiz-results     - Get quiz results
```

---

## 🤖 Gemini AI Agent Integration

### AI Agent Architecture

```
┌─────────────────────────────────────────┐
│        Google Gemini AI Agent           │
│         (gemini-2.0-flash-exp)          │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   System Prompts          User Context
        │                       │
  ┌─────┴──────┐         ┌─────┴──────┐
  │ Specialized │         │  Learning  │
  │   Prompts   │         │   Persona  │
  └─────┬──────┘         └─────┬──────┘
        │                       │
        └───────────┬───────────┘
                    │
            ┌───────▼───────┐
            │  AI Response  │
            │   (JSON/Text) │
            └───────────────┘
```

### System Prompts

1. **Learning Style Analyzer** - Analyze onboarding responses
2. **Study Plan Generator** - Create personalized study plans
3. **Module Content Generator** - Generate learning content
4. **AI Tutor** - Conversational tutoring
5. **Progress Analyzer** - Analyze learning patterns
6. **Quiz Generator** - Create evaluation questions

### Prompt Engineering Examples

#### Learning Style Analysis
```javascript
const prompt = `
You are a Learning Style Analyst expert.
Analyze the user's responses and determine:
- Learning style (visual, verbal, kinesthetic, mixed)
- Focus level (low, medium, high)
- Preferred time (morning, afternoon, evening)
...

Output in JSON format:
{
  "gaya_belajar": "...",
  "fokus_level": "...",
  ...
}
`;
```

---

## 📊 User Flow

```
1. Register/Login
         ↓
2. Onboarding Quiz (8 questions)
         ↓
3. AI analyzes responses → Generate Learning Persona
         ↓
4. Dashboard (personalized recommendations)
         ↓
5. Create Study Plan (AI generates adaptive plan)
         ↓
6. Start Learning Session
   ├─ Read learning module
   ├─ Use Pomodoro Timer
   ├─ Take mini quiz
   └─ Chat with AI Tutor (if needed)
         ↓
7. AI tracks progress & generates insights
         ↓
8. View Analytics & Improve
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Complete onboarding quiz
- [ ] Verify learning persona generated
- [ ] Create study plan
- [ ] Start learning session
- [ ] Use Pomodoro timer
- [ ] Take quiz
- [ ] Chat with AI tutor
- [ ] View analytics
- [ ] Generate AI insights
- [ ] Update profile

### Test User Credentials

```
Email: test@example.com
Password: test123
```

---

## 📦 Deployment

### Backend Deployment (e.g., Railway, Render)

1. Push code to Git repository
2. Connect to deployment platform
3. Set environment variables
4. Deploy!

### Frontend Deployment (e.g., Vercel, Netlify)

```bash
npm run build
```

Upload `dist` folder or connect Git repository.

### Environment Variables (Production)

```env
VITE_GEMINI_API_KEY=<your-production-key>
JWT_SECRET=<strong-random-secret>
PORT=3001
VITE_API_URL=<your-backend-url>/api
```

---

## 🔒 Security Considerations

- ✅ Password hashing dengan bcrypt
- ✅ JWT untuk authentication
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS configured
- ✅ Environment variables untuk secrets
- ⚠️ **TODO:** Rate limiting untuk API
- ⚠️ **TODO:** Input sanitization
- ⚠️ **TODO:** HTTPS in production

---

## 🎯 Roadmap

### Phase 1 (Current) ✅
- [x] Authentication system
- [x] Onboarding & learning persona
- [x] Study plan generator
- [x] Learning modules
- [x] Pomodoro timer
- [x] AI chat tutor
- [x] Analytics & insights

### Phase 2 (Next)
- [ ] Social features (study groups)
- [ ] Gamification (badges, levels)
- [ ] Spaced repetition algorithm
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Export progress reports

### Phase 3 (Future)
- [ ] Video learning modules
- [ ] Live study sessions
- [ ] Mentor matching
- [ ] Advanced analytics with ML
- [ ] Voice interaction with AI
- [ ] Collaborative learning

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 👨‍💻 Developer

Built with ❤️ using **Google Gemini AI Agent**

---

## 📞 Support

Jika ada pertanyaan atau issue:
- Open an issue on GitHub
- Email: your-email@example.com

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For the amazing AI capabilities
- **React Team** - For the awesome library
- **Tailwind CSS** - For the utility-first CSS framework
- **All open-source contributors**

---

**Happy Learning! 🎉**


#   S t u d y F l o w A I 1  
 