import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import openai from "../../server.js";
import { fetchApiData } from "../controllers/api-controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, "../data/embeddings.json");

async function generateEmbeddings() {
  const { data } = await fetchApiData();

  const names = data.map((item) => item.naam);

  const embeddings = [];

  for (const name of names) {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: name,
    });

    embeddings.push({
      naam: name,
      vector: res.data[0].embedding,
    });
  }

  await fs.writeFile(outputPath, JSON.stringify(embeddings, null, 2));
  console.log(`Embeddings saved to ${outputPath}`);
}

generateEmbeddings();
