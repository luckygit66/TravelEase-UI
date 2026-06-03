// src/services/nlpParser.js

export const parseNaturalLanguage = (query) => {
  const lower = query.toLowerCase();

  let from = 'DEL';
  let to = 'DXB';
  let date = '2025-08-15';
  let passengers = 1;

  if (lower.includes('london')) to = 'LHR';
  if (lower.includes('new york')) to = 'JFK';
  if (lower.includes('dubai')) to = 'DXB';
  if (lower.includes('paris')) to = 'CDG';

  if (lower.includes('mumbai')) from = 'BOM';
  if (lower.includes('delhi')) from = 'DEL';
  if (lower.includes('bangalore')) from = 'BLR';

  return { from, to, date, passengers };
};

export const generateMockFlights = (parsedQuery) => {
  return [
    {
      id: 1,
      airline: 'Emirates',
      flightNumber: 'EK 501',
      aircraft: 'Boeing 777',
      departure: '10:00 AM',
      arrival: '2:00 PM',
      origin: parsedQuery.from,
      destination: parsedQuery.to,
      duration: '4h',
      stops: 0,
      price: 25000,
      airlineLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Emirates_logo.svg'
    },
    {
      id: 2,
      airline: 'Qatar Airways',
      flightNumber: 'QR 708',
      aircraft: 'Airbus A350',
      departure: '11:00 AM',
      arrival: '3:00 PM',
      origin: parsedQuery.from,
      destination: parsedQuery.to,
      duration: '4h',
      stops: 1,
      price: 27000,
      airlineLogo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Qatar_Airways_Logo.svg'
    },
    {
      id: 3,
      airline: 'Indigo',
      flightNumber: '6E 502',
      aircraft: 'A320neo',
      departure: '1:00 PM',
      arrival: '5:00 PM',
      origin: parsedQuery.from,
      destination: parsedQuery.to,
      duration: '4h',
      stops: 0,
      price: 22000,
      airlineLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/IndiGo_Logo.svg'
    },
  ];
};
