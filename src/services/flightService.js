const BASE_URL = "http://localhost:5055/api/FlightAggregator";

export const searchFlights = async (from, to, date) => {
  try {
    const response = await fetch(`${BASE_URL}/search?from=${from}&to=${to}&date=${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch flights');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching flights:', error);
    return null;
  }
};
