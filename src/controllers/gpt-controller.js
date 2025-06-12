// Import packages and utilities
import { openai } from "../../server.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Resolve the current file location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the base prompt from JSON (fallback to a minimal default)
const promptPath = path.join(__dirname, "../data/prompts.json");
let basePrompt = "Je bent een zoekassistent."; // fallback prompt
try {
  const data = await fs.readFile(promptPath, "utf-8");
  const parsed = JSON.parse(data);
  if (parsed.prompt) basePrompt = parsed.prompt;
} catch (err) {
  console.error("Failed to load system prompt:", err);
}

// Allowed filter fields (extend this list when new filters are added)
export const allowedFields = [
  "rel_jaar",
  "rel_vak",
  "rel_cmd_expertise",
  "rel_beroepstaak",
  "rel_vakgebied",
  "rel_competentie",
  "rel_thema",
  "rel_principe",
  "rel_methode",
  "moeilijkheid",
  "soort",
];

// Load vector data that contains all CMD terms
const vectorPath = path.join(__dirname, "../data/vectors.json");
let vectorData = [];
try {
  const data = await fs.readFile(vectorPath, "utf-8");
  vectorData = JSON.parse(data);
} catch (err) {
  console.error("Failed to load vector data:", err);
}

// Helper: safely encode each value in FINAL_QUERY
function sanitizeFinalQuery(raw) {
  // 1) Remove extra spaces around "=" and "&"
  const trimmed = raw.replace(/\s*=\s*/g, "=").replace(/\s*&\s*/g, "&");

  // 2) Process each key=value pair separately
  const cleaned = trimmed
    .split("&")
    .map((pair) => {
      const [key, val = ""] = pair.split("=");

      // a) Convert spaces to "+"
      let v = val.replace(/\s+/g, "+");

      // b) Encode special characters the prompt specifies
      v = v.replace(/\//g, "%2F").replace(/\(/g, "%28").replace(/\)/g, "%29");

      // c) Collapse multiple plus signs
      v = v.replace(/\++/g, "+");

      return `${key}=${v}`;
    })
    .join("&");

  return cleaned;
}

// Helper: build a compact vector context string
function buildContextSnippets(vec) {
  return vec
    .map((item) => {
      const parts = [];
      for (const key of allowedFields) {
        if (item[key]) parts.push(`${key}: ${item[key]}`);
      }
      return `Term: ${item.naam}${parts.length ? "\n" + parts.join("\n") : ""}`;
    })
    .join("\n\n");
}

// Main GPT handler
export async function gpt(conversation) {
  // Choose model via environment variable (set in npm scripts)
  const MODEL_NAME = process.env.OPENAI_MODEL || "gpt-4o";
  console.log(`Using model: ${MODEL_NAME}`);

  // Compose the system prompt with the dynamic field list
  const systemPrompt = `${basePrompt}\n\nBeschikbare filtervelden (exact spellen): ${allowedFields.join(
    ", "
  )}`;

  // Add vector context
  const contextPrompt = `Je kent de volgende CMD-termen en bijbehorende filtervelden:\n\n${buildContextSnippets(
    vectorData
  )}`;

  // Full message list for OpenAI
  const messages = [
    { role: "system", content: `${systemPrompt}\n\n${contextPrompt}` },
    ...conversation,
  ];

  // Request a chat completion
  const response = await openai.chat.completions.create({
    model: MODEL_NAME,
    messages,
    temperature: 0.0,
  });

  const text = response.choices[0].message.content.trim();

  // Detect and return either a FINAL_QUERY or an ordinary reply
  if (/^FINAL_QUERY:/i.test(text)) {
    const raw = text.replace(/^FINAL_QUERY:\s*/i, "");
    return { type: "final_query", query: sanitizeFinalQuery(raw) };
  }

  return { type: "message", message: text };
}
