import { fetchItemById } from "./api-controller.js";

export const handleItemDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await fetchItemById(id);

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
};
