import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs-extra";
import fetch from "node-fetch";
import { uploadToCloudinary } from "./cloudinaryService.js";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Merge video + audio URLs and upload merged video to Cloudinary
 * @param {string} videoUrl - Public video URL
 * @param {string} audioUrl - Public audio URL
 * @returns {Promise<string>} - Cloudinary URL of merged video
 */
export async function mergeAudioVideo(videoUrl, audioUrl) {
  const tempDir = path.resolve("generated/temp");
  await fs.ensureDir(tempDir);

  const videoFile = path.join(tempDir, `video-${Date.now()}.mp4`);
  const audioFile = path.join(tempDir, `audio-${Date.now()}.mp3`);
  const outputFile = path.join(tempDir, `merged-${Date.now()}.mp4`);

  try {
    // 1️⃣ Download video
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.statusText}`);
    const videoBuffer = await videoRes.arrayBuffer();
    await fs.writeFile(videoFile, Buffer.from(videoBuffer));

    // 2️⃣ Download audio
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) throw new Error(`Failed to download audio: ${audioRes.statusText}`);
    const audioBuffer = await audioRes.arrayBuffer();
    await fs.writeFile(audioFile, Buffer.from(audioBuffer));

    // 3️⃣ Merge
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoFile)
        .input(audioFile)
        .outputOptions(["-c:v copy", "-c:a aac", "-shortest"])
        .save(outputFile)
        .on("end", resolve)
        .on("error", reject);
    });

    console.log("✅ Merging complete:", outputFile);

    // 4️⃣ Upload merged video
    const mergedUrl = await uploadToCloudinary(outputFile, "afrovids/videos");
    console.log("☁️ Uploaded merged video:", mergedUrl);

    // 5️⃣ Cleanup
    await fs.remove(videoFile);
    await fs.remove(audioFile);
    await fs.remove(outputFile);

    return mergedUrl;
  } catch (err) {
    console.error("❌ Merge failed:", err);
    throw err;
  }
}
