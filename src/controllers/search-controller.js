// import Fuse from "fuse.js";
// import { fetchApiData } from "./api-controller.js";

// export const getSearchResults = async (query) => {
//   const apiData = await fetchApiData();

//   if (query.trim() === "") return apiData.data;

//   const fuse = new Fuse(apiData.data, {
//     keys: ["naam", "ondertitel"],
//     includeScore: true,
//     threshold: 0.3,
//   });

//   return fuse.search(query).map((result) => result.item);
// };

// vivannes versie:

import Fuse from "fuse.js";
import { fetchApiData } from "./api-controller.js";

export const getSearchResults = async (q, filters = {}) => {
  const apiData = await fetchApiData();
  const data = apiData.data;

  // Fuse instance met alle keys waarin gezocht/filtred wordt
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
    threshold: 0.3,
  });

  // Als geen query en geen filters, geef alles terug
  if ((!q || q.trim() === "") && Object.keys(filters).length === 0) {
    return data;
  }

  const logicalQueries = [];

  // Voeg zoekterm toe als $or tussen naam en ondertitel
  if (q && q.trim() !== "") {
    logicalQueries.push({
      $or: [
        { naam: q },
        { ondertitel: q },
      ],
    });
  }

  // Voeg filters toe
  for (const veld in filters) {
    if (filters[veld] && filters[veld].length > 0) {
      const orConditions = filters[veld].map((waarde) => ({
        [veld]: waarde,
      }));
      logicalQueries.push({ $or: orConditions });
    }
  }

  // Combineer alles met $and (alle filters en zoekterm moeten gelden)
  const fuseQuery = { $and: logicalQueries };

  // Voer zoekopdracht uit met de samengestelde query
  return fuse.search(fuseQuery).map((result) => result.item);
};
