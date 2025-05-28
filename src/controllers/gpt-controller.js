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

// Main GPT function: builds context, sends to OpenAI, and processes response
export async function gpt(conversation) {
  // Build context snippets from loaded vector data
  const contextSnippets = vectorData.map((item) => {
    const fields = [
      "rel_jaar",
      "rel_vak",
      "rel_cmd_expertise",
      "rel_beroepstaak",
      "rel_vakgebied",
      "moeilijkheid",
      "soort",
    ];
    const filterData = fields
      .map((key) => (item[key] ? `${key}: ${item[key]}` : null))
      .filter(Boolean)
      .join("\n");
    return `Term: ${item.naam}\n${filterData}`;
  });

  // Combine system prompt and context snippets
  const contextPrompt = `Je kent de volgende CMD-termen en bijbehorende filtervelden:\n\n${contextSnippets.join(
    "\n\n"
  )}`;

  // Compile messages array for OpenAI.Chat
  const messages = [
    { role: "system", content: `${systemPrompt}\n\n${contextPrompt}` },
    ...conversation,
  ];

  // Call OpenAI API with deterministic settings
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.0,
  });

  // Extract and trim the response text
  const text = response.choices[0].message.content.trim();

  // Check for a final query marker and return accordingly
  if (text.startsWith("FINAL_QUERY:")) {
    const rawQuery = text.replace(/^FINAL_QUERY:\s*/i, "");
    return { type: "final_query", query: rawQuery };
  }

  // Otherwise return as a chat message
  return { type: "message", message: text };
}
