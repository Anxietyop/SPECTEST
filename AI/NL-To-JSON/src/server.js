import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import fs from "fs";
import { parseRequirement } from "./Components/nlPraser.js";
import { readFileContent } from "./Helper/util.js";

const app = express();
const logPath = "test.log";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ───── multer setup ─────
const upload = multer({ dest: "uploads/" });

// ───── health ─────
app.get("/", (req, res) => {
  fs.appendFileSync(logPath, "[GET /] health check\n");
  return res.json({ status: "NL-to-OpenAPI server running 🚀" });
});

// ─────────────────────────────────────────────
// 🟡 POST /parse
// ─────────────────────────────────────────────
app.post("/parse", upload.single("file"), async (req, res) => {
  console.log("POST /parse hit");

  let text = "";

  try {
    // ─── CASE 1: file upload ───
    if (req.file) {
      text = await readFileContent(req.file.path, req.file.originalname); // ✅ fix
    }

    // ─── CASE 2: JSON body ───
    else if (req.body.text) {
      text = req.body.text;
    }

    if (!text) {
      return res.status(400).json({
        error: "Provide either a file or text",
      });
    }

    // ─── parse ───
    const response = await parseRequirement(text);

    // ─── debug log ───
    fs.appendFileSync(
      logPath,
      "[POST /parse] Response:\n" +
        JSON.stringify(response, null, 2) +
        "\n\n" +
        "[Response sent]: \n" +
        JSON.stringify({ spec: response })
    );

    // ─── call FastAPI ───
    try {
      await fetch("http://127.0.0.1:8000/auto-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec: response }),
      });
    } catch (err) {
      console.error("FastAPI call failed:", err.message);
    }

    return res.json(response);

  } catch (err) {
    console.error("Parse error:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });

  } finally {
    // 🧹 always cleanup file
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
  }
});

// ───── start server ─────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});