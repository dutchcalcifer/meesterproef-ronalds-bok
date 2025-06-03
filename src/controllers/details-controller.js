import { fetchItemById, fetchApiData } from "./api-controller.js";
import { addExpertiseClassToItem } from "./class-controller.js";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function linkifyText(text, allItems, currentId) {
  if (!text) return "";
  allItems.forEach((otherItem) => {
    const name = otherItem.naam;
    if (!name) return;

    // Skip linken als het dezelfde is als de huidige pagina
    if (otherItem.id === currentId) return;

    // Regex zonder \b boundaries zodat ook '(Perceived) affordance' matcht
    const regex = new RegExp(`(${escapeRegExp(name)})`, "gi");

    // Gebruik callback om originele case te behouden bij vervanging
    text = text.replace(regex, (match) => `<a href="/item/${otherItem.id}">${match}</a>`);
  });
  return text;
}

export async function getDetailData(id) {
  let item = await fetchItemById(id);
  item = addExpertiseClassToItem(item);

  const allItemsResponse = await fetchApiData();
  const allItems = allItemsResponse.data;

  // Velden die je wil linken
  const fieldsToLinkify = [
    "rel_competentie",
    "rel_thema",
    "rel_principe",
    "rel_methode",
    "rel_beroepstaak",
    "rel_jaar",
    "rel_vak",
    "rel_vakgebied",
    "rel_cmd_expertise",
    "meer_bij_personen",
    "meer_bij_vak",
    "toepassing",
    "strekking",
    "korte_beschrijving",
    "ondertitel",
    // "naam",
    "soort",
    "schrijver_of_bron"
  ];

  fieldsToLinkify.forEach((field) => {
    if (item[field]) {
      // Voeg currentId toe zodat die niet gelinkt wordt in de tekst
      item[field] = linkifyText(item[field], allItems, item.id);
    }
  });

  return {
    item,
    allItems,
  };
}
