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

