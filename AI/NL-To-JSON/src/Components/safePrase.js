export function extractJSON(text) {
  try {
    // grabs first valid JSON block even if model adds text
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
  } catch {
    return text;
  }
}