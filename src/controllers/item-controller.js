import { fetchItemById } from "./api-controller.js";

export const getItemDetail = async (id) => {
  return await fetchItemById(id);
};
