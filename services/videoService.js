// services/videoService.js
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";

/**
 * stitchAudioWithClips: stitches clips/images + voiceover into a single mp4
 * params:
 *  - audioPath: path to voiceover (mp3)
 *  - segments: array of { path: "/path/to/clip.mp4" or "/path/to/image.jpg", duration?: seconds }
 *  - outputDir
 */
export async function stitchAudioWithClips(audioPath, segments = [], outputDir = "./generated") {
  await fs.ensureDir(outputDir);
  const tmpConcatFile = path.join(outputDir, `${uuidv4()}-concat.txt`);
  const preparedClips = [];

  // If a segment is an image, create a short video from it using ffmpeg
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const ext = path.extname(seg.path).toLowerCase();
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      const duration = seg.duration || 4;
      const outVideo = path.join(outputDir, `${uuidv4()}-img.mp4`);
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(seg.path)
          .loop(duration)
          .size("1280x720")
          .outputOptions("-pix_fmt yuv420p")
          .duration(duration)
          .save(outVideo)
          .on("end", resolve)
          .on("error", reject);
      });
      preparedClips.push(outVideo);
    } else {
      preparedClips.push(seg.path);
    }
  }

  // create concat file
  const concatContent = preparedClips.map(p => `file '${path.resolve(p)}'`).join("\n");
  await fs.writeFile(tmpConcatFile, concatContent);

  const finalOut = path.join(outputDir, `${uuidv4()}-final.mp4`);

  // concatenate videos
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(tmpConcatFile)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .on("end", resolve)
      .on("error", reject)
      .save(path.join(outputDir, "tmp-concat.mp4"));
  });

  // merge with audio (re-encode to ensure compatibility)
  await new Promise((resolve, reject) => {
    ffmpeg(path.join(outputDir, "tmp-concat.mp4"))
      .input(audioPath)
      .outputOptions([
        "-c:v libx264",
        "-c:a aac",
        "-strict -2",
        "-shortest",
        "-pix_fmt yuv420p"
      ])
      .on("end", resolve)
      .on("error", reject)
      .save(finalOut);
  });

  // cleanup temp files
  await fs.remove(tmpConcatFile);
  await fs.remove(path.join(outputDir, "tmp-concat.mp4"));
  // optionally remove generated image-videos in preparedClips if created

  return finalOut;
}
