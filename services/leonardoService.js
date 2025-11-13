

import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const BASE_URL = "https://cloud.leonardo.ai/api/rest/v1";
const AUTHORIZATION = `Bearer ${process.env.LEONARDO_API_KEY}`;

const HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: AUTHORIZATION,
};

/**
 * Polls Leonardo API until the video generation completes
 * @param {string} generationId
 * @returns {Promise<string>} - The final motion video URL
 */
async function pollLeonardoStatus(generationId) {
  console.log(`📡 Polling Leonardo status for generationId: ${generationId}`);

  const maxAttempts = 20;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const statusRes = await fetch(`${BASE_URL}/generations/${generationId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: AUTHORIZATION,
        },
      });

      const statusData = await statusRes.json();
      const gen = statusData?.generations_by_pk;

      console.log(`🌀 Attempt ${attempt}: status -> ${gen?.status}`);

      // ✅ When video is complete
      const motionVideo =
        gen?.generated_images?.[0]?.motionMP4URL ||
        gen?.generated_videos?.[0]?.url;

      if (motionVideo) {
        console.log("✅ Leonardo video is ready:", motionVideo);
        return motionVideo;
      }

      console.log("⏳ Still processing... waiting 10 seconds before next check");
      await new Promise((r) => setTimeout(r, 10000)); // wait 10s before retry
    } catch (err) {
      console.error(`❌ Error checking generation status (attempt ${attempt}):`, err);
    }
  }

  throw new Error("❌ Leonardo video not ready after max attempts");
}

/**
 * Generate a Leonardo AI video from text using Kling 2.5 Turbo (VEO3 model)
 * @param {string} prompt - Text prompt for video generation
 * @param {number} duration - Duration in seconds
 * @returns {Promise<string>} - Final video URL
 */
export async function generateLeonardoVideo(prompt, duration = 4) {
  try {
    console.log("🎬 Sending Leonardo text-to-video generation request...");

    // 1️⃣ Send POST request
    const response = await fetch(`${BASE_URL}/generations-text-to-video`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        prompt,
        height: 480,
        width: 832,
        resolution: "RESOLUTION_480",
        duration,
        // model: "MOTION2FAST",
        isPublic: false,
        promptEnhance: true,
        frameInterpolation: true,
        elements: [
                {
                    "akUUID": "ece8c6a9-3deb-430e-8c93-4d5061b6adbf",
                    "weight":1
                }
            ]

      }),
    });

    const data = await response.json();
    console.log("🪄 Leonardo API response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("❌ Leonardo API error:", data);
      throw new Error(`Leonardo API error: ${JSON.stringify(data)}`);
    }

    // ✅ Extract generationId
    const generationId =
      data?.motionVideoGenerationJob?.generationId ||
      data?.sdGenerationJob?.generationId ||
      data?.generationId;

    if (!generationId) {
      console.error("❌ Missing generationId in response:", data);
      throw new Error("No generationId returned from Leonardo API");
    }

    console.log("✅ Leonardo generation started:", generationId);

    // 2️⃣ Poll until video is ready
    const videoUrl = await pollLeonardoStatus(generationId);
    console.log("🎥 Final video URL:", videoUrl);

    return videoUrl;
  } catch (err) {
    console.error("❌ Leonardo video generation failed:", err);
    throw new Error("Failed to generate Leonardo AI video");
  }
}








// import dotenv from "dotenv";
// import fetch from "node-fetch";

// dotenv.config();

// const BASE_URL = "https://cloud.leonardo.ai/api/rest/v1";
// const AUTHORIZATION = `Bearer ${process.env.LEONARDO_API_KEY}`;

// const HEADERS = {
//   accept: "application/json",
//   "content-type": "application/json",
//   authorization: AUTHORIZATION,
// };

// /**
//  * Generate a Leonardo AI video from text (KLING2_5 Turbo model)
//  * @param {string} prompt - The video generation prompt
//  * @param {number} duration - Duration in seconds (4, 6, or 8)
//  * @returns {Promise<string>} - URL of the generated video
//  */
// export async function generateLeonardoVideo(prompt, duration = 4) {
//   try {
//     console.log("🎬 Sending Leonardo text-to-video generation request (KLING2_5)...");

//     // 1️⃣ Create generation request
//     const response = await fetch(`${BASE_URL}/generations-text-to-video`, {
//       method: "POST",
//       headers: HEADERS,
//       body: JSON.stringify({
//         prompt,
//         height: 480,
//         width: 832,
//         resolution: "RESOLUTION_480",
//         duration,
//         // model: "MOTION2FAST",
//         isPublic: false,
//         promptEnhance: true,
//         frameInterpolation: true,
//         elements: [
//                 {
//                     "akUUID": "ece8c6a9-3deb-430e-8c93-4d5061b6adbf",
//                     "weight":1
//                 }
//             ]

//       }),
//     });

//     const data = await response.json();
//     console.log("Leonardo response data:", data);

//     if (!response.ok) {
//       console.error("❌ Leonardo API error:", data);
//       throw new Error(`Leonardo API error: ${JSON.stringify(data)}`);
//     }

//     // ✅ Extract generationId
//     const generationId =
//       data?.motionVideoGenerationJob?.generationId ||
//       data?.sdGenerationJob?.generationId ||
//       data?.generationId;

//     if (!generationId) {
//       console.error("❌ Missing generationId in response:", data);
//       throw new Error("No generationId returned from Leonardo API");
//     }

//     console.log(`✅ Leonardo generation started: ${generationId}`);

//     // 2️⃣ Poll for completion
//     console.log("⌛ Waiting for Leonardo to generate the video...");
//     const maxAttempts = 30; // 5 minutes max
//     let videoUrl = null;

//     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//       const statusRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/b2cea518-c22d-4004-ad94-b14ee88d3a13`, {
//         method: "GET",
//         headers: {
//           accept: "application/json",
//           authorization: AUTHORIZATION,
//         },
//       });

//       const statusData = await statusRes.json();

//       if (attempt === 1) {
//         console.log("🔍 First status response:", JSON.stringify(statusData, null, 2));
//       }

//       const gen = statusData?.generations_by_pk;

//       if (gen?.generated_videos?.length) {
//         videoUrl = gen.generated_videos[0].url;
//         console.log(`🎥 Video URL found on attempt ${attempt}: ${videoUrl}`);
//         break;
//       }

//       console.log(`⏳ Attempt ${attempt}/${maxAttempts} — still processing...`);
//       await new Promise((r) => setTimeout(r, 10000)); // wait 10 seconds
//     }

//     if (!videoUrl) throw new Error("Leonardo video not ready in time");

//     console.log("✅ Leonardo video ready:", videoUrl);
//     return videoUrl;
//   } catch (err) {
//     console.error("❌ Leonardo video generation failed:", err);
//     throw new Error("Failed to generate Leonardo AI video");
//   }
// }


// export async function get() {
//   const generationId = "b2cea518-c22d-4004-ad94-b14ee88d3a13";
//   const maxAttempts = 10;

//   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//     try {
//       const statusRes = await fetch(
//         `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
//         {
//           method: "GET",
//           headers: {
//             accept: "application/json",
//             authorization: AUTHORIZATION,
//           },
//         }
//       );

//       const statusData = await statusRes.json();

//       console.log(`🌀 Attempt ${attempt}:`, JSON.stringify(statusData, null, 2));

//       // ✅ Check if video is ready
//       const gen = statusData?.generations_by_pk;
//       if (gen?.generated_videos?.length) {
//         console.log("✅ Video ready at:", gen.generated_videos[0].url);
//         return gen.generated_videos[0].url;
//       }

//       console.log("⏳ Still processing, waiting 10 seconds...");
//       await new Promise((r) => setTimeout(r, 10000));
//     } catch (err) {
//       console.error(`❌ Error on attempt ${attempt}:`, err);
//     }
//   }

//   throw new Error("❌ Video not ready after max attempts");
// }

