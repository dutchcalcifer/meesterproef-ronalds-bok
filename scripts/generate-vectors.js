import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import openai from "../server.js";
import { fetchApiData } from "../src/controllers/api-controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, "../src/data/vectors.json");

async function generateVectors() {
  const { data } = await fetchApiData();

  const embeddings = await Promise.all(
    data.map(async (item) => {
      const inputText = [
        `Naam: ${item.naam}`,
        `Ondertitel: ${item.ondertitel || ""}`,
        `Alternatieve naam: ${item.alternatieve_naam || ""}`,
        `Korte beschrijving: ${item.korte_beschrijving || ""}`,
        `Strekking: ${item.strekking || ""}`,
        `Toepassing: ${item.toepassing || ""}`,
        `Beroepstaak: ${item.rel_beroepstaak || ""}`,
        `Expertise: ${item.rel_cmd_expertise || ""}`,
        `Vakgebied: ${item.rel_vakgebied || ""}`,
        `Vakken: ${item.rel_vak || ""}`,
        `Competentie: ${item.rel_competentie || ""}`,
      ].join(" ");

      const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: inputText,
      });

      return {
        ...item,
        vector: res.data[0].embedding,
      };
    })
  );

  await fs.writeFile(outputPath, JSON.stringify(embeddings, null, 2));
  console.log(`Embeddings saved to ${outputPath}`);
}

generateVectors()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to generate embeddings:", err);
    process.exit(1);
  });
