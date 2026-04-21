import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import fs from "fs";
import path from "path";

import { parseRequirement } from "./Components/nlPraser.js";
import { extractOpenAPISpec } from "./Components/safePrase.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

  if (ext === ".txt" || ext === ".md") {
    return data;
  }

  return data;
}

function processText(text) {
  return parseRequirement(text);
}

const formatResponse = async (text) => {
  const result = await processText(text);

  return {
    success: true,
    inputLength: text.length,
    result
  };
};

// ─────────────────────────────────────────────
// 🟡 POST /parse (FILE + JSON BODY)
// ─────────────────────────────────────────────
app.post("/parse", upload.single("file"), async (req, res) => {
  console.log("POST /parse working");

  try {
    let text = "";

    // CASE 1: file upload
    if (req.file) {
      text = readFileContent(req.file);
      fs.unlinkSync(req.file.path);
    }

    // CASE 2: JSON body
    else if (req.body.text) {
      text = req.body.text;
    }

    if (!text) {
      return res.status(400).json({
        error: "Provide either a file or text"
      });
    }

    const response = await formatResponse(text);

    console.log(response);
    console.log("dih is here : ",extractOpenAPISpec(response));

  fetch("http://127.0.0.1:8000/auto-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spec: extractOpenAPISpec(response)
      })
    }).catch(err => {
      console.error("FastAPI call failed:", err);
    });

    return res.json(response);

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