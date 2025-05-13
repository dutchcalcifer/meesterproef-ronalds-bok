import Fuse from "fuse.js";
import searchData from "../data/search-data.js";

const fuse = new Fuse(searchData, {
  keys: ["title", "content"],
  includeScore: true,
  threshold: 0.3,
});

export const handleSearch = (req, res) => {
  try {
    const query = req.query.q || "";
    let results = [];

    if (query.trim() !== "") {
      results = fuse.search(query).map((result) => result.item);
    }

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
};
