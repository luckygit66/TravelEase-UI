const BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5055/api'}/FlightAggregator`;

export const searchFlights = async (from, to, date, token) => {
  const response = await fetch(`${BASE_URL}/search?from=${from}&to=${to}&date=${date}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch flights');
  const raw = await response.json();
  return parseFlights(raw);
};

function parseFlights(raw) {
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
        price: item.price || null,
      };
    }).filter(f => f.price);
  } catch {
    return [];
  }
}
