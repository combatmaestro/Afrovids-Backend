// services/runwayService.js
import RunwayML, { TaskFailedError } from "@runwayml/sdk";

// Automatically uses process.env.RUNWAYML_API_SECRET
const client = new RunwayML();

/**
 * Generate a short AI video using RunwayML
 * @param {string} promptText - Text or description for video
 * @param {object} options - Additional options (duration, ratio)
 * @returns {Promise<string>} - Video URL
 */
export async function generateRunwayVideo(promptText, options = {}) {
  try {
    console.log("🎬 [Runway] Starting video generation...");

    const task = await client.textToVideo
      .create({
        model: "veo3", // ✅ or "gen3" / "veo3.1" depending on your plan
        promptText,
        ratio: options.ratio || "1280:720",
        duration: options.duration || 4, // seconds
      })
      .waitForTaskOutput();
       
   
    console.log(task)
    const videoUrl = task.output?.[0]?.uri;
    if (!videoUrl) throw new Error("No video URL returned from Runway");

    console.log("✅ [Runway] Video generated:", videoUrl);
    return videoUrl;
  } catch (error) {
    if (error instanceof TaskFailedError) {
      console.error("❌ Runway video generation failed:", error.taskDetails);
      throw new Error("Runway video generation failed");
    }
    console.error("❌ Unexpected Runway error:", error);
    throw error;
  }
}
