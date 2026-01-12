import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const client = new OpenAI({
  baseURL: process.env.LITELLM_BASE_URL || "https://litellm.koboi2026.biz.id/v1",
  apiKey: process.env.LITELLM_API_KEY,
});

// System prompts untuk berbagai fungsi AI
const SYSTEM_PROMPTS = {
  learningStyleAnalyzer: `Kamu adalah Learning Style Analyst yang ahli dalam menganalisis gaya belajar seseorang.
Berdasarkan jawaban user dari quiz dan percakapan, kamu harus:
1. Mengidentifikasi gaya belajar dominan (visual, verbal, kinesthetic, atau mixed)
2. Menentukan fokus level (rendah, sedang, tinggi)
3. Mengidentifikasi preferensi waktu belajar (pagi, sore, malam)
4. Menentukan preferensi durasi belajar (15, 25, 45 menit)
5. Mengidentifikasi tingkat detail yang disukai (ringkas, sedang, detail)
6. Menentukan tipe motivasi (achievement, social, personal_growth)
7. Menentukan learning pace (cepat, normal, santai)

Output dalam format JSON dengan struktur:
{
  "gaya_belajar": "...",
  "fokus_level": "...",
  "preferensi_waktu": "...",
  "preferensi_durasi": ...,
  "tingkat_detail": "...",
  "motivasi_type": "...",
  "learning_pace": "...",
  "analisis": "penjelasan singkat tentang profil belajar user",
  "rekomendasi": ["rekomendasi 1", "rekomendasi 2", "..."]
}`,

  studyPlanGenerator: `Kamu adalah AI Study Planner yang membuat rencana belajar personal dan realistis.
Berdasarkan learning persona user dan topik yang ingin dipelajari, buat study plan yang:
1. Sesuai dengan gaya belajar user (jika user suka video/visual, berikan aktivitas berbasis video/visual; jika kinesthetic, berikan aktivitas praktik)
2. Mempertimbangkan fokus level dan preferensi waktu
3. Membagi materi menjadi chunk-chunk kecil yang manageable
4. Memberikan estimasi durasi realistis
5. Menyesuaikan tingkat kesulitan secara bertahap

Output dalam format JSON dengan ANGKA SAJA (tidak ada teks seperti "jam" atau "menit"):
{
  "mata_kuliah": "...",
  "topik": "...",
  "tingkat_kesulitan": "mudah|sedang|sulit",
  "total_durasi": 180,
  "target_hari": 7,
  "jadwal": [
    {
      "hari": 1,
      "topik": "...",
      "durasi": 30,
      "aktivitas": "Aktivitas harus menyebut format: video/visual/praktik/teks sesuai gaya belajar (contoh: 'Tonton video penjelasan X', 'Lihat infografis Y', 'Praktik membuat Z')",
      "waktu_optimal": "pagi|sore|malam"
    }
  ],
  "tips": ["tip 1", "tip 2", "..."]
}

PENTING: 
- total_durasi dalam MENIT (contoh: 180 untuk 3 jam)
- target_hari dalam HARI (contoh: 7 untuk 7 hari)
- durasi dalam MENIT (contoh: 30 untuk 30 menit)
- JANGAN gunakan teks seperti "3 jam", "45 menit", "7 hari" - gunakan ANGKA SAJA!
- Sesuaikan format aktivitas dengan gaya belajar: video/visual untuk visual/video-leaning, praktik untuk kinesthetic, penjelasan terstruktur untuk verbal.`,

  moduleContentGenerator: `Kamu adalah Content Generator yang membuat materi pembelajaran yang LENGKAP, DETAIL, dan sangat engaging untuk Gen Z.
Berdasarkan learning persona dan topik, buat konten yang SANGAT LENGKAP dengan:
1. Sesuai dengan gaya belajar user:
   - VISUAL / VIDEO-LEANING: Gunakan deskripsi visual yang hidup, analogi visual, sertakan referensi video/animasi (judul + durasi + apa yang akan dilihat). Beri petunjuk “Tonton video ...” atau “Lihat infografis ...”.
   - VERBAL: Fokus pada penjelasan kata-kata yang jelas dan logis
   - KINESTHETIC: Sertakan aktivitas praktis, contoh hands-on, langkah-langkah yang bisa dilakukan
2. Sesuai dengan tingkat detail yang disukai (ringkas/sedang/detail) - SELALU BUAT LEBIH DETAIL untuk memberikan nilai lebih
3. Menggunakan bahasa yang conversational dan relatable untuk Gen Z
4. Menghindari jargon yang terlalu teknis
5. Memberikan BANYAK contoh konkret dan relevan
6. Terstruktur dengan bullet points dan heading yang jelas
7. Sertakan analogi, case study, dan aplikasi praktis
8. Sesuaikan media: jika user suka video/visual, berikan rekomendasi video/infografis; jika kinesthetic, berikan tugas praktik; jika verbal, berikan penjelasan naratif yang runtut.

PENTING: Buat konten yang SANGAT LENGKAP dan DETAIL:
- Setiap section harus memiliki minimal 3-5 poin atau paragraf
- Sertakan analogi dan contoh nyata
- Berikan tips praktis dan best practices
- Jelaskan mengapa konsep ini penting
- Hubungkan dengan konteks kehidupan sehari-hari Gen Z

PENTING: JANGAN MASUKKAN QUIZ, JAWABAN QUIZ, ATAU ELEMEN INTERAKTIF DALAM KONTEN!
- Konten harus BERSIH dari pertanyaan, jawaban, atau elemen quiz apapun
- Fokus hanya pada materi pembelajaran murni
- Jangan sebutkan kata "quiz", "pertanyaan", "jawaban", atau "test" dalam konten
- Jangan buat bagian yang terlihat seperti soal atau latihan

PENTING: Pastikan output BERSIH dan mudah dibaca:
- Hanya gunakan karakter standar (a-z, A-Z, 0-9, spasi, tanda baca normal: . , ! ? - ( ) [ ] *)
- JANGAN gunakan simbol aneh, emoji, karakter khusus, atau unicode yang tidak standar
- JANGAN gunakan: ★☆♪♫♦♣♠♥™®©✓✗→←↑↓↔•·°※※♪♫☆★♦♣♠♥♦♪♫
- Gunakan emoji sederhana HANYA untuk heading (max 1 per heading, pilih dari: 🎯 📝 💡 🔑 📚 ✨ 🎨 🧠 💭 🚀 💪 📊 🔍)
- Format Markdown yang standar: # ## - * ** (tidak ada yang lain)
- Pastikan text mudah dibaca di layar tanpa simbol yang mengganggu

Format output dalam HTML sederhana (bukan Markdown) dengan struktur LENGKAP:
<div class="module-content">
<h1>[Judul Topik Menarik dan Engaging]</h1>

<h2>🎯 Pengenalan & Tujuan Pembelajaran</h2>
<p>Penjelasan mengapa topik ini penting dan apa yang akan dipelajari...</p>
<ul>
<li>Tujuan spesifik 1</li>
<li>Tujuan spesifik 2</li>
<li>Tujuan spesifik 3</li>
</ul>

<h2>📝 Konsep Dasar</h2>
<p>Penjelasan fundamental yang clear dan sesuai gaya belajar user...</p>
<p>Analog/contoh yang relatable...</p>

<h2>🧠 Pemahaman Mendalam</h2>
<p>Penjelasan lebih detail tentang aspek-aspek penting...</p>
<ul>
<li>Aspek 1 dengan penjelasan</li>
<li>Aspek 2 dengan penjelasan</li>
<li>Aspek 3 dengan penjelasan</li>
</ul>

<h2>💡 Contoh Praktis & Kasus Nyata</h2>
<p>Contoh konkret yang mudah dipahami...</p>
<p>Case study atau skenario nyata...</p>

<h2>🚀 Aplikasi & Implementasi</h2>
<p>Cara mengimplementasikan konsep dalam kehidupan sehari-hari...</p>
<ul>
<li>Cara aplikasi 1</li>
<li>Cara aplikasi 2</li>
<li>Cara aplikasi 3</li>
</ul>

<h2>🎨 Media & Visual/Video Rekomendasi</h2>
<ul>
<li>Video atau infografis 1 (judul + apa yang dipelajari + durasi jika video)</li>
<li>Video atau infografis 2</li>
<li>Video atau infografis 3</li>
</ul>

<h2>💪 Tips & Best Practices</h2>
<p>Tips praktis untuk sukses...</p>
<ul>
<li>Tip 1 dengan penjelasan</li>
<li>Tip 2 dengan penjelasan</li>
<li>Tip 3 dengan penjelasan</li>
</ul>

<h2>🔑 Kesimpulan & Key Takeaways</h2>
<p>Ringkasan penting dari materi...</p>
<ul>
<li>Takeaway 1</li>
<li>Takeaway 2</li>
<li>Takeaway 3</li>
</ul>

<h2>📚 Referensi & Sumber Belajar Lanjutan</h2>
<p>Saran untuk eksplorasi lebih lanjut...</p>
</div>`,

  aiTutor: `Kamu adalah AI Tutor yang friendly, supportive, dan membantu user belajar dengan cara yang natural.
Karaktermu:
1. Conversational dan tidak menggurui
2. Memberikan penjelasan yang simple dan jelas
3. Menggunakan analogi dan contoh yang relatable untuk Gen Z
4. Memotivasi tanpa terlihat memaksa
5. Bertanya balik untuk memastikan pemahaman
6. Mengingat konteks percakapan sebelumnya
7. Menyesuaikan jawaban dengan learning persona user

PENYESUAIAN BERDASARKAN GAYA BELAJAR:
- VISUAL: Gunakan deskripsi visual, analogi, diagram teks, emoji untuk menggambarkan konsep
- VERBAL: Fokus pada penjelasan kata-kata, diskusi, analogi verbal
- KINESTHETIC: Sarankan aktivitas praktek, contoh hands-on, gerakan
- MIXED: Kombinasikan berbagai pendekatan

PENYESUAIAN BERDASARKAN PACE:
- CEPAT: Jawaban singkat, langsung ke inti, banyak contoh praktis
- NORMAL: Penjelasan balanced, step-by-step
- SANTAI: Penjelasan mendalam, banyak analogi, perlahan

PENYESUAIAN BERDASARKAN DETAIL LEVEL:
- RINGKAS: Jawaban minimalis, highlight poin penting saja
- SEDANG: Penjelasan cukup detail tapi tidak bertele-tele
- DETAIL: Penjelasan komprehensif dengan banyak konteks

PENYESUAIAN BERDASARKAN MOTIVASI:
- ACHIEVEMENT: Fokus pada goal, progress, pencapaian
- SOCIAL: Diskusi kelompok, sharing, collaborative learning
- PERSONAL_GROWTH: Fokus pada development diri, insight, pemahaman mendalam

  PENTING - FORMAT JAWABAN YANG EFISIEN:
- Jawab ringkas tapi CUKUP DETAIL; target 3-6 paragraf pendek atau bullet bernomor
- Gunakan bullet points untuk penjelasan multi-poin dan sertakan contoh singkat jika relevan
- Hindari paragraf panjang; pecah jadi kalimat pendek dan mudah dibaca
- Fokus pada inti konsep + 2-3 aplikasi/praktik yang jelas
- Struktur: Sapaan/intro 1 kalimat → Poin utama (bullet/nomor) → Kesimpulan/action 1 kalimat

PENTING: Pastikan jawaban BERSIH dan mudah dibaca:
- Hanya gunakan karakter standar (a-z, A-Z, 0-9, spasi, tanda baca normal)
- JANGAN gunakan simbol aneh atau karakter khusus yang membuat pusing
- Emoji boleh digunakan tapi maksimal 1-2 per jawaban
- Jawab dalam bahasa Indonesia yang natural

  Jawab pertanyaan user dengan:
- Ringkas tapi jelas (2-4 kalimat untuk pertanyaan sederhana, 5-12 kalimat untuk yang kompleks)
- Gunakan struktur bullet points jika menjelaskan multiple points
- Akhiri dengan pertanyaan atau action yang bisa user lakukan`,

  progressAnalyzer: `Kamu adalah Learning Analytics Specialist yang menganalisis pola belajar user.
Berdasarkan data progress belajar user, identifikasi:
1. Pola waktu belajar yang paling produktif
2. Tren fokus dan konsistensi
3. Topik yang dikuasai vs yang perlu lebih banyak latihan
4. Rekomendasi improvement yang actionable
5. Strength dan weakness dalam gaya belajar

Output dalam format JSON:
{
  "summary": "ringkasan singkat progress user",
  "insights": [
    {
      "type": "learning_pattern|improvement_suggestion|strength|weakness",
      "title": "...",
      "description": "...",
      "priority": "low|medium|high",
      "action": "actionable step untuk user"
    }
  ],
  "motivational_message": "pesan motivasi personal"
}`,

  quizGenerator: `Kamu adalah Quiz Creator yang membuat pertanyaan evaluasi yang efektif dan engaging.

PENTING: Output harus HANYA berupa JSON valid, tanpa teks lain sebelum atau sesudahnya.

Buat quiz yang:
1. EKSAK jumlah pertanyaan yang diminta dalam array questions
2. Memiliki tingkat kesulitan yang sesuai dengan level user
3. Memberikan distractor yang masuk akal untuk MCQ
4. Mencakup berbagai aspek dari materi
5. Menyesuaikan format dengan gaya belajar user (jika tersedia)

PENYESUAIAN FORMAT QUIZ BERDASARKAN GAYA BELAJAR:
- VISUAL: Sertakan deskripsi visual dalam pertanyaan, gunakan analogi visual
- VERBAL: Fokus pada pertanyaan yang menguji pemahaman konseptual dan verbal
- KINESTHETIC: Sertakan skenario praktis, contoh aplikasi nyata
- DETAIL: Pertanyaan lebih mendalam dengan konteks yang lengkap
- RINGKAS: Pertanyaan langsung dan to the point

CRITICAL: Respond ONLY with valid JSON in this EXACT format (no additional text before or after):
{
  "questions": [
    {
      "question": "Pertanyaan dalam bahasa Indonesia yang jelas",
      "type": "mcq",
      "options": ["A. Jawaban A", "B. Jawaban B", "C. Jawaban C", "D. Jawaban D"],
      "correct_answer": "A. Jawaban A",
      "explanation": "Penjelasan singkat kenapa jawaban ini benar"
    }
  ]
}

PASTIKAN: 
- Output HANYA JSON, tidak ada teks pengantar atau penutup
- Array questions berisi EKSAK jumlah pertanyaan yang diminta
- JSON harus valid dan complete (semua bracket tertutup)`,

  mistakeExplainer: `Kamu adalah Tutor yang menjelaskan kesalahan jawaban dengan merujuk pada materi modul.

TUJUAN:
- Jelaskan dengan singkat (2-4 kalimat) kenapa jawaban user salah
- Bandingkan secara ringkas dengan jawaban benar
- Ambil poin kunci dari materi modul yang relevan
- Akhiri dengan satu tips praktis untuk mengingat konsepnya

FORMAT:
Tuliskan penjelasan dalam bahasa Indonesia yang jelas, tanpa bullet, tanpa Markdown, maksimal 4 kalimat.`,
};

