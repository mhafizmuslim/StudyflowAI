// PATCH for generateQuiz method - lines 527-610
// Replace actualQuestionCount = Math.min(questionCount, 5); with:
    const actualQuestionCount = 3; // Fixed to 3 for reliability

// Replace the userPrompt template starting at line 542 with:
    const userPrompt = `${personaContext}

Topik: ${topic}
Tingkat Kesulitan: ${difficulty}
Jumlah Pertanyaan: ${actualQuestionCount}

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON - NO other text before or after
2. Keep questions SHORT (max 2 sentences)
3. Keep explanations SHORT (max 1 sentence)
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

// Replace max_tokens: 2500 with:
        { temperature: 0.3, max_tokens: 4000 }
