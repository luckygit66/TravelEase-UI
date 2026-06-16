import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { FiSearch, FiTrendingDown, FiShield, FiLogOut } from 'react-icons/fi';
import { useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5055/api';

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

  useEffect(() => {
    fetch(`${API_BASE}/Cache/deals`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setDeals(Array.isArray(data) ? data : []))
      .catch(err => console.error('Deals fetch failed:', err));
  }, []);

  const handleSearch = () => {
    onGetStarted(query.trim() || null);
  };

  return (
    <div className="lp-wrapper">

      <nav className="lp-nav">
        <div className="lp-nav-logo"><Logo /></div>
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
                type="text"
                placeholder='e.g. "Flights from Delhi to Bangkok next week under ₹20,000"'
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
        <section className="lp-section lp-deals-section">
          <h2>✈️ Today's Flight Deals</h2>
          <p className="lp-deals-subtitle">Live prices updated every morning from top Indian cities</p>
          <div className="deals-grid">
            {deals.map(d => (
              <a
                key={d.origin + d.destination}
                href={d.bookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="deal-card"
              >
                <div className="deal-card-route">
                  <span className="deal-origin">{d.originCity}</span>
                  <span className="deal-arrow">→</span>
                  <span className="deal-dest">{d.destinationCity}</span>
                </div>
                <div className="deal-country">{d.country}</div>
                <div className="deal-price">₹{d.price.toLocaleString('en-IN')}</div>
                <div className="deal-meta">
                  <span className={`deal-stops ${d.stops === 0 ? 'direct' : ''}`}>
                    {d.stops === 0 ? 'Direct' : `${d.stops} stop`}
                  </span>
                  {d.airline && <span className="deal-airline">{d.airline}</span>}
                </div>
                <div className="deal-cta">Book Now ↗</div>
              </a>
            ))}
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
              onClick={() => onGetStarted(`Flights to ${d.name}`)}
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
