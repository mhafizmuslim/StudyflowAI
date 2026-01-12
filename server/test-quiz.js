import geminiAgent from './services/geminiAgent.js';

async function testQuizGeneration() {
  try {
    console.log('Testing quiz generation with 35 questions...');

    const quiz = await geminiAgent.generateQuiz(
      'Machine Learning Fundamentals',
      'sedang',
      35,
      {
        gaya_belajar: 'visual',
        tingkat_detail: 'detail',
        learning_pace: 'normal',
        fokus_level: 'tinggi'
      }
    );

    console.log(`Generated ${quiz.length} questions`);
    console.log('First question:', JSON.stringify(quiz[0], null, 2));
    console.log('Last question:', JSON.stringify(quiz[quiz.length - 1], null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testQuizGeneration();