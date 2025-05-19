import openai from "../../server.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let systemPrompt = "";

const promptPath = path.join(__dirname, "../data/system-prompt.json");
fs.readFile(promptPath, "utf-8")
  .then((data) => {
    const parsed = JSON.parse(data);
    systemPrompt = parsed.prompt;
  })
  .catch((err) => {
    console.error("Failed to load system prompt:", err);
    systemPrompt = "Je bent een zoekassistent.";
  });

export async function gpt(conversation) {
  const messages = [{ role: "system", content: systemPrompt }, ...conversation];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.0,
  });

  const text = response.choices[0].message.content.trim();

  if (text.startsWith("FINAL_QUERY:")) {
    const query = text.replace(/^FINAL_QUERY:\s*/i, "");
    return { type: "final_query", query };
  }

  return { type: "message", message: text };
}
