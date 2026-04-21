import { SYSTEM_PROMPT } from "./prompt.js";
import { extractJSON } from "./safePrase.js";
import "dotenv/config";

const MODEL = "openai/gpt-oss-120b:free";
const API_KEY = process.env.API_KEY ;

export async function parseRequirement(text) {
  console.log(API_KEY);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      "HTTP-Referer": "http://localhost", // required by OpenRouter
      "X-Title": "NL-to-JSON Parser"
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  console.log("Date:", data);

  let raw = data?.choices?.[0]?.message?.content || "";

  // 🧠 smarter cleanup (handles garbage before/after JSON)
  raw = extractJSON(raw);
  console.log("After extractJSON:", raw);

  return raw;
}