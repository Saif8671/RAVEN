import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are RAVEN AI, a Senior Lead Cybersecurity Incident Responder. 
Your role is to assist users during active cyber incidents, providing clear, actionable, and rapid advice. 
Always maintain a professional, calm, and authoritative tone.
Prioritize steps that stop the bleeding, preserve evidence, and ensure safety.
Use Markdown for clear formatting, such as bullet points for lists and bold text for emphasis.
If the user shares symptoms of an incident (e.g., ransomware, phishing), provide immediate containment steps before anything else.`;

export async function chatWithGroq(message, history = []) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured on the server.");
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map(msg => ({ 
        role: msg.role === 'ai' ? 'assistant' : 'user', 
        content: msg.content 
      })),
      { role: "user", content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 1024,
    });

    return chatCompletion.choices[0]?.message?.content || "I am unable to provide a response at this time.";
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error(error.message || "Failed to communicate with AI service.");
  }
}
