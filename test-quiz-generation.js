import fetch from 'node-fetch';

async function testQuizGeneration() {
  console.log('🧪 Testing quiz generation...\n');

  try {
    // Simulate request to generate module content with quiz
    const response = await fetch('http://localhost:3001/study/modules/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topik: 'Pengenalan Konsep Dasar',
        tingkat_kesulitan: 'sedang',
        userTimeMeta: {
          local_time_iso: new Date().toISOString(),
          timezone: 'Asia/Jakarta'
        },
        learningPersona: {
          gaya_belajar: 'visual',
          tingkat_detail: 'sedang',
          learning_pace: 'normal'
        }
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok && data.quiz) {
      console.log('\n✅ Quiz generated successfully!');
      console.log(`📊 Number of questions: ${data.quiz.questions?.length || 0}`);
      if (data.quiz.questions && data.quiz.questions.length > 0) {
        console.log(`\n📝 First question:\n${data.quiz.questions[0].question}`);
      }
    } else {
      console.log('\n❌ Quiz generation failed!');
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testQuizGeneration();
