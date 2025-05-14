export const handleItemDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const apiUrl = `${process.env.API_URL}&filter[id]=${id}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    const item = result.data[0];

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
