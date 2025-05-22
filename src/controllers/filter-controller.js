import { fetchApiData } from "./api-controller.js";

// Helpers
const includesIgnoreCase = (text, search) =>
  text?.toLowerCase().includes(search?.toLowerCase());

const toArray = (val) =>
  typeof val === "string"
    ? val.split("\n").map((v) => v.trim().toLowerCase())
    : Array.isArray(val)
    ? val.map((v) => v.toLowerCase())
    : [String(val).toLowerCase()];

const matchesFilter = (fieldValue, filterValues) => {
  const fieldArray = toArray(fieldValue);
  return filterValues.some((val) =>
    fieldArray.some((fieldVal) => fieldVal.includes(val.toLowerCase()))
  );
};

const expertiseMapping = {
  "interaction design": "interactieontwerp",
  "visual design": "visual design",
  "user experience design": "user experience design",
};

const normalizeFilterValues = (values, mapping = null) =>
  (Array.isArray(values) ? values : [values]).map((v) => {
    const key = v.toLowerCase();
    return mapping?.[key] || key;
  });

export const getOverzichtData = async (filters) => {
  const data = await fetchApiData();
  let kaarten = data.data;

  // Normaliseer filters
  const normalizedFilters = Object.fromEntries(
    Object.entries(filters).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
  );

  console.log("Normalized filters:", normalizedFilters);

  const velden = [
    "soort",
    "rel_vak",
    "rel_jaar",
    "rel_competentie",
    "rel_beroepstaak",
    "schrijver_of_bron",
    "alternatieve_naam",
  ];

  // rel_cmd_expertise met mapping
  if (normalizedFilters.rel_cmd_expertise) {
    const expertises = normalizeFilterValues(
      normalizedFilters.rel_cmd_expertise,
      expertiseMapping
    );
    kaarten = kaarten.filter((kaart) =>
      matchesFilter(kaart.rel_cmd_expertise, expertises)
    );
  }

  // Standaard filters (alles behalve 'moeilijkheid' en 'q')
  velden.forEach((veld) => {
    if (normalizedFilters[veld]) {
      kaarten = kaarten.filter((kaart) =>
        matchesFilter(kaart[veld], normalizedFilters[veld])
      );
    }
  });

  // moeilijkheid (numeriek)
  if (normalizedFilters.moeilijkheid) {
    kaarten = kaarten.filter((kaart) =>
      normalizedFilters.moeilijkheid.includes(String(kaart.moeilijkheid))
    );
  }

  // zoekterm
  if (normalizedFilters.q) {
    const zoekTerm = normalizedFilters.q.toString().toLowerCase();
    kaarten = kaarten.filter(
      (kaart) =>
        includesIgnoreCase(kaart.naam, zoekTerm) ||
        includesIgnoreCase(kaart.ondertitel, zoekTerm)
    );
  }

  return kaarten;
};
