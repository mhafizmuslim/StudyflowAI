# 🐘 PostgreSQL Setup Guide - StudyFlow AI

Panduan lengkap setup PostgreSQL untuk StudyFlow AI.

---

## 🎯 Kenapa PostgreSQL?

- ✅ **No Compilation Required** - Pure JavaScript, tidak butuh Visual Studio Build Tools
- ✅ **Production Ready** - Scalable dan reliable untuk production
- ✅ **Better Performance** - Lebih cepat untuk concurrent connections
- ✅ **Industry Standard** - Digunakan oleh perusahaan besar

---

## 📥 Install PostgreSQL

### Windows

1. Download PostgreSQL dari [postgresql.org](https://www.postgresql.org/download/windows/)
2. Jalankan installer
3. Set password untuk user `postgres` (ingat password ini!)
4. Port default: `5432` (biarkan default)
5. Install semua components

### Mac

```bash
# Install dengan Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Optional: Create postgres user with password
createuser -s postgres
psql postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set password untuk postgres user
sudo -u postgres psql
ALTER USER postgres PASSWORD 'postgres';
\q
```

---

## 🗄️ Create Database

### Method 1: Using psql (Command Line)

```bash
# Login ke PostgreSQL
psql -U postgres

# Di psql prompt, jalankan:
CREATE DATABASE studyflow;

# Verify database created
\l

# Exit
\q
```

### Method 2: Using pgAdmin (GUI)

1. Buka pgAdmin (installed with PostgreSQL)
2. Login dengan password yang kamu set
3. Right-click "Databases" → "Create" → "Database"
4. Name: `studyflow`
5. Save

### Method 3: One-liner

```bash
# Windows (Command Prompt)
psql -U postgres -c "CREATE DATABASE studyflow;"

# Mac/Linux
psql -U postgres -c "CREATE DATABASE studyflow;"
```

---

## ⚙️ Setup Environment Variables

Buat file `.env` di root directory project:

```env
# Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret
JWT_SECRET=my-super-secret-key-12345

# Server Port
PORT=3001
VITE_API_URL=http://localhost:3001/api

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studyflow
DB_USER=postgres
DB_PASSWORD=postgres  # Ganti dengan password postgres kamu
```

**⚠️ Penting:** Ganti `DB_PASSWORD` dengan password PostgreSQL yang kamu set saat instalasi!

---

## 🚀 Run Application

```bash
# Install dependencies (jika belum)
npm install

# Run backend server (schema akan auto-initialize)
npm run server

# Di terminal lain, run frontend
npm run dev
```

**Expected Output:**

```
✅ PostgreSQL database connected
atau
✅ PostgreSQL database schema initialized
🚀 StudyFlow AI Server running on http://localhost:3001
```

---

## 🔍 Verify Database

### Check Tables

```bash
# Login ke database
psql -U postgres -d studyflow

# List all tables
\dt

# Expected output: 10 tables
# - users
# - learning_persona
# - study_plan
# - learning_modules
# - learning_sessions
# - learning_progress
# - quiz_results
# - ai_conversations
# - ai_insights
# - onboarding_responses

# View table structure
\d users

# Exit
\q
```

### Check Connection from App

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Expected: {"status":"ok","message":"StudyFlow AI API is running"}
```

---

## 🛠️ Troubleshooting

### Error: "password authentication failed"

**Solusi:**
```bash
# Reset password untuk postgres user
sudo -u postgres psql
ALTER USER postgres PASSWORD 'newpassword';
\q

# Update .env dengan password baru
DB_PASSWORD=newpassword
```

### Error: "database studyflow does not exist"

**Solusi:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE studyflow;"
```

### Error: "connection refused" atau "ECONNREFUSED"

**Solusi:**
```bash
# Check PostgreSQL service status
# Windows
pg_ctl status

# Mac
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Start service jika belum jalan
# Windows: Start dari Services
# Mac: brew services start postgresql@15
# Linux: sudo systemctl start postgresql
```

### Error: "role postgres does not exist"

**Solusi:**
```bash
# Create postgres user
createuser -s postgres

# Set password
psql postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Error: Port 5432 already in use

**Solusi:**
```bash
# Check apa yang pakai port 5432
# Windows
netstat -ano | findstr :5432

# Mac/Linux
lsof -i :5432

# Stop PostgreSQL dan restart
# Atau ubah DB_PORT di .env ke port lain (misal 5433)
```

---

## 🗑️ Reset Database (Jika Perlu)

```bash
# Drop dan recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS studyflow;"
psql -U postgres -c "CREATE DATABASE studyflow;"

# Restart server (schema akan auto-recreate)
npm run server
```

---

## 📊 Database Tools

### Recommended GUI Tools

1. **pgAdmin** (Free, installed with PostgreSQL)
   - [pgadmin.org](https://www.pgadmin.org/)

2. **DBeaver** (Free, cross-platform)
   - [dbeaver.io](https://dbeaver.io/)

3. **TablePlus** (Paid, Mac/Windows)
   - [tableplus.com](https://tableplus.com/)

### Connection Details

```
Host: localhost
Port: 5432
Database: studyflow
Username: postgres
Password: <your-password>
```

---

## 🔐 Security Best Practices

### Development

```env
# .env (local)
DB_PASSWORD=postgres  # Simple password OK untuk local
```

### Production

```env
# .env.production
DB_HOST=your-production-host.com
DB_PORT=5432
DB_NAME=studyflow_prod
DB_USER=studyflow_user
DB_PASSWORD=super-secure-random-password-here  # STRONG password!
```

**Tips:**
- Jangan commit `.env` ke git (already in .gitignore)
- Gunakan strong password untuk production
- Pertimbangkan gunakan SSL connection untuk production
- Buat separate database user (jangan pakai `postgres` di production)

---

## 📈 Production Deployment

### Recommended PostgreSQL Hosting

1. **Heroku Postgres** - Easy, free tier available
2. **Supabase** - Free tier, includes hosting
3. **Railway** - Simple deployment
4. **AWS RDS** - Enterprise grade
5. **Digital Ocean** - Managed PostgreSQL

### Example: Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create studyflow-ai

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Get database URL
heroku config:get DATABASE_URL

# Update .env.production dengan DATABASE_URL
# Format: postgres://user:password@host:port/database
```

---

## ✅ Migration Complete!

Sekarang StudyFlow AI menggunakan **PostgreSQL** instead of SQLite:

✅ No more compilation errors  
✅ Production-ready database  
✅ Better performance  
✅ Easier to scale  

**Happy coding! 🎉**


