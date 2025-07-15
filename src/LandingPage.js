import React from 'react';
import './LandingPage.css';
import { FiArrowRight, FiSearch, FiSmile, FiThumbsUp } from 'react-icons/fi';

function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-container">
      <header className="hero">
        <h1>✈️ TravelEase.ai</h1>
        <h2>Your AI Travel Buddy</h2>
        <p>Simplifying how India searches flights</p>
        <button onClick={onGetStarted}>
          Start Your Search <FiArrowRight />
        </button>
      </header>

      <section className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          <div className="step">
            <FiSearch size={32} />
            <p>Type your query, Hinglish works!</p>
          </div>
          <div className="step">
            <FiSmile size={32} />
            <p>AI predicts best price & options</p>
          </div>
          <div className="step">
            <FiThumbsUp size={32} />
            <p>You travel smart, stress-free</p>
          </div>
        </div>
      </section>

      <section className="why-us">
        <h3>Why TravelEase.ai?</h3>
        <ul>
          <li>No confusing filters</li>
          <li>Predictive pricing with AI</li>
          <li>Friendly for Hinglish & Indian languages</li>
          <li>Simple. Fun. Fast.</li>
        </ul>
      </section>

      <footer className="footer">
        <p>Built in India 🇮🇳 with ❤️</p>
      </footer>
    </div>
  );
}

export default LandingPage;
