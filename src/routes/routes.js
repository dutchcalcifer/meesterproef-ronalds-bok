// Importing packages and controllers
import express from "express";
import { getSearchResults } from "../controllers/search-controller.js";
import { fetchItemById } from "../controllers/api-controller.js";
import { gpt } from "../controllers/gpt-controller.js";
import { getFilters, parseFiltersFromQuery, prettifyLabel } from "../controllers/filter-controller.js";
import { addExpertiseClassToData, addExpertiseClassToItem } from "../controllers/class-controller.js";
import { getDetailData } from "../controllers/details-controller.js";
import { getSavedItems } from "../controllers/saved-controller.js";


// Create a new router instance
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { q = "", ...filterQuery } = req.query;
    const activeFilters = parseFiltersFromQuery(filterQuery);

    let results = await getSearchResults(q, activeFilters);
    results = addExpertiseClassToData(results);

    const allFilters = await getFilters();

    // Maak leesbare labels voor filters
    const filterLabels = {};
    Object.keys(allFilters).forEach(field => {
      filterLabels[field] = prettifyLabel(field);
    });

    res.render("index", {
      layout: "layout/layout",
      title: "Ronalds BOK",
      className: "index",
      results,
      filters: allFilters,
      filterLabels,    // labels meegegeven
      query: req.query,
    });
  } catch (error) {
    next(error);
  }
});

// Handle POST requests for GPT-based conversation
router.post("/", async (req, res, next) => {
  try {
    const { conversation } = req.body;
    const result = await gpt(conversation);

    // If GPT returns a final query, send it back
    if (result.type === "final_query") {
      return res.json({ final: true, query: result.query });
    }

    // Otherwise, send back the next message
    res.json({ final: false, message: result.message });
  } catch (error) {
    next(error);
  }
});

// Handle GET requests for item details by ID
router.get("/item/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Roep de controller-functie aan die alles regelt
    const { item, allItems } = await getDetailData(id);

    // Render de pagina met de data die controller gaf
    res.render("pages/details", {
      layout: "layout/layout",
      title: item.naam,
      className: "details",
      item,
      allItems,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/saved", async (req, res, next) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.redirect("/"); // of render lege saved pagina
    }

    const results = await getSavedItems(ids);

    res.render("pages/saved", {
      layout: "layout/layout",
      title: "Opgeslagen Kaarten",
      className: "saved",
      results,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
