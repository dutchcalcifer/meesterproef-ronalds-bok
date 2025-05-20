import cosineSimilarity from "compute-cosine-similarity";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import openai from "../../server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const embeddingsPath = path.join(__dirname, "../data/embeddings.json");

let embeddings = [];

export async function loadEmbeddings() {
  if (embeddings.length > 0) return embeddings;
  const raw = await fs.readFile(embeddingsPath, "utf-8");
  embeddings = JSON.parse(raw);
  return embeddings;
}

export async function searchSimilarConcepts(query, topK = 3) {
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  const queryVector = queryEmbedding.data[0].embedding;

  const concepts = await loadEmbeddings();

  const scored = concepts.map((concept) => ({
    ...concept,
    score: cosineSimilarity(queryVector, concept.vector),
  }));

  // Sort descending (higher score = more similar)
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
