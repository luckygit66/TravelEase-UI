import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';
import LandingPage from './LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';
import { FiLogOut, FiClock, FiArrowRight, FiSend } from 'react-icons/fi';
import { exploreDestinations } from './services/flightService';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5055/api';

const TRAVELPAYOUTS_MARKER = '437825';

function buildBookingUrl(flight) {
  const [, month, day] = (flight.departure?.split(' ')[0] || '').split('-');
  const pax = flight.passengers || 1;
  const searchStr = day && month ? `${flight.from}${day}${month}${flight.to}${pax}` : `${flight.from}0101${flight.to}1`;
  return `https://www.aviasales.com/search/${searchStr}?marker=${TRAVELPAYOUTS_MARKER}`;
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

function buildAviasalesUrl(from, dest, passengers = 1) {
  const [, month, day] = (dest.date || '').split('-');
  const searchStr = day && month ? `${from}${day}${month}${dest.code}${passengers}` : `${from}0101${dest.code}1`;
  return `https://www.aviasales.com/search/${searchStr}?marker=${TRAVELPAYOUTS_MARKER}`;
}

function buildRouteUrl(from, to, date, passengers = 1) {
  const [, month, day] = (date || '').split('-');
  const searchStr = day && month ? `${from}${day}${month}${to}${passengers}` : `${from}0101${to}1`;
  return `https://www.aviasales.com/search/${searchStr}?marker=${TRAVELPAYOUTS_MARKER}`;
}

function RouteSearchCard({ from, to, date, pax }) {
  return (
    <div className="dest-result-card" style={{ maxWidth: 360 }}>
      <div className="drc-left">
        <div className="drc-code">{from} → {to}</div>
        <div className="drc-city">Live prices on Aviasales</div>
        <div className="drc-country">Real-time availability</div>
      </div>
      <div className="drc-right">
        {date && <div className="drc-date">{date}</div>}
        {pax > 1 && <div className="drc-date">{pax} passengers</div>}
        <a
          href={buildRouteUrl(from, to, date, pax)}
          target="_blank"
          rel="noopener noreferrer"
          className="drc-btn"
        >
          Search Flights <FiArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}

function DestinationCard({ dest, from, onSearch }) {
  return (
    <div className="dest-result-card">
      <div className="drc-left">
        <div className="drc-code">{dest.code}</div>
        <div className="drc-city">{dest.city}</div>
        <div className="drc-country">{dest.country}</div>
        <div className="drc-meta">{dest.stops === 0 ? 'Direct' : `${dest.stops} stop`} · {dest.airline}</div>
      </div>
      <div className="drc-right">
        <div className="drc-price">from ₹{dest.price.toLocaleString('en-IN')}</div>
        <div className="drc-date">{dest.date}</div>
        <a
          href={buildAviasalesUrl(from, dest)}
          target="_blank"
          rel="noopener noreferrer"
          className="drc-btn"
        >
          Book Now <FiArrowRight size={12} />
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
      // Build conversation history (skip greeting + typing indicators, cap at 6)
      const history = messages
        .filter(m => m.id !== 0 && !m.typing)
        .slice(-6)
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

      const parseRes = await fetch(`${API}/FlightSearch/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: q, history }),
      });

      removeTyping();

      if (parseRes.status === 401) {
        logout();
        return;
      }
      if (!parseRes.ok) {
        pushMsg({ role: 'ai', text: "I couldn't understand that. Try: \"Flights from Delhi to Mumbai on 28 June\"" });
        setLoading(false); return;
      }

      const p = await parseRes.json();
      const from = p.from, to = p.to;
      const date = p.date || new Date().toISOString().split('T')[0];
      const { tripType, passengers } = p;
      const pax = passengers || 1;

      const intent = p.searchIntent || (to ? 'route' : 'explore');

      if (intent === 'explore') {
        if (!from) {
          pushMsg({ role: 'ai', text: "Which city would you like to fly from?" });
          setLoading(false); return;
        }
        try {
          const month = date ? date.slice(0, 7) : null;
          const destinations = await exploreDestinations(from, token, { month, maxBudget: p.maxBudget, visaFree: p.visaFree });
          if (destinations?.length > 0) {
            const budgetInfo = p.maxBudget ? ` under ₹${p.maxBudget.toLocaleString('en-IN')}` : '';
            const monthInfo  = month ? ` in ${month}` : '';
            const visaInfo   = p.visaFree ? ' (visa-free for Indians)' : '';
            pushMsg({
              role: 'ai',
              text: `Here are the cheapest destinations from ${from}${monthInfo}${budgetInfo}${visaInfo}. Click any to search flights:`,
              destinations,
              from,
            });
          } else {
            pushMsg({ role: 'ai', text: `Couldn't find destinations from ${from}. Try a different month or budget.` });
          }
        } catch (e) {
          pushMsg({ role: 'ai', text: `Couldn't explore destinations: ${e.message}` });
        }
      } else {
        if (!from && to) {
          pushMsg({ role: 'ai', text: `Which city are you flying from? For example: "Flights from Delhi to ${to}"` });
          setLoading(false); return;
        }
        if (!from || !to) {
          pushMsg({ role: 'ai', text: "I couldn't detect origin or destination. Try: \"Flights from Delhi to Mumbai on 28 June\"" });
          setLoading(false); return;
        }
        try {
          const month = date ? date.slice(0, 7) : null;
          const destinations = await exploreDestinations(from, token, { to, month, maxBudget: p.maxBudget, visaFree: p.visaFree });
          if (destinations?.length > 0) {
            const tripLabel = tripType === 'roundtrip' ? ' · Round trip' : '';
            const paxInfo   = pax > 1 ? ` · ${pax} passengers` : '';
            pushMsg({
              role: 'ai',
              text: `Best prices found · ${from} → ${to}${month ? ` · ${month}` : ''}${tripLabel}${paxInfo}`,
              destinations,
              from,
            });
          } else {
            // TravelPayouts has no cached data for this route — send directly to Aviasales
            pushMsg({
              role: 'ai',
              text: `I don't have cached prices for ${from} → ${to} right now. Click below to search live prices on Aviasales:`,
              routeCard: { from, to, date, pax },
            });
          }
        } catch (e) {
          pushMsg({ role: 'ai', text: `Couldn't fetch flights: ${e.message}` });
        }
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
                  {msg.routeCard && (
                    <div className="chat-flights">
                      <RouteSearchCard {...msg.routeCard} />
                    </div>
                  )}
                  {msg.destinations?.length > 0 && (
                    <div className="chat-flights">
                      <div className="dest-results-grid">
                        {msg.destinations.map((dest, i) => (
                          <DestinationCard
                            key={i}
                            dest={dest}
                            from={msg.from}
                          />
                        ))}
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
