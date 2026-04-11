import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env.js';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getAIAdvice = async (scanData, businessProfile = {}) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are an expert Cybersecurity Consultant for Small Businesses.
    Business: ${businessProfile.name || 'Small Business'}
    Security Scan Results for ${scanData.domain}:
    Score: ${scanData.score}/100
    Findings: ${JSON.stringify(scanData.findings)}

    Generate a structured JSON response (no markdown blocks around it) with the following keys:
    1. "summary_message": A "Bottom Line" summary (2 sentences, no jargon).
    2. "attackStory": A narrative of how a hacker might target this specific business using these vulnerabilities.
    3. "quickWins": Array of 3 precise, high-impact action items.
    4. "fixes": Array of objects { "issue": "Name", "plainEnglish": "What it is", "steps": ["Step 1", "Step 2"] }.
    5. "incidentPlaybook": Array of 4 steps to take if breached.

    JSON ONLY.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return {
      summary_message: "AI Advisor is temporarily offline. Focus on fixing the SSL and Header findings.",
      attackStory: "Scan results indicate technical vulnerabilities that could be exploited by automated scripts.",
      quickWins: ["Enable HSTS", "Add CSP Headers", "Verify SSL Certificate"],
      fixes: [],
      incidentPlaybook: ["Disconnect affected systems", "Reset admin passwords", "Notify IT support"]
    };
  }
};
