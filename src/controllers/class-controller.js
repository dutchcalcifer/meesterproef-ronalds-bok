// Utility function to convert a string to kebab-case (lowercase with dashes)
function toKebabCase(str) {
    return str
      .toLowerCase()
      .replace(/\s+/g, "-")             // Replace spaces with dashes
      .replace(/[^a-z0-9\-]/g, "");     // Remove all non-alphanumeric characters except dashes
  }
  
  // Add a CSS class to a list of items based on the "rel_cmd_expertise" field
  export const addExpertiseClassToData = (data) => {
    const items = data.data || data; // Support both formats: full API response or extracted array
    return items.map(item => ({
      ...item,
      class: `expertise-${toKebabCase(item.rel_cmd_expertise || "onbekend")}`,
    }));
  };
  
  // Add a CSS class to a single item based on the "rel_cmd_expertise" field
  export const addExpertiseClassToItem = (item) => ({
    ...item,
    class: `expertise-${toKebabCase(item.rel_cmd_expertise || "onbekend")}`,
  });
  