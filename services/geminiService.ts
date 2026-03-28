import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getRoyalComment = async (isCorrect: boolean, number: number): Promise<string> => {
  if (!apiKey) return ""; // Fail silently if no key

  try {
    const prompt = isCorrect 
      ? `Give a very short, one-sentence fun fact or encouraging compliment in Georgian for a kid named Thoma who just calculated the number ${number} correctly. Pretend you are a wise Royal Advisor.`
      : `Give a very short, one-sentence encouraging message in Georgian for a kid named Thoma who got a math problem wrong. Tell him to try again like a brave king.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini error:", error);
    return "";
  }
};
