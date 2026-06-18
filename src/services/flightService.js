const BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5055/api'}/FlightAggregator`;

export const exploreDestinations = async (from, token, { to, month, maxBudget, visaFree } = {}) => {
  let url = `${BASE_URL}/explore?from=${from}`;
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
  const url = `${BASE_URL}/calendar?from=${from}&to=${to}&month=${month}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'Failed to fetch price calendar');
  }
  return response.json();
};

export const searchFlights = async (from, to, date, token, { returnDate, tripType, passengers } = {}) => {
  let url = `${BASE_URL}/search?from=${from}&to=${to}&date=${date}`;
  if (tripType)    url += `&tripType=${tripType}`;
  if (returnDate)  url += `&returnDate=${returnDate}`;
  if (passengers)  url += `&passengers=${passengers}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'Failed to fetch flights');
  }
  const raw = await response.json();
  if (raw?.error) throw new Error(raw.error);
  return parseFlights(raw, passengers || 1);
};

function parseFlights(raw, passengers = 1) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const all = [
      ...(parsed.best_flights || []),
      ...(parsed.other_flights || []),
    ];
    return all.map((item) => {
      const legs = item.flights || [];
      const firstLeg = legs[0] || {};
      const lastLeg = legs[legs.length - 1] || firstLeg;
      const stops = legs.length - 1;
      const pricePerPerson = item.price || null;

      return {
        airline: firstLeg.airline || 'Unknown Airline',
        airlineLogo: firstLeg.airline_logo || null,
        flightNumber: firstLeg.flight_number || '',
        from: firstLeg.departure_airport?.id || '',
        fromName: firstLeg.departure_airport?.name || '',
        to: lastLeg.arrival_airport?.id || '',
        toName: lastLeg.arrival_airport?.name || '',
        departure: firstLeg.departure_airport?.time || '',
        arrival: lastLeg.arrival_airport?.time || '',
        duration: item.total_duration || 0,
        stops,
        stopCities: legs.slice(0, -1).map(l => l.arrival_airport?.id).filter(Boolean),
        price: pricePerPerson,
        totalPrice: pricePerPerson ? pricePerPerson * passengers : null,
        passengers,
      };
    }).filter(f => f.price);
  } catch {
    return [];
  }
}
