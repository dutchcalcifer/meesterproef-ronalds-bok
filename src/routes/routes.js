// Importing packages and controllers
import express from "express";
import { getSearchResults } from "../controllers/search-controller.js";
import { fetchItemById } from "../controllers/api-controller.js";
import { gpt } from "../controllers/gpt-controller.js";
import {
  getFilters,
  parseFiltersFromQuery,
} from "../controllers/filter-controller.js";
import { addExpertiseClassToData, addExpertiseClassToItem } from "../controllers/class-controller.js";

// Create a new router instance
const router = express.Router();

// Handle GET requests to the homepage
router.get("/", async (req, res, next) => {
  try {
    // Extract search query and filter parameters from URL
    const { q = "", ...filterQuery } = req.query;
    const activeFilters = parseFiltersFromQuery(filterQuery);

    // Fetch search results and available filters
    let results = await getSearchResults(q, activeFilters);
    
    // Voeg classes toe aan elk resultaat
    results = addExpertiseClassToData(results);

    const allFilters = await getFilters();
    // console.log(results.map(r => r.class));

    // Render the index view with data
    res.render("index", {
      layout: "layout/layout",
      title: "Ronalds BOK",
      className: "index",
      results,
      filters: allFilters,
      query: req.query,
    });
  } catch (error) {
    next(error); // Forward errors to the error handler
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
    let item = await fetchItemById(id);

    // Voeg class toe aan dit item
    item = addExpertiseClassToItem(item);
    // console.log(itemWithClass.class);

    // Render the details view with the fetched item
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
