import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generatePhishingQuiz = async (industry) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Generate a 3-question phishing awareness quiz for a small business in the ${industry} industry.
    Each question should:
    1. Describe a realistic email/SMS scenario.
    2. Provide 3 multiple-choice options.
    3. Specify the correct answer and a brief explanation why.

    Return the result in valid JSON format only:
    [
      {
        "id": 1,
        "scenario": "...",
        "options": ["A", "B", "C"],
        "correct": "...",
        "explanation": "..."
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Basic cleanup in case AI adds markdown blocks
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Phishing Quiz Error:', error);
    return [
      {
        "id": 1,
        "scenario": "You receive an email from 'IT Support' asking to verify your password immediately due to a 'security breach'.",
        "options": ["Click the link", "Report to supervisor", "Reply with password"],
        "correct": "Report to supervisor",
        "explanation": "Legitimate IT support will never ask for your password via email."
      }
    ];
  }
};
