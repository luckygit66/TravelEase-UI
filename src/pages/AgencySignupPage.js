import React, { useState } from 'react';
import './AuthPage.css';
import Logo from '../components/Logo';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5055/api';

const CURRENCIES = [
  { code: 'usd', label: 'USD ($) — USA, Canada' },
  { code: 'aed', label: 'AED (د.إ) — UAE' },
  { code: 'gbp', label: 'GBP (£) — UK' },
  { code: 'eur', label: 'EUR (€) — Europe' },
  { code: 'aud', label: 'AUD (A$) — Australia' },
  { code: 'sgd', label: 'SGD (S$) — Singapore' },
  { code: 'inr', label: 'INR (₹) — India' },
];

function AgencySignupPage({ onGoHome }) {
  const [form, setForm] = useState({ name: '', email: '', currency: 'usd' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/Agency/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(result.embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo" onClick={onGoHome}><Logo iconSize={28} /></div>
          <h2>You're all set, {result.name}! 🎉</h2>
          <p className="auth-sub">Paste this one line into your website to add the AI chat widget.</p>

          <div style={{ background: '#f5f7fb', borderRadius: 10, padding: '14px', fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '16px', border: '1px solid #e4e8f0' }}>
            {result.embedSnippet}
          </div>

          <button type="button" className="auth-btn" style={{ marginTop: '14px' }} onClick={copySnippet}>
            {copied ? 'Copied ✓' : 'Copy embed code'}
          </button>

          <p className="auth-sub" style={{ marginTop: '20px', fontSize: '13px' }}>
            Your API key: <strong>{result.apiKey}</strong><br />
            Save this — you'll need it if you ever lose the embed code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo" onClick={onGoHome}><Logo iconSize={28} /></div>
        <h2>Add AI flight search to your site</h2>
        <p className="auth-sub">Free for early agencies — takes 2 minutes to set up</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Agency Name</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Al Hind Travels"
              required
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@youragency.com"
              required
            />
          </div>

          <div className="auth-field">
            <label>Currency</label>
            <select value={form.currency} onChange={set('currency')} required>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Setting up…' : 'Get My Widget'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AgencySignupPage;
