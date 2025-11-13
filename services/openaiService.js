import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a concise script for TTS (under 1000 characters)
 * @param {string} topic - The topic of the video
 * @param {number} duration - Estimated duration in seconds
 * @param {string} language - 'en', 'sw', etc.
 * @returns {Promise<string>} - Short script
 */
export async function generateScript(topic, duration = 5, language = "en") {
  try {
    const prompt = `
Write a concise, single-narrator video script about "${topic}".
- Keep it under 1000 characters
- Simple, easy-to-read language
- Do NOT include multiple characters or cinematic directions
- Make it engaging but short
- Output only the script text
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300, // roughly 1000 characters
    });

    const script = response.choices[0].message.content.trim();
    return script;
  } catch (err) {
    console.error("❌ Error generating script:", err);
    throw err;
  }
}
