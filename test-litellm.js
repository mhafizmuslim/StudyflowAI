import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function testLiteLLM() {
  console.log('🧪 Testing LiteLLM Configuration...\n');
  
  const baseURL = process.env.LITELLM_BASE_URL;
  const apiKey = process.env.LITELLM_API_KEY;
  
  console.log('📋 Configuration:');
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   API Key: ${apiKey ? '✓ Set' : '✗ Missing'}\n`);
  
  if (!baseURL || !apiKey) {
    console.error('❌ Error: LITELLM_BASE_URL or LITELLM_API_KEY not configured!');
    process.exit(1);
  }
  
  try {
    console.log('🔗 Connecting to LiteLLM...');
    
    const client = new OpenAI({
      baseURL: baseURL,
      apiKey: apiKey,
    });
    
    console.log('✓ Client initialized\n');
    
    console.log('📤 Sending test request to LiteLLM...');
    const response = await client.chat.completions.create({
      model: 'gemini/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: 'Hello! Just a quick test. Reply with one word.',
        },
      ],
      temperature: 0.7,
      top_p: 0.9,
    });
    
    console.log('✅ Success! Response received:\n');
    console.log('📝 Model:', response.model);
    console.log('💬 Message:', response.choices[0].message.content);
    console.log('⚡ Tokens used:', response.usage.total_tokens);
    console.log('\n✅ LiteLLM is working correctly!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error testing LiteLLM:');
    console.error('   Error:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    process.exit(1);
  }
}

testLiteLLM();
