
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Major } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateRecommendation(user: UserProfile, favorites: Major[], quizAnswers?: string[]) {
  const actualScore = user.scores.total > 0 ? user.scores.total : 650;
  const isEstimated = user.scores.total === 0;

  // Simple weighted bias calc
  let biasScore = 0; 
  const scienceSubjects = ['math', 'physics', 'chemistry', 'physical'];
  const artsSubjects = ['chinese', 'english', 'history', 'politics'];

  Object.entries(user.subjectLikes || {}).forEach(([sub, type]) => {
      if (type === 'like') {
          if (scienceSubjects.includes(sub)) biasScore += 1;
          if (artsSubjects.includes(sub)) biasScore -= 1;
      } else if (type === 'dislike') {
          if (scienceSubjects.includes(sub)) biasScore -= 1;
          if (artsSubjects.includes(sub)) biasScore += 1;
      }
  });

  let biasDescription = "均衡";
  if (biasScore >= 2) biasDescription = "明显偏理";
  if (biasScore <= -2) biasDescription = "明显偏文";

  // Construct Quiz Data String for AI
  const quizContext = quizAnswers && quizAnswers.length > 0
    ? `Quiz Responses (Questions 1-8 are Personality/MBTI related, 9-20 are Vocational/Holland related):\n${quizAnswers.map((a, i) => `Q${i+1}: ${a}`).join('\n')}`
    : 'No quiz taken.';

  const prompt = `
    Role: Senior Shanghai Zhongben Admissions Consultant.
    Task: Analyze the student profile and return a JSON object ONLY.

    Profile:
    - Total Score: ${actualScore} ${isEstimated ? '(Estimated)' : ''}
    - Arts/Science Bias: ${biasDescription} (Apply ~5% weight adjustment)
    - Quiz Data: ${quizContext}
    - Favorites: ${favorites.length > 0 ? favorites.map(m => m.name).join(', ') : 'None'}

    Requirements:
    1. Analyze the 20 quiz questions to determine the student's Personality (MBTI-like traits) and Vocational Interests (Holland Code/RIASEC).
    2. Generate "radarData" specifically for the RIASEC model (Realistic, Investigative, Artistic, Social, Enterprising, Conventional). Values 0-100.
    3. Provide a career planning advice section.
    4. Recommend 3 specific majors.

    Output Format: JSON ONLY. No markdown fencing.
    Structure:
    {
      "personalitySummary": "Short analysis of personality & vocational interests (max 60 words).",
      "radarData": [
        { "subject": "R 现实型", "A": 85 },
        { "subject": "I 研究型", "A": 60 },
        { "subject": "A 艺术型", "A": 70 },
        { "subject": "S 社会型", "A": 40 },
        { "subject": "E 企业型", "A": 75 },
        { "subject": "C 常规型", "A": 50 }
      ],
      "careerPlanning": "Detailed career advice and study path analysis (max 100 words).",
      "recommendations": "3 specific major recommendations with reasons."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
