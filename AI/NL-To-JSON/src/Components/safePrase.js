export function extractJSON(text) {
  try {
    // grabs first valid JSON block even if model adds text
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
  } catch {
    return text;
  }
}

export function safeParseJSON(str) {
  try {
    const parsed = JSON.parse(str);

    return {
      action: parsed.action ?? null,
      entity: parsed.entity ?? null,
      fields: Array.isArray(parsed.fields) ? parsed.fields : [],
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
      ambiguities: Array.isArray(parsed.ambiguities) ? parsed.ambiguities : []
    };

  } catch (err) {
    console.error("Bad JSON from model:\n", str);

    return {
      action: null,
      entity: null,
      fields: [],
      constraints: [],
      ambiguities: ["Model returned invalid JSON"]
    };
  }
}



export function extractOpenAPISpec(aiResponse) {
  try {
    // 1. Get raw result field
    let raw = aiResponse?.result;

    if (!raw) {
      throw new Error("No result field found");
    }

    // 2. If it's already an object → return directly
    if (typeof raw === "object") {
      return raw;
    }

    // 3. If it's string → parse JSON safely
    if (typeof raw === "string") {
      return JSON.parse(raw);
    }

    throw new Error("Unsupported AI format");
  } catch (err) {
    console.error("❌ Extraction failed:", err.message);
    return null;
  }
}