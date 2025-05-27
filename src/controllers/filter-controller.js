import { fetchApiData } from "./api-controller.js";

function extractFiltersFromData(data, velden) {
  const filters = {};

  velden.forEach((veld) => {
    const waarden = data
      .map((item) => item[veld])
      .filter(Boolean)
      .flatMap((waarde) => waarde.split("\n"))
      .map((waarde) => waarde.trim())
      .filter(Boolean);

    filters[veld] = [...new Set(waarden)].sort();
  });

  return filters;
}

export async function getFilters() {
  const data = await fetchApiData();

  const filterVelden = [
    "rel_jaar",
    "rel_vak",
    "rel_cmd_expertise",
    "rel_beroepstaak",
    "rel_vakgebied",
    "moeilijkheid",
    "soort"
  ];

  return extractFiltersFromData(data.data, filterVelden);
}



export function parseFiltersFromQuery(filterQuery) {
    const filters = {};
    for (const veld in filterQuery) {
      if (filterQuery[veld]) {
        filters[veld] = Array.isArray(filterQuery[veld]) ? filterQuery[veld] : [filterQuery[veld]];
      }
    }
    return filters;
  }