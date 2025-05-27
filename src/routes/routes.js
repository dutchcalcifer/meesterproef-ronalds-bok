import express from "express";
import { getSearchResults } from "../controllers/search-controller.js";
import { fetchItemById, fetchApiData } from "../controllers/api-controller.js";
import { gpt } from "../controllers/gpt-controller.js";
import {
  getFilters,
  parseFiltersFromQuery,
} from "../controllers/filter-controller.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { q = "", ...filterQuery } = req.query;
    const activeFilters = parseFiltersFromQuery(filterQuery);

    const results = await getSearchResults(q, activeFilters);
    const allFilters = await getFilters();

    res.render("index", {
      layout: "layout/layout",
      title: "Ronalds BOK",
      className: "index",
      results,
      filters: allFilters,
      query: req.query,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { conversation } = req.body;
    const result = await gpt(conversation);

    if (result.type === "final_query") {
      return res.json({ final: true, query: result.query });
    }

    res.json({ final: false, message: result.message });
  } catch (error) {
    next(error);
  }
});

router.get("/item/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await fetchItemById(id);

    res.render("pages/details", {
      layout: "layout/layout",
      title: `${item.naam}`,
      className: "details",
      item,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
