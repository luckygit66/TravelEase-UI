import React from 'react';
import { FiCalendar, FiDollarSign, FiAirplay } from 'react-icons/fi';

function FlightResultCard({ flight }) {
  if (!flight) return null;

  return (
    <div className="flight-card">
      <h4><FiAirplay /> Airline: {flight.airline}</h4>
      <p><FiCalendar /> Departure: {flight.departure_at}</p>
      <p><FiCalendar /> Return: {flight.return_at}</p>
      <p><FiDollarSign /> Price: ${flight.price}</p>
      <p>Flight Number: {flight.flight_number}</p>
    </div>
  );
}

export default FlightResultCard;
