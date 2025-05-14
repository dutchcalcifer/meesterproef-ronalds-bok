export const fetchApiData = async () => {
  const response = await fetch(process.env.API_URL);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  const data = await response.json();
  return data;
};

export const fetchItemById = async (id) => {
  const apiUrl = `${process.env.API_URL}&filter[id]=${id}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  const data = await response.json();
  return data.data[0];
};
