// Fetch general data from the external API
export const fetchApiData = async () => {
  // Send GET request to the base API URL
  const response = await fetch(process.env.API_URL);
  // Throw error if response status is not OK (200–299)
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  // Parse and return JSON payload
  const data = await response.json();
  return data;
};

// Fetch a single item by its ID from the API
export const fetchItemById = async (id) => {
  // Append ID filter to the API URL
  const apiUrl = `${process.env.API_URL}&filter[id]=${id}`;
  // Send GET request for the specific item
  const response = await fetch(apiUrl);
  // Throw error if response status is not OK
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  // Parse JSON and return the first item in the data array
  const data = await response.json();
  return data.data[0];
};
