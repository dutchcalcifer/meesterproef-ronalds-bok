import Fuse from "fuse.js";
import { fetchApiData } from "./api-controller.js";

// Perform a fuzzy search on data using Fuse.js, combined with filters
export const getSearchResults = async (q, filters = {}) => {
  const apiData = await fetchApiData();
  const data = apiData.data;

  // Initialize Fuse.js with specific fields to search through
  const fuse = new Fuse(data, {
    keys: [
      "naam",
      "ondertitel",
      "rel_jaar",
      "rel_vak",
      "rel_cmd_expertise",
      "rel_beroepstaak",
      "rel_vakgebied",
      "moeilijkheid",
      "soort",
    ],
    threshold: 0.3, // Sensitivity of the search
  });

  // If there's no query and no filters, return everything
  if ((!q || q.trim() === "") && Object.keys(filters).length === 0) {
    return data;
  }

  const logicalQueries = [];

  // If there's a search term, match either title or subtitle
  if (q && q.trim() !== "") {
    logicalQueries.push({
      $or: [
        { naam: q },
        { ondertitel: q },
      ],
    });
  }

  // Add filters (multiple selected values per field are handled as OR conditions)
  for (const field in filters) {
    if (filters[field] && filters[field].length > 0) {
      const orConditions = filters[field].map((value) => ({
        [field]: value,
      }));
      logicalQueries.push({ $or: orConditions });
    }
  }

  // All filter conditions and query must apply
  const fuseQuery = { $and: logicalQueries };

  // Perform the Fuse.js search with the combined query
  return fuse.search(fuseQuery).map((result) => result.item);
};
