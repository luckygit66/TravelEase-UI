import React, { useState } from 'react';
import LandingPage from './LandingPage';
import './App.css';
import { FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { searchFlights } from './services/flightService';
import FlightResultCard from './components/FlightResultCard.jsx';
import logo from './assets/travelspal-logo.png'; // ✅ Import the logo


function App() {
  const [showApp, setShowApp] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [aggregatorResult, setAggregatorResult] = useState(null);
  const [loadingAggregator, setLoadingAggregator] = useState(false);

  const handleSearch = async () => {
    if (!userInput.trim()) {
      setError('Please enter your flight search details.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5055/FlightSearch/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInput)
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      const pricePrediction = {
        ...data,
        predictedPriceMin: 5500,
        predictedPriceMax: 8500
      };

      setResult(pricePrediction);
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAggregatorSearch = async () => {
    if (!from || !to || !date) {
      alert('Please provide From, To, and Date.');
      return;
    }

    setLoadingAggregator(true);
    const data = await searchFlights(from, to, date);
    setAggregatorResult(data);
    setLoadingAggregator(false);
  };

  if (!showApp) {
    return <LandingPage onGetStarted={() => setShowApp(true)} />;
  }

  return (
    <div className="container">
      <img src={logo} alt="TravelsPal Logo" style={{ width: '180px', marginBottom: '1rem' }} />
      <h2>The only travel platform that tells you where to go, when to book, and how to save the most.</h2>

      {/* GPT-based Free-text search */}
      <input
        type="text"
        placeholder="e.g., Find me a flight from Delhi to Dubai next month"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search with AI'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {!result && !error && !loading && (
        <div style={{ marginTop: '2rem', color: '#555' }}>
          <p>Start by typing your destination, budget, and month ✈️</p>
        </div>
      )}

      {result && (
        <div className="result-card">
          <h3>Flight Search Result ✈️</h3>
          <p><FiMapPin /> <strong>From:</strong> {result.from || "N/A"}</p>
          <p><FiMapPin /> <strong>To:</strong> {result.to || "N/A"}</p>
          <p><FiCalendar /> <strong>Month:</strong> {result.month || "N/A"}</p>
          <p><FiDollarSign /> <strong>Max Budget:</strong> ₹{result.maxBudget || "N/A"}</p>
          <p><FiDollarSign /> <strong>Predicted Price Range:</strong> ₹{result.predictedPriceMin} - ₹{result.predictedPriceMax}</p>
        </div>
      )}

      <h2 style={{ marginTop: '2rem' }}>Or Search By Routes</h2>
      <div className="input-group">
        <input type="text" placeholder="From (e.g. DEL)" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="text" placeholder="To (e.g. DXB)" value={to} onChange={(e) => setTo(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={handleAggregatorSearch} disabled={loadingAggregator}>
          {loadingAggregator ? 'Searching...' : 'Search Flights'}
        </button>
      </div>

      {aggregatorResult && aggregatorResult.data && Object.keys(aggregatorResult.data).length > 0 && (
        <>
          <h3>Aggregator Results</h3>
          {Object.keys(aggregatorResult.data).map((dest) =>
            Object.keys(aggregatorResult.data[dest]).map((key) => (
              <FlightResultCard key={`${dest}-${key}`} flight={aggregatorResult.data[dest][key]} />
            ))
          )}
        </>
      )}

      {aggregatorResult && aggregatorResult.data && Object.keys(aggregatorResult.data).length === 0 && (
        <p>No flights found for the selected route and date.</p>
      )}
    </div>
  );
}

export default App;
