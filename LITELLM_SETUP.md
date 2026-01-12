# Setup LiteLLM untuk StudyFlowAI

## Konfigurasi Perubahan

Anda telah mengganti dari Google Gemini API langsung ke **LiteLLM proxy** yang menggunakan OpenAI client. Ini memberikan Anda fleksibilitas lebih untuk menggunakan berbagai LLM model.

## Environment Variables

Tambahkan di file `.env` Anda:

```bash
# LiteLLM Configuration
LITELLM_BASE_URL=https://litellm.koboi2026.biz.id/v1
LITELLM_API_KEY=sk-pyA
```

## Setup Step-by-Step

### 1. Install Dependencies
```bash
npm install
```
Ini akan menginstall OpenAI client package v4.52.0 dan menghapus Google Generative AI package.

### 2. Konfigurasi Environment
Buat file `.env` di root project:
```bash
cp .env.example .env
```

Kemudian update dengan credentials Anda:
```bash
LITELLM_BASE_URL=https://litellm.koboi2026.biz.id/v1
LITELLM_API_KEY=sk-pyA
```

### 3. Verifikasi Setup
Model yang digunakan: `gemini/gemini-2.5-flash`

Anda bisa mengubahnya di:
- [server/services/geminiAgent.js](server/services/geminiAgent.js#L269)

```javascript
this.model = "gemini/gemini-2.5-flash";
```

## Testing API Connection

Untuk test koneksi ke LiteLLM, bisa menggunakan curl:

```bash
curl -X POST "https://litellm.koboi2026.biz.id/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-pyA" \
  -d '{
    "model": "gemini/gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "Hello, this is a test!"
      }
    ]
  }'
```

## Perubahan Teknis

### Dari:
- **Import**: `@google/generative-ai`
- **Client**: GoogleGenerativeAI
- **Method**: `generateContent()`
- **Konfigurasi**: API Key Gemini langsung

### Menjadi:
- **Import**: `openai`
- **Client**: OpenAI dengan custom baseURL
- **Method**: `chat.completions.create()`
- **Konfigurasi**: LiteLLM proxy dengan OpenAI format

## Struktur Class

Semua method tetap sama:
- `analyzeLearningStyle()` - Analisis gaya belajar
- `generateStudyPlan()` - Generate study plan
- `generateModuleContent()` - Generate konten module
- `generateQuiz()` - Generate quiz
- `chatWithTutor()` - AI chat tutor
- `analyzeProgress()` - Analisis progress
- `updatePersona()` - Update learning persona
- `generateMotivation()` - Generate motivasi

## Troubleshooting

### Error: API Key tidak valid
Pastikan `LITELLM_API_KEY` sudah benar di `.env`

### Error: Network/Connection
Pastikan URL `LITELLM_BASE_URL` accessible dan valid

### Error: Model tidak ditemukan
Periksa apakah model `gemini/gemini-2.5-flash` tersedia di LiteLLM Anda

## Next Steps

1. ✅ Perbarui npm packages: `npm install`
2. ✅ Setup `.env` dengan LiteLLM credentials
3. ✅ Test API connection menggunakan curl
4. ✅ Jalankan server: `npm run server`
5. ✅ Test endpoints untuk memastikan AI functions bekerja

Semua perubahan sudah dilakukan! Anda siap menggunakan LiteLLM untuk StudyFlowAI.
