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

    if (otherItem.id === currentId) return;

    const regex = new RegExp(`(${escapeRegExp(name)})`, "gi");
    text = text.replace(regex, (match) => `<a href="/item/${otherItem.id}">${match}</a>`);
  });
  return text;
}

export async function getDetailData(id) {
  let item = await fetchItemById(id);
  item = addExpertiseClassToItem(item); // hoofditem class

  const allItemsResponse = await fetchApiData();
  const allItems = allItemsResponse.data;

  // Velden om te linkify-en
  const stringFieldsToLinkify = [
    "rel_competentie",
    "rel_thema",
    "rel_principe",
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
    "soort",
    "schrijver_of_bron"
  ];

  // Zet meer_op_web om naar array als het een string is
if (item.meer_op_web && typeof item.meer_op_web === "string") {
  item.meer_op_web = item.meer_op_web
    .split(/\n|,/) // split op nieuwe regel óf komma
    .map(link => link.trim())
    .filter(link => link.length > 0);
}

  stringFieldsToLinkify.forEach((field) => {
    if (item[field]) {
      item[field] = linkifyText(item[field], allItems, item.id);
    }
  });

  // Verwerk rel_beroepstaak naar array
  if (!Array.isArray(item.rel_beroepstaak)) {
    if (item.rel_beroepstaak) {
      item.rel_beroepstaak = item.rel_beroepstaak
        .split('\n')
        .map(str => str.trim())
        .filter(str => str.length > 0);
    } else {
      item.rel_beroepstaak = [];
    }
  }

  // Voeg class toe aan elke gerelateerde beroepstaak
  item.rel_beroepstaak = item.rel_beroepstaak.map(name => {
    const found = allItems.find(i => i.naam === name);
    if (found) {
      return addExpertiseClassToItem({
        id: found.id,
        naam: found.naam,
        soort: found.soort || "",
        korte_beschrijving: found.korte_beschrijving || "",
        rel_cmd_expertise: found.rel_cmd_expertise || ""
      });
    } else {
      return {
        id: name,
        naam: name,
        class: "default"
      };
    }
  });

// Verwerk rel_methode naar array
if (!Array.isArray(item.rel_methode)) {
  if (item.rel_methode) {
    item.rel_methode = item.rel_methode
      .split('\n')
      .map(str => str.trim())
      .filter(str => str.length > 0);
  } else {
    item.rel_methode = [];
  }
}

// Voeg class toe aan elke gerelateerde methode
item.rel_methode = item.rel_methode.map(name => {
  const found = allItems.find(i => i.naam === name);
  if (found) {
    return addExpertiseClassToItem({
      id: found.id,
      naam: found.naam,
      soort: found.soort || "",
      korte_beschrijving: found.korte_beschrijving || "",
      rel_cmd_expertise: found.rel_cmd_expertise || ""
    });
  } else {
    return {
      id: name,
      naam: name,
      class: "default"
    };
  }
});

  return {
    item,
    allItems,
  };
}
