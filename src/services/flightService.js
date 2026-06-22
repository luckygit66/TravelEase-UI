const BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5055/api'}/FlightAggregator`;

export const exploreDestinations = async (from, token, { to, month, maxBudget, visaFree } = {}) => {
  let url = `${BASE_URL}/explore?from=${from}&currency=usd`;
  if (to)        url += `&to=${to}`;
  if (month)     url += `&month=${month}`;
  if (maxBudget) url += `&maxBudget=${maxBudget}`;
  if (visaFree)  url += `&visaFree=true`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'Failed to explore destinations');
  }
  return response.json();
};

export const getPriceCalendar = async (from, to, month, token) => {
  const url = `${BASE_URL}/calendar?from=${from}&to=${to}&month=${month}&currency=usd`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'Failed to fetch price calendar');
  }
  return response.json();
};
