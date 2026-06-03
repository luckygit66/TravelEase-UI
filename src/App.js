import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';
import LandingPage from './LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';
import { FiSearch, FiLogOut, FiClock, FiArrowRight } from 'react-icons/fi';
import { searchFlights } from './services/flightService';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5055/api';

const MOCK_FLIGHTS = [
  { airline: 'IndiGo', flightNumber: '6E-1425', from: 'DEL', to: 'DXB', departure: '06:30', arrival: '08:45', duration: 195, stops: 0, price: 15299 },
  { airline: 'Air Arabia', flightNumber: 'G9-412', from: 'DEL', to: 'DXB', departure: '11:15', arrival: '13:40', duration: 205, stops: 0, price: 13850 },
  { airline: 'Emirates', flightNumber: 'EK-512', from: 'DEL', to: 'DXB', departure: '14:00', arrival: '16:20', duration: 200, stops: 0, price: 22400 },
  { airline: 'SpiceJet', flightNumber: 'SG-7210', from: 'DEL', to: 'DXB', departure: '18:30', arrival: '23:10', duration: 280, stops: 1, price: 11600 },
];

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function FlightCard({ flight, cheapest }) {
  return (
    <div className={`flight-result-card ${cheapest ? 'cheapest' : ''}`}>
      {cheapest && <div className="cheapest-tag">Best Price</div>}
      <div className="fc-left">
        {flight.airlineLogo
          ? <img src={flight.airlineLogo} alt={flight.airline} className="fc-logo" onError={e => { e.target.style.display='none'; }} />
          : <div className="fc-logo-placeholder">{flight.airline?.charAt(0)}</div>
        }
        <div className="fc-airline">{flight.airline}</div>
        <div className="fc-number">{flight.flightNumber}</div>
      </div>
      <div className="fc-route">
        <div className="fc-time-block">
          <span className="fc-time">{flight.departure}</span>
          <span className="fc-code">{flight.from}</span>
        </div>
        <div className="fc-path">
          <div className="fc-duration"><FiClock size={11} /> {formatDuration(flight.duration)}</div>
          <div className="fc-line">
            <div className="fc-dot" />
            <div className="fc-dash" />
            <div className={`fc-stop-label ${flight.stops === 0 ? 'direct' : ''}`}>
              {flight.stops === 0
                ? 'Direct'
                : `${flight.stops} Stop${flight.stopCities?.length ? ` via ${flight.stopCities.join(', ')}` : ''}`}
            </div>
            <div className="fc-dash" />
            <div className="fc-dot" />
          </div>
        </div>
        <div className="fc-time-block right">
          <span className="fc-time">{flight.arrival}</span>
          <span className="fc-code">{flight.to}</span>
        </div>
      </div>
      <div className="fc-right">
        <div className="fc-price">₹{flight.price?.toLocaleString('en-IN')}</div>
        <div className="fc-per">per person</div>
        <button className="fc-book-btn">Book <FiArrowRight size={13} /></button>
      </div>
    </div>
  );
}

