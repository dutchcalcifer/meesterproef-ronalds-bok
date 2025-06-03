// Import OpenAI client and filesystem/path utilities
import openai from "../../server.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Determine current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize placeholders for system prompt and vector data
let systemPrompt = "";
let vectorData = [];

// Load system prompt from JSON file (fallback to default on error)
const promptPath = path.join(__dirname, "../data/prompts.json");
fs.readFile(promptPath, "utf-8")
  .then((data) => {
    const parsed = JSON.parse(data);
    systemPrompt = parsed.prompt;
  })
  .catch((err) => {
    console.error("Failed to load system prompt:", err);
    systemPrompt = "Je bent een zoekassistent.";
  });

// Load vector data from JSON file (fallback to empty array on error)
const vectorPath = path.join(__dirname, "../data/vectors.json");
fs.readFile(vectorPath, "utf-8")
  .then((data) => {
    vectorData = JSON.parse(data);
  })
  .catch((err) => {
    console.error("Failed to load vector data:", err);
    vectorData = [];
  });

// Helper to sanitize FINAL_QUERY output
function sanitizeFinalQuery(rawQuery) {
  return rawQuery
    .replace(/\s*=\s*/g, "=") // Remove spaces around "="
    .replace(/\s*&\s*/g, "&") // Remove spaces around "&"
    .replace(/\s+/g, "+") // Replace remaining spaces with "+"
    .replace(/\+\+\+/g, "+") // Collapse triple pluses if any
    .replace(/\+\+/g, "+"); // Collapse double pluses
}

// Main GPT function
export async function gpt(conversation) {
  // Build context snippets from loaded vector data
  const fields = [
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

  const contextSnippets = vectorData.map((item) => {
    const filterData = fields
      .map((key) => (item[key] ? `${key}: ${item[key]}` : null))
      .filter(Boolean)
      .join("\n");
    return `Term: ${item.naam}\n${filterData}`;
  });

  const contextPrompt = `Je kent de volgende CMD-termen en bijbehorende filtervelden:\n\n${contextSnippets.join(
    "\n\n"
  )}`;

  const messages = [
    { role: "system", content: `${systemPrompt}\n\n${contextPrompt}` },
    ...conversation,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.0,
  });

  const text = response.choices[0].message.content.trim();

  if (text.startsWith("FINAL_QUERY:")) {
    const rawQuery = text.replace(/^FINAL_QUERY:\s*/i, "");
    const sanitized = sanitizeFinalQuery(rawQuery);
    return { type: "final_query", query: sanitized };
  }

  return { type: "message", message: text };
}
