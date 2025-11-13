import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a concise script for TTS (under 1000 characters)
 * Automatically translates the final output into the specified language
 * 
 * @param {string} topic - The topic of the video
 * @param {number} duration - Estimated duration in seconds
 * @param {string} language - ISO 639-1 language code ('en', 'sw', 'ar', etc.)
 * @returns {Promise<string>} - Translated short script
 */
export async function generateScript(topic, duration = 5, language = "en") {
  try {
    const prompt = `
Write a concise, single-narrator video script about "${topic}".
- Keep it under 1000 characters
- Use simple, easy-to-read language
- Make it engaging but short
- Output only the script text
Then translate the entire script into the language represented by ISO code "${language}".
If the code is "en", keep it in English.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    });

    const script = response.choices[0].message.content.trim();
    return script;
  } catch (err) {
    console.error("❌ Error generating script:", err);
    throw err;
  }
}
