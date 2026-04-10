import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getAIAdvice = async (scanData, businessProfile) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are an expert Cybersecurity Consultant for Small Businesses.
    Business: ${businessProfile.name}
    Industry: ${businessProfile.industry}
    Security Scan Results for ${scanData.domain}:
    Score: ${scanData.score}/100
    Findings: ${JSON.stringify(scanData.findings)}

    Based on this, generate a professional but accessible security report.
    Provide:
    1. A "Bottom Line" summary (2 sentences, no jargon).
    2. A "Threat Scenario": How a hacker might target a business like this using these vulnerabilities.
    3. "Top 3 Action Items": Precise, numbered, and prioritized.
    4. A "30-Day Roadmap": Simple steps to improve.

    Use Markdown formatting.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return "AI Advisor is temporarily offline. Please follow the standard security recommendations below.";
  }
};
