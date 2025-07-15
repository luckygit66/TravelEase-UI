import React, { useState } from 'react';
import LandingPage from './LandingPage';
import './App.css';
import { FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';

function App() {
  const [showApp, setShowApp] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  if (!showApp) {
    return <LandingPage onGetStarted={() => setShowApp(true)} />;
  }

  return (
    <div className="container">
      <h1>TravelEase.ai</h1>
      <h2>Simplify Your Flight Search</h2>

      <input
        type="text"
        placeholder="e.g., Find me a flight from Delhi to Dubai next month"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
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
    </div>
  );
}

export default App;
