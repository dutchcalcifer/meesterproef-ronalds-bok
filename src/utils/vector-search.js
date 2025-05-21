import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import computeCosineSimilarity from "compute-cosine-similarity";
import openai from "../../server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vectorsPath = path.join(__dirname, "../data/vectors.json");

let vectorData = [];

export async function loadVectors() {
  try {
    const data = await fs.readFile(vectorsPath, "utf-8");
    vectorData = JSON.parse(data);
  } catch (err) {
    console.error("Failed to load vectors:", err);
  }
}

async function embedQuery(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

export async function searchSimilarConcepts(query, limit = 5) {
  if (!vectorData.length) await loadVectors();

  const queryVector = await embedQuery(query);

  const similarities = vectorData.map((item) => {
    return {
      ...item,
      score: computeCosineSimilarity(queryVector, item.vector),
    };
  });

  similarities.sort((a, b) => b.score - a.score);

  return similarities.slice(0, limit);
}
