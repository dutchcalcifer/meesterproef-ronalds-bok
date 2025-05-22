import { getOverzichtData } from "./data-controller.js"; // of jouw pad

const renderResultaten = async () => {
  const filters = {};

  // Voorbeeld: filters uit checkboxes ophalen
  const expertiseCheckboxes = document.querySelectorAll('input[name="rel_cmd_expertise"]:checked');
  filters.rel_cmd_expertise = Array.from(expertiseCheckboxes).map(cb => cb.value);

  const soortCheckboxes = document.querySelectorAll('input[name="soort"]:checked');
  filters.soort = Array.from(soortCheckboxes).map(cb => cb.value);

  const zoekInput = document.querySelector('input[name="q"]');
  if (zoekInput.value) {
    filters.q = zoekInput.value;
  }

  console.log("Filters naar getOverzichtData:", filters);

  const resultaten = await getOverzichtData(filters);
  console.log("Aantal resultaten:", resultaten.length);

  const container = document.querySelector("#resultaten");
  container.innerHTML = "";

  if (resultaten.length === 0) {
    container.innerHTML = "<p>Geen resultaten gevonden.</p>";
    return;
  }

  resultaten.forEach(kaart => {
    const div = document.createElement("div");
    div.classList.add("kaart");
    div.innerHTML = `
      <h3>${kaart.naam}</h3>
      <p>${kaart.rel_cmd_expertise || ""}</p>
    `;
    container.appendChild(div);
  });
};

// Event listener op een knop of bij DOM-load
document.addEventListener("DOMContentLoaded", () => {
  renderResultaten();

  // Optioneel: aanroepen wanneer je een filter verandert
  document.querySelectorAll("input[type=checkbox], input[name=q]").forEach(el => {
    el.addEventListener("change", renderResultaten);
  });
});
