import Fuse from "fuse.js";

const fuse = new Fuse([], {
  keys: ["Naam", "Ondertitel"],
  includeScore: true,
  threshold: 0.3,
});

export const handleSearch = async (req, res) => {
  try {
    const query = req.query.q || "";
    let results = [];

    const response = await fetch(process.env.API_URL);
    const apiData = await response.json();

    if (query.trim() !== "") {
      const fuse = new Fuse(apiData.data, {
        keys: ["Naam", "Ondertitel"],
        includeScore: true,
        threshold: 0.3,
      });
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
