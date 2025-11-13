import path from "path";
import fs from "fs-extra";
import { generateScript } from "../services/openaiService.js";
import { textToSpeechElevenLabs } from "../services/elevenService.js";
import { generateLeonardoVideo } from "../services/leonardoService.js";
import { mergeAudioVideo } from "../services/mergeService.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinaryService.js";

export async function generateHandler(req, res) {

  try {
    const { topic, language , duration = 4, clientId } = req.body;
    
    if (!topic) return res.status(400).json({ error: "Topic required" });

    const io = req.app.get("io");
    // const clients = req.app.get("clients");
    const socketId = clientId 

    // 1️⃣ Generate script
    if (socketId) io.to(socketId).emit("status", "🧠 Generating script...");
    const script = await generateScript(topic, duration, language);
    console.log("✅ Script generated:", script);

    // Respond immediately with script
    res.status(200).json({
      message: "Script generated successfully",
      script,
      status: "processing",
    });

    process.nextTick(async () => {
      try {
        // 2️⃣ Generate audio
        if (socketId) io.to(socketId).emit("status", "🎙️ Generating audio...");
        const audioPath = await textToSpeechElevenLabs(script, language);

        // Upload audio to Cloudinary temporarily
        const audioUrl = await uploadToCloudinary(audioPath, "afrovids/audio");
        if (socketId) io.to(socketId).emit("update", { step: "audio", data: audioUrl });

        // 3️⃣ Generate video
        if (socketId) io.to(socketId).emit("status", "🎬 Generating video...");
        const videoUrl = await generateLeonardoVideo(script, duration);
        if (socketId) io.to(socketId).emit("update", { step: "video", data: videoUrl });

        // 4️⃣ Merge audio + video using local audio path
        if (socketId) io.to(socketId).emit("status", "🎞️ Merging audio + video...");
        const outputDir = path.resolve("generated/temp");
        await fs.ensureDir(outputDir);

        const mergedFilePath = await mergeAudioVideo(audioUrl, videoUrl, outputDir);

        // 5️⃣ Upload merged video to Cloudinary
        const mergedUrl = await uploadToCloudinary(mergedFilePath, "afrovids/videos");
        if (socketId) io.to(socketId).emit("update", { step: "merged", data: mergedUrl });

        // 6️⃣ Delete temporary audio from Cloudinary
        await deleteFromCloudinary(audioUrl);

        // 7️⃣ Cleanup local files
        await fs.remove(audioPath);
        await fs.remove(mergedFilePath);

        // 8️⃣ Complete
        if (socketId) io.to(socketId).emit("complete", {
          script,
          videoUrl,
          mergedUrl,
        });
        console.log("🎉 Generation complete:", mergedUrl);
      } catch (err) {
        console.error("Background generation failed:", err);
        if (socketId) io.to(socketId).emit("error", { message: err.message });
      }
    });
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}
