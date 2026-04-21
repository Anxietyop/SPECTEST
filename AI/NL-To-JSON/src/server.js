import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import fs from "fs";
import path from "path";

import { parseRequirement } from "./Components/nlPraser.js";

const app = express();
app.use(cors());

// ───── multer setup ─────
const upload = multer({ dest: "uploads/" });

// ───── health ─────
app.get("/", (req, res) => {
  res.json({ status: "NL-to-OpenAPI server running 🚀" });
});

// ───── helpers ─────
function readFileContent(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  const data = fs.readFileSync(file.path, "utf-8");

  // simple text-based handling
  if (ext === ".txt" || ext === ".md") {
    return data;
  }

  // fallback
  return data;
}

// ───── FILE PARSE ENDPOINT ─────
app.post("/parse", upload.single("file"), async (req, res) => {
  try {
    let text = "";

    // CASE 1: file upload
    if (req.file) {
      text = readFileContent(req.file);

      // cleanup temp file
      fs.unlinkSync(req.file.path);
    }

    // CASE 2: raw text body
    else if (req.body.text) {
      text = req.body.text;
    }

    if (!text) {
      return res.status(400).json({
        error: "Provide either a file or text"
      });
    }

    const result = await parseRequirement(text);

    return res.json({
      success: true,
      inputLength: text.length,
      result
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ───── start server ─────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});