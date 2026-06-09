import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';
import LandingPage from './LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';
import { FiLogOut, FiClock, FiArrowRight, FiSend } from 'react-icons/fi';
import { searchFlights } from './services/flightService';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5055/api';

const TRAVELPAYOUTS_MARKER = '437825';

function buildBookingUrl(flight) {
  const date = flight.departure?.split(' ')[0] || '';
  return `https://www.aviasales.com/?origin=${flight.from}&destination=${flight.to}&depart_date=${date}&one_way=y&marker=${TRAVELPAYOUTS_MARKER}`;
}


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
        {flight.passengers > 1 && (
          <div className="fc-total">₹{flight.totalPrice?.toLocaleString('en-IN')} total</div>
        )}
        <a
          href={buildBookingUrl(flight)}
          target="_blank"
          rel="noopener noreferrer"
          className="fc-book-btn"
        >
          Book <FiArrowRight size={13} />
        </a>
      </div>
    </div>
  );
}

function MainApp({ onGoHome, initialQuery = '' }) {
  const { token, user, logout } = useAuth();
  const firstName = user?.firstName || 'there';

  const [messages, setMessages] = useState([{
    id: 0, role: 'ai',
    text: `Hi ${firstName}! I'm your AI travel assistant.\n\nJust tell me where you want to fly and I'll find the best options. Try:\n• "Flights from Delhi to Mumbai next Friday"\n• "4 tickets from Bangalore to Bangkok in July"\n• "Cheapest round trip Delhi to London next month"`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initialQuery.trim()) handleSend(initialQuery); }, []);

  const pushMsg = (msg) => setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);

  const handleSend = async (override) => {
    const q = (typeof override === 'string' ? override : input).trim();
    if (!q || loading) return;
    setInput('');
    pushMsg({ role: 'user', text: q });
    setLoading(true);

    const typingId = Date.now();
    setMessages(prev => [...prev, { id: typingId, role: 'ai', typing: true }]);

    const removeTyping = () => setMessages(prev => prev.filter(m => m.id !== typingId));

    try {
      const parseRes = await fetch(`${API}/FlightSearch/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(q),
      });

      removeTyping();

      if (parseRes.status === 401) {
        pushMsg({ role: 'ai', text: 'Your session expired. Please sign in again.' });
        setLoading(false); return;
      }
      if (!parseRes.ok) {
        pushMsg({ role: 'ai', text: "I couldn't understand that. Try: \"Flights from Delhi to Mumbai on 28 June\"" });
        setLoading(false); return;
      }

      const p = await parseRes.json();
      const from = p.from, to = p.to;
      const date = p.date || new Date().toISOString().split('T')[0];
      const { returnDate, tripType, passengers } = p;
      const pax = passengers || 1;

      if (!from || !to) {
        pushMsg({ role: 'ai', text: "I couldn't detect origin or destination. Could you be more specific? e.g. \"Flights from Delhi to Mumbai on 28 June\"" });
        setLoading(false); return;
      }

      try {
        const flights = await searchFlights(from, to, date, token, { returnDate, tripType, passengers: pax });
        if (flights?.length > 0) {
          const tripLabel  = tripType === 'roundtrip' ? 'Round trip' : 'One way';
          const returnInfo = returnDate ? ` · Return ${returnDate}` : '';
          const paxInfo    = pax > 1 ? ` · ${pax} passengers` : '';
          pushMsg({
            role: 'ai',
            text: `Found ${flights.length} flights · ${from} → ${to} · ${date}${returnInfo} · ${tripLabel}${paxInfo}`,
            flights,
          });
        } else {
          pushMsg({ role: 'ai', text: `No flights found for ${from} → ${to} on ${date}. Want to try a different date or route?` });
        }
      } catch (e) {
        pushMsg({ role: 'ai', text: `Couldn't fetch flights: ${e.message}` });
      }
    } catch (e) {
      removeTyping();
      pushMsg({ role: 'ai', text: 'Something went wrong. Please try again.' });
    }

    setLoading(false);
  };

  return (
    <div className="chat-page">
      <nav className="app-nav">
        <span onClick={onGoHome} style={{ cursor: 'pointer' }}><Logo iconSize={30} /></span>
        <div className="app-nav-right">
          {user && <span className="app-nav-user">Hi, {user.firstName} 👋</span>}
          <button className="app-nav-logout" onClick={() => { logout(); onGoHome(); }}>
            <FiLogOut size={15} style={{ marginRight: 5 }} /> Sign Out
          </button>
        </div>
      </nav>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-msg ${msg.role}`}>
            {msg.role === 'ai' && <div className="chat-avatar">✈️</div>}
            <div className="chat-content">
              {msg.typing ? (
                <div className="chat-bubble typing">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              ) : (
                <>
                  <div className="chat-bubble">
                    {msg.text.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                  </div>
                  {msg.flights?.length > 0 && (
                    <div className="chat-flights">
                      <div className="results-header">
                        <span className="results-count">{msg.flights.length} flights found</span>
                        <span className="results-sort">Sorted by price</span>
                      </div>
                      <div className="flights-list">
                        {[...msg.flights].sort((a, b) => (a.price||0) - (b.price||0)).map((f, i) => {
                          const cheapest = f.price === Math.min(...msg.flights.map(x => x.price || Infinity));
                          return <FlightCard key={i} flight={f} cheapest={cheapest} />;
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="chat-avatar user-avatar">{firstName.charAt(0).toUpperCase()}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <div className="chat-input-wrap">
          <input
            type="text"
            placeholder='Ask me anything… "Cheapest flights from Mumbai to Bangkok in July"'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
            autoFocus
          />
          <button className="chat-send-btn" onClick={() => handleSend()} disabled={loading || !input.trim()}>
            <FiSend size={16} />
          </button>
        </div>
      </div>
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
