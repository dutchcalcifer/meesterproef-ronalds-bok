import express from "express";
import { getSearchResults } from "../controllers/search-controller.js";
import { getItemDetail } from "../controllers/item-controller.js";
import { fetchApiData } from "../controllers/api-controller.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q || "";
    const results = await getSearchResults(query);

    res.render("index", {
      layout: "layout/layout",
      title: "Ronalds BOK",
      className: "index",
      query,
      results,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).render("pages/errors/500.ejs", {
      layout: "layout/layout",
      title: "500",
      className: "500",
    });
  }
});

router.get("/item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getItemDetail(id);

    res.render("pages/details", {
      layout: "layout/layout",
      title: `${item.Naam}`,
      className: "details",
      item,
    });
  } catch (error) {
    console.error("Error fetching item details:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/index", async (req, res) => {
  try {
    const data = await fetchApiData();
    res.json(data);
  } catch (error) {
    console.error("Failed to fetch API data:", error);
    res.status(500).json({ error: "Failed to fetch API data" });
  }
});

export default router;
