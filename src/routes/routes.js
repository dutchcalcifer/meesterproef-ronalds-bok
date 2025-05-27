import express from "express";
import { getSearchResults } from "../controllers/search-controller.js";
import { fetchItemById, fetchApiData } from "../controllers/api-controller.js";
import { gpt } from "../controllers/gpt-controller.js";
import {
  getFilters,
  parseFiltersFromQuery,
} from "../controllers/filter-controller.js";
import { addExpertiseClassToData, addExpertiseClassToItem } from "../controllers/class-controller.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { q = "", ...filterQuery } = req.query;
    const activeFilters = parseFiltersFromQuery(filterQuery);

    // Dit was jouw originele code die search resultaten ophaalt
    let results = await getSearchResults(q, activeFilters);
    
    // Voeg classes toe aan elk resultaat
    results = addExpertiseClassToData(results);

    const allFilters = await getFilters();
    // console.log(results.map(r => r.class));

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
    let item = await fetchItemById(id);

    // Voeg class toe aan dit item
    item = addExpertiseClassToItem(item);
    // console.log(itemWithClass.class);

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
