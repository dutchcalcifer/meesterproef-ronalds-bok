// Import packages and utilities
import openai from "../../server.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Resolve current file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the base prompt from JSON (fallback to default)
const promptPath = path.join(__dirname, "../data/prompts.json");
let basePrompt = "Je bent een zoekassistent."; // default prompt
try {
  const data = await fs.readFile(promptPath, "utf-8");
  const parsed = JSON.parse(data);
  if (parsed.prompt) basePrompt = parsed.prompt;
} catch (err) {
  console.error("Failed to load system prompt:", err);
}

// Define allowed filter fields (edit here to add more later)
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

// Helper: clean up the FINAL_QUERY string before redirecting
function sanitizeFinalQuery(raw) {
  return raw
    .replace(/\s*=\s*/g, "=")
    .replace(/\s*&\s*/g, "&")
    .replace(/\s+/g, "+")
    .replace(/\+\+/g, "+");
}

// Helper: build compact vector context for GPT
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

// Exported GPT handler
export async function gpt(conversation) {
  // Combine base prompt with dynamic field list
  const systemPrompt = `${basePrompt}\n\nBeschikbare filtervelden (exact spellen): ${allowedFields.join(
    ", "
  )}`;

  // Append vector context
  const contextPrompt = `Je kent de volgende CMD-termen en bijbehorende filtervelden:\n\n${buildContextSnippets(
    vectorData
  )}`;

  // Assemble full message list for OpenAI
  const messages = [
    { role: "system", content: `${systemPrompt}\n\n${contextPrompt}` },
    ...conversation,
  ];

  // Create chat completion
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.0,
  });

  const text = response.choices[0].message.content.trim();

  // Return final query or next chat message
  if (/^FINAL_QUERY:/i.test(text)) {
    const raw = text.replace(/^FINAL_QUERY:\s*/i, "");
    return { type: "final_query", query: sanitizeFinalQuery(raw) };
  }

  return { type: "message", message: text };
}
