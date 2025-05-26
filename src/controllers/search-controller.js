import Fuse from "fuse.js";
import { fetchApiData } from "./api-controller.js";

export const getSearchResults = async (query) => {
  const apiData = await fetchApiData();

  if (query.trim() === "") return apiData.data;

  const fuse = new Fuse(apiData.data, {
    keys: ["naam", "ondertitel"],
    includeScore: true,
    threshold: 0.3,
  });

  return fuse.search(query).map((result) => result.item);
};
