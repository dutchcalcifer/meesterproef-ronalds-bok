import express from "express";
import { getSearchResults } from "../controllers/search-controller.js";
import { fetchItemById, fetchApiData } from "../controllers/api-controller.js";
import openai from "../../server.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const query = req.query.q || "";
    const results = await getSearchResults(query);

    res.render("index", {
      layout: "layout/layout",
      title: "Ronalds BOK",
      className: "home",
      query,
      results,
    });
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

router.get("/index", async (req, res, next) => {
  try {
    const data = await fetchApiData();

    res.render("pages/index", {
      layout: "layout/layout",
      title: "Ronalds BOK",
      className: "index",
      query: "",
      results: data.data,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/chat", async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API error:", error);
    next(error);
  }
});

export default router;
