import express from "express";
import { handleSearch } from "../controllers/search-controller.js";
import { handleItemDetail } from "../controllers/item-controller.js";

const router = express.Router();

router.get("/", handleSearch);

router.get("/item/:id", handleItemDetail);

export default router;
