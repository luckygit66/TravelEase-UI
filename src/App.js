import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';
import LandingPage from './LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AgencySignupPage from './pages/AgencySignupPage';
import AuthGateModal from './components/AuthGateModal';
import './App.css';
import { FiLogOut, FiArrowRight, FiSend, FiShare2 } from 'react-icons/fi';
import { exploreDestinations, getPriceCalendar } from './services/flightService';
import CalendarView from './components/CalendarView';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5055/api';

const TRAVELPAYOUTS_MARKER = '437825';

function buildAviasalesUrl(from, dest, passengers = 1, returnDate = null) {
  return buildRouteUrl(from, dest.code, dest.date, passengers, returnDate);
}

function buildRouteUrl(from, to, date, passengers = 1, returnDate = null) {
  const [, month, day] = (date || '').split('-');
  if (!day || !month) return `https://www.aviasales.com/search/${from}0101${to}1?marker=${TRAVELPAYOUTS_MARKER}`;

  const [, rMonth, rDay] = (returnDate || '').split('-');
  const searchStr = rDay && rMonth
    ? `${from}${day}${month}${to}${passengers}${rDay}${rMonth}`
    : `${from}${day}${month}${to}${passengers}`;
  return `https://www.aviasales.com/search/${searchStr}?marker=${TRAVELPAYOUTS_MARKER}`;
}

function buildWhatsAppShareUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// new Date().toISOString() returns the UTC date, which is still "yesterday" for IST
// users between 12:00–5:30 AM local time (IST is UTC+5:30). Use local date parts instead.
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function RouteSearchCard({ from, to, date, pax, returnDate }) {
  const url = buildRouteUrl(from, to, date, pax, returnDate);
  const shareText = `✈️ Check out flights ${from} → ${to}${date ? ` on ${date}` : ''}${returnDate ? ` (return ${returnDate})` : ''}!\n${url}`;
  return (
    <div className="dest-result-card" style={{ maxWidth: 360 }}>
      <div className="drc-left">
        <div className="drc-code">{from} → {to}</div>
        <div className="drc-city">Live prices on Aviasales</div>
        <div className="drc-country">Real-time availability</div>
      </div>
      <div className="drc-right">
        {date && <div className="drc-date">{date}</div>}
        {returnDate && <div className="drc-date">Return: {returnDate}</div>}
        {pax > 1 && <div className="drc-date">{pax} passengers</div>}
        <div className="drc-btn-row">
          <a href={url} target="_blank" rel="noopener noreferrer" className="drc-btn">
            Check Live Price <FiArrowRight size={12} />
          </a>
          <a href={buildWhatsAppShareUrl(shareText)} target="_blank" rel="noopener noreferrer" className="drc-share-btn" title="Share on WhatsApp">
            <FiShare2 size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

function DestinationCard({ dest, from, onSearch, returnDate }) {
  const url = buildAviasalesUrl(from, dest, 1, returnDate);
  const shareText = `✈️ Check out flights to ${dest.city}, ${dest.country} on ${dest.date}${returnDate ? ` (return ${returnDate})` : ''}!\n${url}`;
  return (
    <div className="dest-result-card">
      <div className="drc-left">
        <div className="drc-code">{dest.code}</div>
        <div className="drc-city">{dest.city}</div>
        <div className="drc-country">{dest.country}</div>
        <div className="drc-stops-row">
          <span className={`drc-stop-badge ${dest.stops === 0 ? 'direct' : ''}`}>
            {dest.stops === 0 ? 'Direct' : `${dest.stops} stop`}
          </span>
          <span className="drc-airline">{dest.airline}</span>
        </div>
        {dest.dealScore === 'amazing' && <div className="drc-badge drc-badge-deal">🔥 Amazing deal</div>}
        {dest.dealScore === 'good' && <div className="drc-badge drc-badge-deal">✅ Good deal</div>}
        {dest.isVisaFree && <div className="drc-badge drc-badge-visa">🟢 Visa Free</div>}
      </div>
      <div className="drc-right">
        <div className="drc-date">{dest.date}</div>
        {returnDate && <div className="drc-date">Return: {returnDate}</div>}
        <div className="drc-btn-row">
          <a href={url} target="_blank" rel="noopener noreferrer" className="drc-btn">
            Check Live Price <FiArrowRight size={12} />
          </a>
          <a href={buildWhatsAppShareUrl(shareText)} target="_blank" rel="noopener noreferrer" className="drc-share-btn" title="Share on WhatsApp">
            <FiShare2 size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

function MainApp({ onGoHome, initialQuery = '', onRequestSignup }) {
  const { token, user, logout, isAnonymous } = useAuth();
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
        setLoading(false);
        logout();
        return;
      }
      if (!parseRes.ok) {
        pushMsg({ role: 'ai', text: "I couldn't understand that. Try: \"Flights from Delhi to Mumbai on 28 June\"" });
        setLoading(false); return;
      }

      const p = await parseRes.json();
      let from = p.from, to = p.to;
      const date = p.date || todayLocal();
      const { tripType, passengers, returnDate } = p;
      const pax = passengers || 1;

      let intent = p.searchIntent || (to ? 'route' : 'explore');

      // LLM sometimes swaps from/to (e.g. "Cheapest flights from Mumbai" → to=BOM, from=null).
      // Only correct this when the user's text actually said "from <city>" — otherwise a genuine
      // destination-only query ("Flights to Bangkok") should ask for the departure city instead.
      const saidFrom = /\bfrom\b/i.test(q);
      if (saidFrom && intent !== 'calendar' && !from && to) {
        from = to; to = null;
        if (intent === 'route') intent = 'explore';
      }

      if (intent === 'alert' || intent === 'remove_alert' || intent === 'list_alerts') {
        pushMsg({ role: 'ai', text: '🔔 Price alerts are available on our Telegram bot — message @TravelsPalBot (t.me/TravelsPalBot) and ask the same thing there.' });
      } else if (intent === 'calendar') {
        if (!from || !to) {
          pushMsg({ role: 'ai', text: "Please tell me both origin and destination for the calendar. Try: \"Cheapest days to fly Delhi to Bangkok in July\"" });
          setLoading(false); return;
        }
        // Ensure YYYY-MM format — LLM sometimes returns non-standard date strings
        const rawMonth = date ? date.slice(0, 7) : null;
        const month = /^\d{4}-\d{2}$/.test(rawMonth || '') ? rawMonth : todayLocal().slice(0, 7);
        try {
          const days = await getPriceCalendar(from, to, month, token);
          if (days?.length > 0) {
            pushMsg({
              role: 'ai',
              text: `Best days to fly ${from} → ${to} in ${month}. Click any date to check the live price on Aviasales:`,
              calendarData: { from, to, month, days },
            });
          } else {
            pushMsg({ role: 'ai', text: `No calendar data found for ${from} → ${to} in ${month}. Try a different month.` });
          }
        } catch (e) {
          pushMsg({ role: 'ai', text: `Couldn't load the calendar: ${e.message}` });
        }
      } else if (intent === 'explore') {
        if (!from) {
          pushMsg({ role: 'ai', text: "Which city would you like to fly from?" });
          setLoading(false); return;
        }
        try {
          const month = date ? date.slice(0, 7) : null;
          const destinations = await exploreDestinations(from, token, { month, maxBudget: p.maxBudget, visaFree: p.visaFree });
          if (destinations?.length > 0) {
            const budgetInfo = p.maxBudget ? ` under $${p.maxBudget.toLocaleString('en-US')}` : '';
            const monthInfo  = month ? ` in ${month}` : '';
            const visaInfo   = p.visaFree ? ' (visa-free for Indians)' : '';
            pushMsg({
              role: 'ai',
              text: `Here are the cheapest destinations from ${from}${monthInfo}${budgetInfo}${visaInfo}. Click any to check the live price:`,
              destinations,
              from,
            });
          } else {
            pushMsg({ role: 'ai', text: `Couldn't find destinations from ${from}. Try a different month or budget.` });
          }
        } catch (e) {
          pushMsg({ role: 'ai', text: `Couldn't explore destinations: ${e.message}` });
        }
      } else {  // route
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
            let shown = destinations;
            let exactNote = '';

            // exploreDestinations only ever returns the cheapest price in the whole
            // month — if the user asked for a specific day, check the calendar for
            // that exact day instead of silently showing a different date's price.
            if (p.hasSpecificDay && month) {
              try {
                const days = await getPriceCalendar(from, to, month, token);
                const exactDay = days?.find(d => d.date === date);
                if (exactDay) {
                  shown = [{ ...destinations[0], price: exactDay.price, date: exactDay.date, airline: exactDay.airline, stops: exactDay.stops }];
                } else {
                  exactNote = ` (no match for ${date} — showing the best alternative day in ${month})`;
                }
              } catch { /* keep month-cheapest result if calendar lookup fails */ }
            }

            const isRoundtrip = tripType === 'roundtrip' && !!returnDate;
            const tripLabel = isRoundtrip ? ` · Round trip (return ${returnDate})` : '';
            const paxInfo   = pax > 1 ? ` · ${pax} passengers` : '';
            pushMsg({
              role: 'ai',
              text: `Best options found · ${from} → ${to}${month ? ` · ${month}` : ''}${tripLabel}${paxInfo}${exactNote}`,
              destinations: shown,
              from,
              returnDate: isRoundtrip ? returnDate : null,
            });
          } else {
            // TravelPayouts has no cached data for this route — send directly to Aviasales
            pushMsg({
              role: 'ai',
              text: `I don't have cached prices for ${from} → ${to} right now. Click below to search live prices on Aviasales:`,
              routeCard: { from, to, date, pax, returnDate: tripType === 'roundtrip' ? returnDate : null },
            });
          }
        } catch (e) {
          const msg = e.message?.toLowerCase().includes('equal') || e.message?.toLowerCase().includes('same airport')
            ? "Origin and destination appear to be the same city. Please try two different cities."
            : `Couldn't fetch flights: ${e.message}`;
          pushMsg({ role: 'ai', text: msg });
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
          {isAnonymous ? (
            <button className="app-nav-signup" onClick={onRequestSignup}>Sign Up</button>
          ) : (
            <button className="app-nav-logout" onClick={() => { logout(); onGoHome(); }}>
              <FiLogOut size={15} style={{ marginRight: 5 }} /> Sign Out
            </button>
          )}
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
                  {msg.calendarData && (
                    <div className="chat-flights">
                      <CalendarView {...msg.calendarData} />
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
                            returnDate={msg.returnDate}
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

function isTokenExpired(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp * 1000 < Date.now();
  } catch { return true; }
}

function AppRouter() {
  const { realToken, logout } = useAuth();
  const [page, setPage] = useState(() => {
    if (window.location.pathname === '/agencies') return 'agency-signup';
    if (realToken && !isTokenExpired(realToken)) return 'app';
    return 'landing';
  });
  const [initialQuery, setInitialQuery] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  // Signup is optional — an expired real session just drops back to anonymous
  // (AuthContext auto-fetches a demo token), no forced redirect to login.
  useEffect(() => {
    if (realToken && isTokenExpired(realToken)) logout();
  }, [realToken, logout]);

  const goToApp = (query = '') => {
    setInitialQuery(query || '');
    setPage('app');
    setShowSignup(false);
  };

  if (page === 'login') return <LoginPage onSuccess={() => goToApp(initialQuery)} onGoRegister={() => setPage('register')} onGoHome={() => setPage('landing')} />;
  if (page === 'register') return <RegisterPage onSuccess={() => goToApp(initialQuery)} onGoLogin={() => setPage('login')} onGoHome={() => setPage('landing')} />;
  if (page === 'agency-signup') return <AgencySignupPage onGoHome={() => setPage('landing')} />;
  if (page === 'app') return (
    <>
      <MainApp onGoHome={() => setPage('landing')} initialQuery={initialQuery} onRequestSignup={() => setShowSignup(true)} />
      {showSignup && <AuthGateModal onSuccess={() => setShowSignup(false)} onClose={() => setShowSignup(false)} />}
    </>
  );

  return (
    <LandingPage
      onGetStarted={(query) => goToApp(query)}
      onGoLogin={() => setPage('login')}
      onGoRegister={() => setPage('register')}
    />
  );
}

function App() {
  return <AuthProvider><AppRouter /></AuthProvider>;
}

export default App;
