import React, { useState } from 'react';
import './LandingPage.css';
import { FiSearch, FiTrendingDown, FiShield, FiLogOut } from 'react-icons/fi';
import { useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';

const destinations = [
  { name: 'Dubai', country: 'UAE', code: 'DXB', price: 'From ₹15,000', icon: '🏙️', gradient: 'linear-gradient(160deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'London', country: 'UK', code: 'LHR', price: 'From ₹45,000', icon: '🎡', gradient: 'linear-gradient(160deg, #4facfe 0%, #00b4d8 100%)' },
  { name: 'Toronto', country: 'Canada', code: 'YYZ', price: 'From ₹65,000', icon: '🍁', gradient: 'linear-gradient(160deg, #43e97b 0%, #0ba360 100%)' },
  { name: 'Bangkok', country: 'Thailand', code: 'BKK', price: 'From ₹12,000', icon: '⛩️', gradient: 'linear-gradient(160deg, #fa709a 0%, #fee140 100%)' },
];

function LandingPage({ onGetStarted, onGoLogin, onGoRegister }) {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');

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
            <em>"Cheapest flight from Lahore to London in July"</em>
            <span>&nbsp;·&nbsp;</span>
            <em>"Dubai se Bangkok ka sasta ticket"</em>
          </div>
        </div>
      </section>

      <section className="lp-section">
        <h2>Popular Destinations</h2>
        <div className="dest-grid">
          {destinations.map(d => (
            <div
              className="dest-card"
              key={d.code}
              style={{ background: d.gradient }}
              onClick={onGetStarted}
            >
              <div className="dest-card-icon">{d.icon}</div>
              <div className="dest-card-body">
                <span className="dest-code">{d.code}</span>
                <h3>{d.name}</h3>
                <p>{d.country}</p>
                <span className="dest-price">{d.price}</span>
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