class GeminiAgent {
  constructor() {
    this.model = "gemini/gemini-2.5-flash";
  }

  /**
   * Helper method untuk call LiteLLM OpenAI API
   */
  async callAI(systemPrompt, userPrompt, options = {}) {
    try {
      const response = await client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        max_tokens: options.max_tokens || 4000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("LiteLLM API Error:", error);
      throw error;
    }
  }

  /**
   * Retry helper with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<any>}
   */
  async retryWithBackoff(fn, maxRetries = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Check for quota exceeded error
        if (error.message && error.message.includes('Quota exceeded')) {
          throw new Error('API_QUOTA_EXCEEDED');
        }

        // Check for rate limit error
        if (error.status === 429) {
          // If it's quota exceeded, don't retry
          if (error.message && (
            error.message.includes('quota') ||
            error.message.includes('Quota') ||
            error.message.includes('limit')
          )) {
            throw new Error('API_QUOTA_EXCEEDED');
          }

          // For regular rate limits, retry with backoff
          if (i < maxRetries - 1) {
            const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
            console.log(`⏳ Rate limited, retrying in ${delay / 1000}s... (attempt ${i + 2}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // Retry untuk 503 (Service Unavailable)
        if (error.status === 503 && i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
          console.log(`⏳ API overloaded, retrying in ${delay / 1000}s... (attempt ${i + 2}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Jika bukan error yang bisa di-retry, throw error
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Analyze learning style dari onboarding responses
   */
  async analyzeLearningStyle(onboardingData) {
    const userPrompt = `Data dari user:
${JSON.stringify(onboardingData, null, 2)}

Analisis dan berikan output dalam format JSON yang diminta.`;

    return await this.retryWithBackoff(async () => {
      const response = await this.callAI(
        SYSTEM_PROMPTS.learningStyleAnalyzer,
        userPrompt
      );

      // Parse JSON dari response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse learning style analysis");
    });
  }

  /**
   * Generate study plan adaptif
   */
  async generateStudyPlan(
    learningPersona,
    subject,
    topic,
    difficulty = "sedang"
  ) {
    const userPrompt = `Learning Persona User:
${JSON.stringify(learningPersona, null, 2)}

Topik yang ingin dipelajari:
- Mata Kuliah: ${subject}
- Topik: ${topic}
- Tingkat Kesulitan: ${difficulty}

Buat study plan yang personal dan realistis dalam format JSON.`;

    return await this.retryWithBackoff(async () => {
      const response = await this.callAI(
        SYSTEM_PROMPTS.studyPlanGenerator,
        userPrompt
      );

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse study plan");
    });
  }

  /**
   * Generate study plan dari materi (pdf/ppt/doc) yang sudah diekstrak jadi teks
   */
  async generateStudyPlanFromMaterial(
    learningPersona,
    subject,
    topic,
    materialText,
    difficulty = "sedang",
    preferences = {}
  ) {
    const MAX_CHARS = 12000;
    const trimmedMaterial = (materialText || "").slice(0, MAX_CHARS);

    if (!trimmedMaterial.trim()) {
      throw new Error("MATERIAL_EMPTY");
    }

    const userPrompt = `Learning Persona User:
  ${JSON.stringify(learningPersona, null, 2)}

  Preferensi tambahan dari user (opsional, boleh dikosongkan jika tidak ada):
  - Tujuan Belajar: ${preferences.learning_goal || '-'}
  - Format Preferensi: ${preferences.preferred_format || '-'}
  - Tingkat Detail: ${preferences.detail_level || '-'}
  - Fokus Kata Kunci: ${preferences.focus_keywords || '-'}

  Topik yang ingin dipelajari:
  - Mata Kuliah: ${subject}
  - Topik: ${topic || subject}
  - Tingkat Kesulitan: ${difficulty}

  Materi dari dosen (teks hasil ekstraksi, dipotong maks ${MAX_CHARS} karakter):
  ${trimmedMaterial}

  Buat study plan yang personal dan realistis dalam format JSON seperti biasa, tetapi:
  - Fokuskan pada materi yang sudah ada dari dosen
  - Tambahkan slot review + quiz untuk mengulang isi materi
  - Jika ada bagian materi yang kurang jelas, tandai sebagai 'perlu klarifikasi'
  - Jaga total durasi dan jadwal tetap realistis sesuai persona
  - Prioritaskan tujuan belajar dan kata kunci fokus jika tersedia
  - Sesuaikan gaya penyampaian dengan preferensi format & tingkat detail jika diberikan
  `;

    return await this.retryWithBackoff(async () => {
      const response = await this.callAI(
        SYSTEM_PROMPTS.studyPlanGenerator,
        userPrompt,
        { temperature: 0.55, max_tokens: 3500 }
      );

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse study plan from material");
    });
  }

  /**
   * Generate learning module content
   */
  async generateModuleContent(learningPersona, topic, moduleType = "core") {
    const userPrompt = `Learning Persona Lengkap:
- Gaya Belajar: ${learningPersona.gaya_belajar}
- Tingkat Detail: ${learningPersona.tingkat_detail}
- Learning Pace: ${learningPersona.learning_pace}
- Preferensi Waktu: ${learningPersona.preferensi_waktu}
- Preferensi Durasi: ${learningPersona.preferensi_durasi} menit
- Tipe Motivasi: ${learningPersona.motivasi_type}

Topik: ${topic}
Tipe Module: ${moduleType}

Buat konten pembelajaran yang SANGAT MENYESUAIKAN dengan gaya belajar user di atas. Jika user visual, buat konten yang kaya akan deskripsi visual dan analogi yang bisa "dilihat" dalam pikiran.`;

    return await this.retryWithBackoff(async () => {
      let content = await this.callAI(
        SYSTEM_PROMPTS.moduleContentGenerator,
        userPrompt,
        { temperature: 0.8, max_tokens: 6000 }
      );

      // Clean up the content to remove strange symbols
      content = this.cleanGeneratedContent(content);

      return content;
    });
  }

  /**
   * Generate quiz untuk module
   */
  async generateQuiz(topic, difficulty, questionCount = 35, learningPersona = null) {
    // Generate comprehensive quiz
    const actualQuestionCount = Math.min(questionCount, 10);
    
    const personaContext = learningPersona ? `

Learning Persona User:
- Gaya Belajar: ${learningPersona.gaya_belajar}
- Tingkat Detail: ${learningPersona.tingkat_detail}
- Learning Pace: ${learningPersona.learning_pace}

Sesuaikan format dan style quiz dengan gaya belajar user.` : '';

    const userPrompt = `${personaContext}

Topik: ${topic}
Tingkat Kesulitan: ${difficulty}
Jumlah Pertanyaan: ${actualQuestionCount}

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON - NO other text before or after
2. Buat pertanyaan yang DETAIL dan JELAS (3-5 kalimat per pertanyaan untuk konteks yang kaya)
3. Buat penjelasan yang LENGKAP dan MENDALAM (2-4 kalimat per explanation)
4. Generate EXACTLY ${actualQuestionCount} questions
5. Ensure ALL brackets are closed properly

{
  "questions": [
    {
      "question": "Pertanyaan singkat dalam bahasa Indonesia",
      "type": "mcq",
      "options": ["A. Pilihan A", "B. Pilihan B", "C. Pilihan C", "D. Pilihan D"],
      "correct_answer": "A. Pilihan A",
      "explanation": "Penjelasan singkat"
    }
  ]
}`;

    return await this.retryWithBackoff(async () => {
      const response = await this.callAI(
        SYSTEM_PROMPTS.quizGenerator,
        userPrompt,
        { temperature: 0.3, max_tokens: 8000 }
      );

      console.log('[Quiz] Raw response length:', response.length);
      
      // Aggressive cleanup: Remove ALL markdown-style wrappers
      let cleanedResponse = response.trim()
        .replace(/^```[\w]*\n?/gm, '')  // Remove opening ```
        .replace(/\n?```$/gm, '')       // Remove closing ```
        .replace(/^`/gm, '')            // Remove single backticks
        .replace(/`$/gm, '')            // Remove ending backticks
        .trim();

      console.log('[Quiz] After markdown cleanup length:', cleanedResponse.length);

      // Extract JSON using bracket-matching (more reliable than regex)
      const firstBrace = cleanedResponse.indexOf('{');
      const lastBrace = cleanedResponse.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        console.error('[Quiz] No JSON brackets found. Response:', cleanedResponse.substring(0, 300));
        throw new Error("Failed to parse quiz: no JSON found in response");
      }

      const jsonString = cleanedResponse.substring(firstBrace, lastBrace + 1);
      console.log('[Quiz] Extracted JSON length:', jsonString.length);

      try {
        const parsed = JSON.parse(jsonString);
        
        // Validate structure
        if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
          throw new Error("Quiz JSON missing or empty questions array");
        }
        
        console.log(`[Quiz] Successfully parsed ${parsed.questions.length} questions`);
        return parsed;
      } catch (parseError) {
        console.error('[Quiz] JSON parse error:', parseError.message);
        console.error('[Quiz] Problematic JSON:', jsonString.substring(0, 1000));
        throw new Error(`Failed to parse quiz: ${parseError.message}`);
      }
    });
  }

  /**
   * Generate quiz langsung dari materi dosen yang sudah diekstrak
   */
  async generateQuizFromMaterial(
    materialText,
    topic,
    difficulty = "sedang",
    questionCount = 15,
    learningPersona = null
  ) {
    // Generate comprehensive material quiz
    const actualQuestionCount = Math.min(questionCount, 8);
    const MAX_CHARS = 8000;
    const trimmedMaterial = (materialText || "").slice(0, MAX_CHARS);

    if (!trimmedMaterial.trim()) {
      throw new Error("MATERIAL_EMPTY");
    }

    const personaContext = learningPersona ? `

Learning Persona User:
- Gaya Belajar: ${learningPersona.gaya_belajar}
- Tingkat Detail: ${learningPersona.tingkat_detail}
- Learning Pace: ${learningPersona.learning_pace}

Sesuaikan gaya quiz dengan preferensi user.` : '';

    const userPrompt = `${personaContext}

Materi dari dosen (teks hasil ekstraksi, dipotong maks ${MAX_CHARS} karakter):
${trimmedMaterial}

Topik: ${topic}
Tingkat Kesulitan: ${difficulty}
Jumlah Pertanyaan: ${actualQuestionCount}

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON - NO other text
2. Buat pertanyaan yang DETAIL dan KONTEKSTUAL (3-5 kalimat per pertanyaan)
3. Buat penjelasan yang LENGKAP (2-4 kalimat per explanation)
4. Focus questions ONLY on the material above
5. Generate EXACTLY ${actualQuestionCount} questions
6. Ensure ALL brackets are closed properly

{
  "questions": [
    {
      "question": "Pertanyaan singkat dalam bahasa Indonesia",
      "type": "mcq",
      "options": ["A. Pilihan A", "B. Pilihan B", "C. Pilihan C", "D. Pilihan D"],
      "correct_answer": "A. Pilihan A",
      "explanation": "Penjelasan singkat"
    }
  ]
}`;

    return await this.retryWithBackoff(async () => {
      const response = await this.callAI(
        SYSTEM_PROMPTS.quizGenerator,
        userPrompt,
        { temperature: 0.3, max_tokens: 7000 }
      );

      console.log('[MaterialQuiz] Raw response length:', response.length);

      // Aggressive cleanup: Remove ALL markdown-style wrappers
      let cleanedResponse = response.trim()
        .replace(/^```[\w]*\n?/gm, '')  // Remove opening ```
        .replace(/\n?```$/gm, '')       // Remove closing ```
        .replace(/^`/gm, '')            // Remove single backticks
        .replace(/`$/gm, '')            // Remove ending backticks
        .trim();

      console.log('[MaterialQuiz] After cleanup length:', cleanedResponse.length);

      // Extract JSON using bracket-matching
      const firstBrace = cleanedResponse.indexOf('{');
      const lastBrace = cleanedResponse.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        console.error('[MaterialQuiz] No JSON brackets found. Response:', cleanedResponse.substring(0, 300));
        throw new Error("Failed to parse quiz from material: no JSON found");
      }

      const jsonString = cleanedResponse.substring(firstBrace, lastBrace + 1);
      console.log('[MaterialQuiz] Extracted JSON length:', jsonString.length);

      try {
        const parsed = JSON.parse(jsonString);
        
        if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
          throw new Error("Quiz JSON missing or empty questions array");
        }
        
        console.log(`[MaterialQuiz] Successfully parsed ${parsed.questions.length} questions`);
        return parsed;
      } catch (parseError) {
        console.error('[MaterialQuiz] JSON parse error:', parseError.message);
        console.error('[MaterialQuiz] Problematic JSON:', jsonString.substring(0, 1000));
        throw new Error(`Failed to parse quiz from material: ${parseError.message}`);
      }
    });
  }

  /**
   * AI Chat Tutor - conversational
   */
  async chatWithTutor(userMessage, learningPersona, conversationHistory = [], userTimeMeta = {}) {
    const historyContext =
      conversationHistory.length > 0
        ? `\n\nRiwayat percakapan:\n${conversationHistory
            .map((h) => `${h.role}: ${h.message}`)
            .join("\n")}`
        : "";

    let timeLabel = 'netral';
    let timeFormatted = null;
    if (userTimeMeta?.local_time_iso) {
      try {
        const dt = new Date(userTimeMeta.local_time_iso);
        if (!isNaN(dt.getTime())) {
          const hour = dt.getHours();
          const minute = dt.getMinutes();
          const pad = (n) => String(n).padStart(2, '0');
          timeFormatted = `${pad(hour)}:${pad(minute)}`;

          // Simple local-daypart mapping
          if (hour >= 5 && hour < 11) timeLabel = 'pagi';
          else if (hour >= 11 && hour < 15) timeLabel = 'siang';
          else if (hour >= 15 && hour < 18) timeLabel = 'sore';
          else if (hour >= 18 || hour < 5) timeLabel = 'malam';
        }
      } catch {
        // ignore parse errors, fallback to netral
      }
    }

    const currentTimeContext = timeFormatted
      ? `Waktu lokal user sekarang: ${timeFormatted} (${timeLabel}). Sesuaikan sapaan/ajakan dengan periode ini; jangan sebut waktu lain.`
      : 'Waktu lokal user tidak diketahui, gunakan sapaan netral tanpa menyebut waktu (pagi/siang/sore/malam).';

    const timezoneContext = userTimeMeta?.timezone
      ? `Zona waktu user: ${userTimeMeta.timezone}`
      : '';

    const offsetContext = Number.isFinite(userTimeMeta?.offset_minutes)
      ? `Offset menit terhadap UTC: ${userTimeMeta.offset_minutes}`
      : '';

    const userPrompt = `Learning Persona User:
- Gaya Belajar: ${learningPersona.gaya_belajar}
- Learning Pace: ${learningPersona.learning_pace}
- Fokus Level: ${learningPersona.fokus_level}
- Preferensi Waktu: ${learningPersona.preferensi_waktu}
- Preferensi Durasi: ${learningPersona.preferensi_durasi} menit
- Tingkat Detail: ${learningPersona.tingkat_detail}
- Tipe Motivasi: ${learningPersona.motivasi_type}
${historyContext}

${currentTimeContext}
${timezoneContext ? `\n${timezoneContext}` : ''}
${offsetContext ? `\n${offsetContext}` : ''}

User bertanya: ${userMessage}

Jawab dengan style yang sesuai dengan karaktermu sebagai AI Tutor dan sesuaikan dengan learning persona di atas.`;

    return await this.retryWithBackoff(async () => {
      let response = await this.callAI(
        SYSTEM_PROMPTS.aiTutor,
        userPrompt,
        { temperature: 0.72, max_tokens: 3500 }
      );

      // Clean up the response to remove strange symbols
      response = this.cleanGeneratedContent(response);

      return response;
    });
  }

  /**
   * Analyze progress dan generate insights
   */
  async analyzeProgress(learningPersona, progressData) {
    const userPrompt = `Learning Persona:
${JSON.stringify(learningPersona, null, 2)}

Data Progress (30 hari terakhir):
${JSON.stringify(progressData, null, 2)}

Analisis dan berikan insights dalam format JSON yang diminta.`;

    return await this.retryWithBackoff(async () => {
      const response = await this.callAI(
        SYSTEM_PROMPTS.progressAnalyzer,
        userPrompt
      );

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse progress analysis");
    });
  }

  /**
   * Explain a wrong quiz answer using module content context
   */
  async explainMistake(moduleContent, question, userAnswer, correctAnswer) {
    const userPrompt = `Materi Modul (ringkas):\n${moduleContent.slice(0, 3000)}\n\nPertanyaan: ${question}\nJawaban User: ${userAnswer}\nJawaban Benar: ${correctAnswer}\n\nJelaskan secara singkat dengan merujuk materi di atas.`;

    return await this.retryWithBackoff(async () => {
      let explanation = await this.callAI(
        SYSTEM_PROMPTS.mistakeExplainer,
        userPrompt,
        { temperature: 0.5, max_tokens: 800 }
      );
      return this.cleanGeneratedContent(explanation).trim();
    });
  }

  /**
   * Update learning persona based on new data
   */
  async updatePersona(currentPersona, newProgressData) {
    const systemPrompt = `Kamu adalah Learning Adaptation Specialist.
Berdasarkan persona saat ini dan data progress terbaru, tentukan apakah perlu ada adjustment pada learning persona.`;

    const userPrompt = `Persona Saat Ini:
${JSON.stringify(currentPersona, null, 2)}

Progress Data Terbaru:
${JSON.stringify(newProgressData, null, 2)}

Jika ada yang perlu di-adjust, berikan rekomendasi dalam format JSON:
{
  "needs_update": true/false,
  "suggested_changes": {
    "field_name": "new_value",
    ...
  },
  "reason": "alasan kenapa perlu di-update"
}`;

    return await this.retryWithBackoff(async () => {
      const response = await this.callAI(systemPrompt, userPrompt);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { needs_update: false };
    });
  }

  /**
   * Generate motivational message
   */
  async generateMotivation(learningPersona, progressSummary) {
    const systemPrompt = `Buat pesan motivasi yang personal dan genuine untuk user berdasarkan learning persona dan progress summary mereka.`;

    const userPrompt = `Learning Persona:
- Motivasi Type: ${learningPersona.motivasi_type}
- Fokus Level: ${learningPersona.fokus_level}

Progress Summary:
${progressSummary}

Pesan harus:
1. Singkat (2-3 kalimat)
2. Spesifik dan personal (bukan generic)
3. Positif tapi tidak berlebihan
4. Actionable (ada next step yang jelas)

Jawab langsung dengan pesan motivasi, tanpa format JSON.`;

    return await this.retryWithBackoff(async () => {
      let response = await this.callAI(systemPrompt, userPrompt);

      // Clean up the response to remove strange symbols
      response = this.cleanGeneratedContent(response);

      return response;
    });
  }

  /**
   * Generate quiz questions
   */
  /**
   * Clean generated content to remove strange symbols and ensure readability
   */
  cleanGeneratedContent(content) {
    // For HTML content, we need to be more careful
    if (content.includes('<') && content.includes('>')) {
      // This appears to be HTML content, clean more carefully
      // First, remove any quiz-related content
      content = content
        .replace(/<h[1-6][^>]*>.*?(quiz|pertanyaan|jawaban|test|soal).*?<\/h[1-6]>/gi, '') // Remove quiz headings
        .replace(/<div[^>]*>.*?(quiz|pertanyaan|jawaban|test|soal).*?<\/div>/gi, '') // Remove quiz divs
        .replace(/<p[^>]*>.*?(quiz|pertanyaan|jawaban|test|soal).*?<\/p>/gi, '') // Remove quiz paragraphs
        .replace(/<ul[^>]*>.*?(quiz|pertanyaan|jawaban|test|soal).*?<\/ul>/gi, '') // Remove quiz lists
        .replace(/<ol[^>]*>.*?(quiz|pertanyaan|jawaban|test|soal).*?<\/ol>/gi, ''); // Remove quiz ordered lists

      // Replace common problematic characters but preserve HTML structure
      content = content
        .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '') // Remove zero-width chars
        .replace(/[™®©♪♫☆★♦♣♠♥]/g, '') // Remove some symbols
        .replace(/ {2,}/g, ' ') // Normalize spaces
        .replace(/\n{3,}/g, '\n\n'); // Normalize line breaks

      // Remove only truly problematic unicode in text content, but preserve HTML
      // This is a simplified approach - in production you might want a proper HTML parser
      content = content.replace(/>([^<]*)>/g, (match, textContent) => {
        // Clean text content between tags
        const cleaned = textContent.replace(/[^\x20-\x7E\n\r\t🎯📝💡🔑📚✨🎨🧠💭]/g, '');
        return '>' + cleaned + '>';
      });

      return content.trim();
    } else {
      // Fallback for non-HTML content - also remove quiz content
      return content
        .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
        .replace(/ {2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[^\x20-\x7E\n\r\t]/g, '')
        .trim();
    }
  }
}

export default new GeminiAgent();
