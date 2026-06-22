import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';
import { FiSearch, FiTrendingDown, FiShield, FiLogOut } from 'react-icons/fi';
import { useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5055/api';

function formatExpiry(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return null; // not useful to show "expires in 3 days"
  if (h > 0) return `⏳ ${h}h ${m}m left`;
  return `⏳ ${m}m left`;
}

const DEAL_GRADIENTS = [
  'linear-gradient(135deg, #1a6cf0 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0891b2 0%, #1a6cf0 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
  'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
  'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
  'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
];

const destinations = [
  { name: 'Dubai', country: 'UAE', code: 'DXB', icon: '🏙️', gradient: 'linear-gradient(160deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'London', country: 'UK', code: 'LHR', icon: '🎡', gradient: 'linear-gradient(160deg, #4facfe 0%, #00b4d8 100%)' },
  { name: 'Toronto', country: 'Canada', code: 'YYZ', icon: '🍁', gradient: 'linear-gradient(160deg, #43e97b 0%, #0ba360 100%)' },
  { name: 'Bangkok', country: 'Thailand', code: 'BKK', icon: '⛩️', gradient: 'linear-gradient(160deg, #fa709a 0%, #fee140 100%)' },
];

function LandingPage({ onGetStarted, onGoLogin, onGoRegister }) {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [deals, setDeals] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/Cache/deals`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setDeals(Array.isArray(data) ? data : []))
      .catch(err => console.error('Deals fetch failed:', err));
  }, []);

  const handleSearch = () => {
    onGetStarted(query.trim() || null);
  };

  const handleDestinationClick = (cityName) => {
    setQuery(`Flights from Delhi to ${cityName}`);
    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => searchInputRef.current?.focus(), 400);
  };

  return (
    <div className="lp-wrapper">

      <nav className="lp-nav">
        <div className="lp-nav-logo"><Logo /></div>
        <div className="lp-nav-links">
          <a href="#deals" className="lp-nav-link">✈️ Today's Deals</a>
          <a href="https://t.me/TravelsPalDeals" target="_blank" rel="noopener noreferrer" className="lp-nav-link lp-nav-link-tg">
            Join Telegram →
          </a>
        </div>
        <div className="lp-nav-actions">
          {user ? (
            <>
              <span className="lp-nav-user">Hi, {user.firstName} 👋</span>
              <button className="btn-ghost lp-signout-btn" onClick={logout}>
                <FiLogOut size={14} style={{ marginRight: '5px' }} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={onGoLogin}>Sign In</button>
              <button className="btn-primary-sm" onClick={onGoRegister}>Sign Up Free</button>
            </>
          )}
        </div>
      </nav>

      <section className="lp-hero">
        <h1>Find Flights That Fit <span>Your Budget</span></h1>
        <p>Just describe your trip — AI will handle the rest</p>

        <div className="lp-search-card">
          <div className="lp-search-row">
            <div className="lp-input-group">
              <span className="input-icon">✈️</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder='e.g. "Flights from Delhi to Bangkok next week under $300"'
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className="lp-search-btn" onClick={handleSearch}>
              <FiSearch size={16} style={{ marginRight: '6px' }} />
              Search
            </button>
          </div>
          <div className="lp-ai-hint">
            <FiSearch size={13} />
            <span>Try: </span>
            <em>"Cheapest flight from Delhi to Dubai in December"</em>
            <span>&nbsp;·&nbsp;</span>
            <em>"Dubai se Bangkok ka sasta ticket"</em>
          </div>
        </div>
      </section>

      {deals.length > 0 && (
        <section id="deals" className="lp-section lp-deals-section">
          <h2>
            <img src="/logo.svg" alt="" width="32" height="32" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Today's Flight Deals
          </h2>
          <p className="lp-deals-subtitle">Live prices updated every morning from top Indian cities</p>
          <div className="deals-grid">
            {deals.map((d, i) => {
              const expiry = formatExpiry(d.expiresAt);
              return (
              <a
                key={d.origin + d.destination}
                href={d.bookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="deal-card"
              >
                <div className="deal-card-header" style={{ background: DEAL_GRADIENTS[i % DEAL_GRADIENTS.length] }}>
                  <div className="deal-card-route">
                    <span>{d.originCity}</span>
                    <img src="/logo.svg" alt="" width="18" height="18" style={{ verticalAlign: 'middle', opacity: 0.9 }} />
                    <span>{d.destinationCity}</span>
                  </div>
                  <div className="deal-country">{d.country}</div>
                </div>
                <div className="deal-card-body">
                  <div className="deal-price">₹{d.price.toLocaleString('en-IN')}</div>
                  <div className="deal-meta">
                    <span className={`deal-stops ${d.stops === 0 ? 'direct' : ''}`}>
                      {d.stops === 0 ? 'Direct' : `${d.stops} stop`}
                    </span>
                    {d.airline && <span className="deal-airline">{d.airline}</span>}
                  </div>
                  <div className="deal-badges">
                    {d.dealScore === 'amazing' && <span className="badge-score amazing">🔥 Amazing</span>}
                    {d.dealScore === 'good'    && <span className="badge-score good">✅ Good Deal</span>}
                    {d.isVisaFree             && <span className="badge-visa">🟢 Visa Free for Indians</span>}
                    {expiry && <span className="badge-expiry">{expiry}</span>}
                  </div>
                  <div className="deal-cta">Book Now ↗</div>
                </div>
              </a>
              );
            })}
          </div>
          <div className="deals-telegram-cta">
            <span>Get these deals every morning for free</span>
            <a href="https://t.me/TravelsPalDeals" target="_blank" rel="noopener noreferrer">
              Join on Telegram →
            </a>
          </div>
        </section>
      )}

      <section className="lp-section">
        <h2>Popular Destinations</h2>
        <div className="dest-grid">
          {destinations.map(d => (
            <div
              className="dest-card"
              key={d.code}
              style={{ background: d.gradient }}
              onClick={() => handleDestinationClick(d.name)}
            >
              <div className="dest-card-icon">{d.icon}</div>
              <div className="dest-card-body">
                <span className="dest-code">{d.code}</span>
                <h3>{d.name}</h3>
                <p>{d.country}</p>
                <span className="dest-card-cta">Search flights →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section lp-features">
        <h2>Why TravelsPal?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FiSearch size={26} /></div>
            <h4>AI-Powered Search</h4>
            <p>Type in plain English or Hinglish. No complicated forms needed.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiTrendingDown size={26} /></div>
            <h4>Price Predictions</h4>
            <p>Know when prices will drop before you book your ticket.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiShield size={26} /></div>
            <h4>Best Price Guarantee</h4>
            <p>We search hundreds of airlines to get you the lowest fare.</p>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <p>© 2025 TravelsPal — Smarter travel starts here</p>
      </footer>

    </div>
  );
}

export default LandingPage;
