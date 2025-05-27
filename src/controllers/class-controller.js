function toKebabCase(str) {
    return str
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  }
  
  export const addExpertiseClassToData = (data) => {
    // data kan hier data.data zijn of data.data.data, dus pas aan waar nodig
    const items = data.data || data; // flexibel
    return items.map(item => ({
      ...item,
      class: `expertise-${toKebabCase(item.rel_cmd_expertise || "onbekend")}`,
    }));
  };
  
  export const addExpertiseClassToItem = (item) => ({
    ...item,
    class: `expertise-${toKebabCase(item.rel_cmd_expertise || "onbekend")}`,
  });
  