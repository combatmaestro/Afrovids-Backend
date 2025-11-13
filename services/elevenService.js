import fs from "fs-extra";
import path from "path";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";


console.log("🔑 Using ElevenLabs API Key:", process.env.ELEVENLABS_API_KEY);
const client = new ElevenLabsClient({
  apiKey: "sk_2622b25a607ce1749c4777432ee3ddce073e27b52a1389c8"
  //  process.env.ELEVENLABS_API_KEY,
});

const voiceMap = {
  sw: "TxGEqnHWrfWFTfGW9XjX",
  yo: "TxGEqnHWrfWFTfGW9XjX",
  ig: "TxGEqnHWrfWFTfGW9XjX",
  ha: "TxGEqnHWrfWFTfGW9XjX",
  am: "TxGEqnHWrfWFTfGW9XjX",
  so: "TxGEqnHWrfWFTfGW9XjX",
  zu: "TxGEqnHWrfWFTfGW9XjX",
  sn: "TxGEqnHWrfWFTfGW9XjX",
  wo: "TxGEqnHWrfWFTfGW9XjX",
  tw: "TxGEqnHWrfWFTfGW9XjX",
  jam: "21m00Tcm4TlvDq8ikWAM",
  ht: "EXAVITQu4vr4xnSDxMaL",
  lc: "EXAVITQu4vr4xnSDxMaL",
  dm: "EXAVITQu4vr4xnSDxMaL",
  frc: "EXAVITQu4vr4xnSDxMaL",
  "es-cu": "ErXwobaYiN019PkySvjV",
  "es-pr": "ErXwobaYiN019PkySvjV",
  "es-do": "ErXwobaYiN019PkySvjV",
  en: "21m00Tcm4TlvDq8ikWAM",
};

export async function textToSpeechElevenLabs(text, language ) {
  console.log(language)
  const startTime = Date.now();
  const voiceId = voiceMap[language] ;

  console.log(`\n🎙️ [TTS START] Language: ${language} | Voice ID: ${voiceId}`);

  try {
    // 🔹 The SDK now returns a Node.js Readable stream, not a Response
    const response = await client.textToSpeech.convert(voiceId, {
      text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
      language_code: language,
    });

    // Convert stream to Buffer
    const chunks = [];
    for await (const chunk of response) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Save the file
    const outDir = path.resolve("generated/audio");
    await fs.ensureDir(outDir);

    const filePath = path.join(outDir, `tts-${Date.now()}.mp3`);
    await fs.writeFile(filePath, audioBuffer);

    console.log(`✅ [TTS COMPLETE] Audio saved: ${filePath}`);
    console.log(`⏱️ Time taken: ${(Date.now() - startTime) / 1000}s`);

    return filePath;
  } catch (err) {
    console.error("❌ ElevenLabs SDK TTS failed:", err);
    console.log("🔑 Using ElevenLabs API Key:", process.env.ELEVENLABS_API_KEY);
    console.error("🧠 Context:", {
      language,
      voiceId,
      textPreview: text.slice(0, 100),
    });
    throw new Error("ElevenLabs TTS failed");
  }
}
