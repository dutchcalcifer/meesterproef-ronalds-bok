// gpt-controller.js
// ────────────────────────────────────────────────────────────────────────────
// Doel   : Chat-controller voor KAI (Knowledge AI).
// Opzet  : • Veldnamen zitten alléén hier (makkelijk uitbreiden)
//          • Prompt wordt tijdens runtime verrijkt met de veldlijst
//          • Vector-context wordt compact meegegeven
//          • Output-types: { type: "final_query", query }  óf  { type: "message", message }
// ────────────────────────────────────────────────────────────────────────────

import openai from "../../server.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ───────────────────────────────────────────────────────── base-prompt inlezen
const promptPath = path.join(__dirname, "../data/prompts.json");
let basePrompt = "Je bent een zoekassistent."; // fallback

try {
  const data = await fs.readFile(promptPath, "utf-8");
  const parsed = JSON.parse(data);
  if (parsed.prompt) basePrompt = parsed.prompt;
} catch (err) {
  console.error("⚠️  Failed to load prompt:", err);
}

// ──────────────────────────────────────────────────────── toegestane velden
// Pas deze array aan als er velden bijkomen — de prompt zelf hoeft dan niet mee.
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

// ───────────────────────────────────────────────────────── vector-data inlezen
const vectorPath = path.join(__dirname, "../data/vectors.json");
let vectorData = [];

try {
  const data = await fs.readFile(vectorPath, "utf-8");
  vectorData = JSON.parse(data);
} catch (err) {
  console.error("⚠️  Failed to load vector data:", err);
}

// ───────────────────────────────────────────────────────── hulpmethodes
function sanitizeFinalQuery(raw) {
  return raw
    .replace(/\s*=\s*/g, "=") // spaties rond "=" weg
    .replace(/\s*&\s*/g, "&") // spaties rond "&" weg
    .replace(/\s+/g, "+") // spaties → "+"
    .replace(/\+\+/g, "+"); // dubbele "+" inklappen
}

function buildContextSnippets(vec) {
  // Houd de context compact: alleen toegestane velden + naam
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

// ───────────────────────────────────────────────────────── hoofd-export
export async function gpt(conversation) {
  // Prompt aanvullen met dynamische veldlijst
  const systemPrompt = `${basePrompt}\n\nBeschikbare filtervelden (exact spellen): ${allowedFields.join(
    ", "
  )}`;

  // Vector-context
  const contextPrompt = `Je kent de volgende CMD-termen en bijbehorende filtervelden:\n\n${buildContextSnippets(
    vectorData
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

  if (/^FINAL_QUERY:/i.test(text)) {
    const raw = text.replace(/^FINAL_QUERY:\s*/i, "");
    return { type: "final_query", query: sanitizeFinalQuery(raw) };
  }

  return { type: "message", message: text };
}
