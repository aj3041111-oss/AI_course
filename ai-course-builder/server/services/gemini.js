/**
 * Stage 2: Generate detailed lesson content and multiple-choice quiz questions for a module.
 */
export async function generateLessonContent(moduleTitle, learningObjective, targetAudience) {
  const prompt = `Write a comprehensive, detailed educational lesson for the module titled: "${moduleTitle}".
  Learning Objective: "${learningObjective}".
  Target Audience: "${targetAudience}".
  Provide the explanation in well-structured Markdown format, followed by 3 multiple-choice assessment questions with options and the correct answer.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lessonTitle: { type: Type.STRING },
            markdownContent: { type: Type.STRING, description: 'Full lesson explanation formatted in Markdown' },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 options'
                  },
                  correctAnswer: { type: Type.STRING, description: 'The exact string of the correct option' }
                },
                required: ['question', 'options', 'correctAnswer']
              }
            }
          },
          required: ['lessonTitle', 'markdownContent', 'quiz']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error generating lesson content:', error);
    throw new Error('Failed to generate lesson content from AI.');
  }
}