function MainApp({ onGoHome, initialQuery = '' }) {
  const { token, user, logout } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [parsed, setParsed] = useState(null);
  const [flights, setFlights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usedMock, setUsedMock] = useState(false);

  // Auto-search if query came from landing page
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initialQuery.trim()) handleSearch(initialQuery); }, []);

  const handleSearch = async (overrideQuery) => {
    const q = (typeof overrideQuery === 'string' ? overrideQuery : query).trim();
    if (!q) { setError('Please describe your trip to search.'); return; }

    setLoading(true);
    setError('');
    setParsed(null);
    setFlights(null);
    setUsedMock(false);

    // Step 1: Try to parse via AI
    try {
      const parseRes = await fetch(`${API}/FlightSearch/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(q),
      });

      if (parseRes.status === 401) {
        // Token expired — still show mock results
        setFlights(MOCK_FLIGHTS);
        setUsedMock(true);
        setLoading(false);
        return;
      }

      if (parseRes.ok) {
        const parsedData = await parseRes.json();
        setParsed(parsedData);

        // Step 2: Use parsed IATA codes + date for real search
        const from = parsedData.from;
        const to = parsedData.to;
        const date = parsedData.date || new Date().toISOString().split('T')[0];

        if (from && to) {
          try {
            const flightData = await searchFlights(from, to, date, token);
            if (flightData && flightData.length > 0) {
              setFlights(flightData);
            } else {
              setFlights(MOCK_FLIGHTS);
              setUsedMock(true);
            }
          } catch {
            setFlights(MOCK_FLIGHTS);
            setUsedMock(true);
          }
        } else {
          setFlights(MOCK_FLIGHTS);
          setUsedMock(true);
        }
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Parse API unreachable:', e.message);
    }

    // Fallback if parse failed
    setFlights(MOCK_FLIGHTS);
    setUsedMock(true);

    setLoading(false);
  };

  const cheapestPrice = flights ? Math.min(...flights.map(f => f.price || Infinity)) : null;

  return (
    <div>
      <nav className="app-nav">
        <span onClick={onGoHome} style={{ cursor: 'pointer' }}>
          <Logo iconSize={30} />
        </span>
        <div className="app-nav-right">
          {user && <span className="app-nav-user">Hi, {user.firstName} 👋</span>}
          <button className="app-nav-logout" onClick={() => { logout(); onGoHome(); }}>
            <FiLogOut size={15} style={{ marginRight: '5px' }} /> Sign Out
          </button>
        </div>
      </nav>

      <div className="app-page">
        {/* Search Bar */}
        <div className="ai-search-card">
          <div className="ai-input-row">
            <div className="ai-input-wrap">
              <FiSearch size={16} color="#aaa" style={{ marginRight: '8px', flexShrink: 0 }} />
              <input
                type="text"
                placeholder='e.g. "Flights from Delhi to Dubai next week under ₹20,000"'
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className="btn-ai-search" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
          {error && <p className="search-error">{error}</p>}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="search-loading">
            <div className="loading-plane">✈️</div>
            <p>Finding the best flights for you…</p>
          </div>
        )}

        {/* Results */}
        {!loading && flights && (
          <div className="results-section">
            {/* Query Summary */}
            {parsed && (
              <div className="query-summary">
                <span className="qs-label">AI understood:</span>
                <span className="qs-chip">{parsed.from || '—'}</span>
                <FiArrowRight size={13} color="#888" />
                <span className="qs-chip">{parsed.to || '—'}</span>
                {parsed.date && <span className="qs-chip">{parsed.date}</span>}
                {parsed.maxBudget && <span className="qs-chip">Under ₹{parsed.maxBudget?.toLocaleString('en-IN')}</span>}
                {usedMock && <span className="qs-mock">· Sample results shown</span>}
              </div>
            )}

            {/* Sort info */}
            <div className="results-header">
              <span className="results-count">{flights.length} flights found</span>
              <span className="results-sort">Sorted by price</span>
            </div>

            {/* Flight Cards */}
            <div className="flights-list">
              {[...flights]
                .sort((a, b) => (a.price || 0) - (b.price || 0))
                .map((flight, i) => (
                  <FlightCard
                    key={i}
                    flight={flight}
                    cheapest={flight.price === cheapestPrice}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !flights && !error && (
          <div className="search-empty">
            <div style={{ fontSize: '3rem' }}>✈️</div>
            <p>Describe your trip above and let AI find the best flights</p>
            <span>Try: "Cheapest flight from Mumbai to Bangkok in July"</span>
          </div>
        )}
      </div>

      <footer className="app-footer">© 2025 TravelEase — Smarter travel starts here</footer>
    </div>
  );
}

function AppRouter() {
  const { token } = useAuth();
  const [page, setPage] = useState('landing');
  const [initialQuery, setInitialQuery] = useState('');

  const goToApp = (query = '') => {
    setInitialQuery(query || '');
    setPage('app');
  };

  const handleGetStarted = (query) => {
    if (token) goToApp(query);
    else { setInitialQuery(query || ''); setPage('login'); }
  };

  if (page === 'login') return <LoginPage onSuccess={() => goToApp(initialQuery)} onGoRegister={() => setPage('register')} onGoHome={() => setPage('landing')} />;
  if (page === 'register') return <RegisterPage onSuccess={() => goToApp(initialQuery)} onGoLogin={() => setPage('login')} onGoHome={() => setPage('landing')} />;
  if (page === 'app') return <MainApp onGoHome={() => setPage('landing')} initialQuery={initialQuery} />;

  return (
    <LandingPage
      onGetStarted={handleGetStarted}
      onGoLogin={() => setPage('login')}
      onGoRegister={() => setPage('register')}
    />
  );
}

function App() {
  return <AuthProvider><AppRouter /></AuthProvider>;
}

export default App;
