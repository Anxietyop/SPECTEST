import mammoth from "mammoth";
import fs from "fs";
import path from "path";


export async function readFileContent(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === ".txt" || ext === ".md") {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  console.log(`Unsupported file type: ${ext}`);
}