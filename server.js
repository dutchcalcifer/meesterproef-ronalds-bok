// Core & third-party
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import expressEjsLayouts from "express-ejs-layouts";
import OpenAI from "openai";

// Project files
import projectRoutes from "./src/routes/routes.js";

// Setup
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export { openai }; // <── named export for other modules

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware & routes
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(expressEjsLayouts);

app.use("/", projectRoutes);

// Error handling
app.use((req, res) =>
  res.status(404).render("pages/errors/404.ejs", {
    layout: "layout/layout",
    title: "404",
    className: "error",
  })
);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).render("pages/errors/500.ejs", {
    layout: "layout/layout",
    title: "500",
    className: "error",
  });
});

// Export for Vercel – *no* app.listen() in production
export default app;

// For local development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () =>
    console.log(`🚀  Local server running on http://localhost:${PORT}`)
  );
}
