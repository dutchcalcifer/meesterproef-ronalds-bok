// Import filesystem, path, and URL utilities
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
// Import OpenAI client and data-fetch helper
import openai from "../server.js";
import { fetchApiData } from "../src/controllers/api-controller.js";

// Determine current file and project directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Path where generated vectors will be saved
const outputPath = path.join(__dirname, "../src/data/vectors.json");

// Main function: fetch data, generate embeddings, and save to file
async function generateVectors() {
  // Fetch raw items from the API
  const { data } = await fetchApiData();

  // For each item, create an embedding from its combined fields
  const embeddings = await Promise.all(
    data.map(async (item) => {
      // Concatenate relevant fields into one input string
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

      // Request embedding from OpenAI
      const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: inputText,
      });

      // Return original item plus its new vector
      return {
        ...item,
        vector: res.data[0].embedding,
      };
    })
  );

  // Write the full array of embeddings to disk
  await fs.writeFile(outputPath, JSON.stringify(embeddings, null, 2));
  console.log(`Embeddings saved to ${outputPath}`);
}

// Run the script and handle errors
generateVectors()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to generate embeddings:", err);
    process.exit(1);
  });
