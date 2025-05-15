import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import projectRoutes from "./src/routes/routes.js";
import expressEjsLayouts from "express-ejs-layouts";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(expressEjsLayouts);

app.use("/", projectRoutes);

app.use((req, res) => {
  res.status(404).render("pages/errors/404.ejs", {
    layout: "layout/layout",
    title: "404",
    className: "error",
  });
});

app.use((err, req, res, next) => {
  res.status(500).render("pages/errors/500.ejs", {
    layout: "layout/layout",
    title: "500",
    className: "error",
  });
});

app.listen(3000, () => {
  console.log("Server Started: localhost:3000");
});
