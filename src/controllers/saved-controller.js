import { fetchItemById } from "./api-controller.js";
import { addExpertiseClassToData } from "./class-controller.js";

export const getSavedItems = async (ids) => {

  // Fetch alle items 1 voor 1
  const fetches = ids.map(async (id) => {
    try {
      const item = await fetchItemById(id);
      return item;
    } catch (error) {
      console.error(`Fout bij ophalen item ${id}:`, error.message);
      return null; // skip als een item niet werkt
    }
  });

  const items = (await Promise.all(fetches)).filter(Boolean);

  // Voeg classes toe (zoals kleur-categorieën)
  return addExpertiseClassToData(items);
};
