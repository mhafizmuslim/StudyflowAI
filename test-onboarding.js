import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { dbHelpers } from './server/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function testOnboardingFlow() {
  console.log('🧪 Testing Onboarding Flow with LiteLLM...\n');
  
  try {
    // Initialize OpenAI client
    const client = new OpenAI({
      baseURL: process.env.LITELLM_BASE_URL,
      apiKey: process.env.LITELLM_API_KEY,
    });

    console.log('📝 Step 1: Testing AI analyzeLearningStyle...');
    
    // Mock onboarding data
    const mockOnboardingData = {
      preferred_learning_style: 'visual',
      focus_level: 'tinggi',
      learning_time: 'pagi',
      study_duration: 45,
      detail_preference: 'detail',
      motivation_type: 'achievement',
      learning_pace: 'normal'
    };

    console.log('   Testing with mock data:', mockOnboardingData);

    // Test AI analysis using OpenAI format
    const response = await client.chat.completions.create({
      model: 'gemini/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `Kamu adalah Learning Style Analyst yang ahli dalam menganalisis gaya belajar seseorang.
Berdasarkan data yang diberikan, identifikasi gaya belajar dan output dalam format JSON dengan struktur:
{
  "gaya_belajar": "...",
  "fokus_level": "...",
  "preferensi_waktu": "...",
  "preferensi_durasi": ...,
  "tingkat_detail": "...",
  "motivasi_type": "...",
  "learning_pace": "...",
  "analisis": "penjelasan singkat",
  "rekomendasi": ["rekomendasi 1", "rekomendasi 2"]
}`
        },
        {
          role: 'user',
          content: `Data dari user:\n${JSON.stringify(mockOnboardingData, null, 2)}\n\nAnalisis dan berikan output dalam format JSON yang diminta.`
        }
      ],
      temperature: 0.7,
      top_p: 0.9,
    });

    console.log('✅ AI Response received');
    
    const aiResponse = response.choices[0].message.content;
    console.log('💬 AI Analysis:\n', aiResponse);

    // Try parsing JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log('\n✅ JSON parsed successfully:');
      console.log('   - Gaya Belajar:', analysis.gaya_belajar);
      console.log('   - Fokus Level:', analysis.fokus_level);
      console.log('   - Learning Pace:', analysis.learning_pace);
    } else {
      console.log('\n⚠️ Could not extract JSON from response');
    }

    console.log('\n✅ Onboarding flow test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error testing onboarding:');
    console.error('   Error:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    process.exit(1);
  }
}

testOnboardingFlow();
