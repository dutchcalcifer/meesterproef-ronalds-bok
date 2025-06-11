import { fetchApiData } from "./api-controller.js";

// Extract unique values per field from dataset, for use in filters
function extractFiltersFromData(data, fields) {
  const filters = {};

  fields.forEach((field) => {
    const values = data
      .map((item) => item[field])            // Get the field value
      .filter(Boolean)                       // Remove null/undefined
      .flatMap((value) => value.split("\n")) // Split multi-line values
      .map((value) => value.trim())          // Trim whitespace
      .filter(Boolean);                      // Remove any empty strings

    // Use a Set to remove duplicates, then sort alphabetically
    filters[field] = [...new Set(values)].sort();
  });

  return filters;
}

// Get a filter object with all relevant fields and their unique values
export async function getFilters() {
  const data = await fetchApiData();

  const filterFields = [
    "rel_jaar",
    "rel_vak",
    "rel_cmd_expertise",
    "rel_beroepstaak",
    "rel_vakgebied",
    "soort",
    "rel_thema",
    "rel_competentie",
    "rel_principe",
    "rel_methode",
    "meer_bij_personen"
  ];

  return extractFiltersFromData(data.data, filterFields);
}

// Convert query string values into an object with array values per field
export function parseFiltersFromQuery(filterQuery) {
  const filters = {};
  for (const field in filterQuery) {
    if (filterQuery[field]) {
      // Ensure every filter value is treated as an array
      filters[field] = Array.isArray(filterQuery[field]) 
        ? filterQuery[field] 
        : [filterQuery[field]];
    }
  }
  return filters;
}

export function prettifyLabel(fieldName) {
  const words = fieldName
    .replace(/^rel_/, "")
    .split("_")
    .map(word => word.toLowerCase());

  if (words.length === 0) return "";

  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  return words.join(" ");
}