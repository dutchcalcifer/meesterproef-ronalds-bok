import openai from "../../server.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { searchSimilarConcepts } from "../utils/vector-search.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let systemPrompt = "";
let vectorData = [];

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

const vectorPath = path.join(__dirname, "../data/vectors.json");
fs.readFile(vectorPath, "utf-8")
  .then((data) => {
    vectorData = JSON.parse(data);
  })
  .catch((err) => {
    console.error("Failed to load vector data:", err);
    vectorData = [];
  });

export async function gpt(conversation) {
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
    return { type: "final_query", query: rawQuery };
  }

  return { type: "message", message: text };
}
