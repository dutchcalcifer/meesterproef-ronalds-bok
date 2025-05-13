import express from "express";
import { handleSearch } from "../controllers/search-controller.js";

const router = express.Router();

router.get("/", handleSearch);

router.get("/test", (req, res) => {
  res.render("pages/test", {
    layout: "layout/layout",
    title: "Test",
    className: "test",
  });
});

export default router;
