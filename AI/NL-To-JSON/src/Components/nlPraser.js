import { SYSTEM_PROMPT } from "./prompt.js";
import { extractJSON } from "./safePrase.js";
import "dotenv/config";

const MODEL = "openai/gpt-oss-120b:free";
const API_KEY = process.env.API_KEY ;

// Extract requirements from OpenAPI spec
function extractRequirementsFromSpec(spec) {
  const requirements = [];
  const paths = spec?.paths || {};

  Object.entries(paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, details]) => {
      // Extract entity name from path
      const pathParts = path.split('/').filter(p => p && p !== '{id}');
      const entity = pathParts[pathParts.length - 1] || 'Resource';
      
      // Extract action from method
      const actionMap = {
        'get': 'fetch',
        'post': 'create',
        'put': 'update',
        'patch': 'update',
        'delete': 'delete'
      };
      const action = actionMap[method.toLowerCase()] || method.toLowerCase();

      // Extract fields from request schema
      const requestSchema = details?.requestBody?.content?.['application/json']?.schema || {};
      const properties = requestSchema?.properties || {};
      const requiredFields = requestSchema?.required || [];

      const fields = Object.entries(properties).map(([name, schema]) => ({
        name,
        required: requiredFields.includes(name),
        type: schema?.type || 'string'
      }));

      // Extract ambiguities from spec
      const ambiguities = spec?.['x-ambiguities'] || [];

      requirements.push({
        action,
        entity: entity.charAt(0).toUpperCase() + entity.slice(1),
        fields: fields.length > 0 ? fields : [],
        constraints: details?.description ? [details.description] : [],
        ambiguities: ambiguities
      });
    });
  });

  return requirements;
}

export async function parseRequirement(text) {
  console.log("API Key loaded:", !!API_KEY);
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

  console.log("OpenRouter response received");

  let raw = data?.choices?.[0]?.message?.content || "";

  // 🧠 smarter cleanup (handles garbage before/after JSON)
  raw = extractJSON(raw);
  console.log("Extracted JSON from response");

  let spec;
  try {
    spec = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    throw new Error("Failed to parse OpenAPI spec from AI response");
  }

  // Extract requirements from the spec
  const requirements = extractRequirementsFromSpec(spec);
  
  console.log(`Extracted ${requirements.length} requirements from spec`);

  return {
    spec,
    requirements
  };
}