// Importing packages
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import expressEjsLayouts from "express-ejs-layouts";
import OpenAI from "openai";
import projectRoutes from "./src/routes/routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export default openai;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(expressEjsLayouts);
app.use(cookieParser());

// Routes
app.use("/", projectRoutes);

// Error handlers
app.use((req, res) =>
  res.status(404).render("pages/errors/404.ejs", {
    layout: "layout/layout",
    title: "404",
    className: "error",
  })
);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("pages/errors/500.ejs", {
    layout: "layout/layout",
    title: "500",
    className: "error",
  });
});

// Start server
app.listen(3000, () => console.log("Server Started: localhost:3000"));
