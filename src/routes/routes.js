import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    layout: "layout/layout",
    title: "Ronalds BOK",
  });
});

export default router;
