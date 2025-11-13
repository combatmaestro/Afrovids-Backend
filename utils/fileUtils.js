// utils/fileUtils.js
import fs from "fs-extra";
import path from "path";

export async function saveBufferToFile(buffer, outPath) {
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, buffer);
}
