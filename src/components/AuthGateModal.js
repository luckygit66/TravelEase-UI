import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthGateModal.css';
import Logo from './Logo';

function AuthGateModal({ onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const switchMode = (m) => { setMode(m); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.firstName, form.lastName);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gate-overlay">
      <div className="gate-card">
        <div className="gate-logo"><Logo iconSize={30} /></div>

        <div className="gate-tabs">
          <button type="button" className={mode === 'login' ? 'gate-tab active' : 'gate-tab'} onClick={() => switchMode('login')}>Sign In</button>
          <button type="button" className={mode === 'register' ? 'gate-tab active' : 'gate-tab'} onClick={() => switchMode('register')}>Sign Up</button>
        </div>

        <h2>{mode === 'login' ? 'Welcome back' : 'Create your free account'}</h2>
        <p className="gate-sub">Sign in to start finding smarter flights</p>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="gate-row">
              <div className="gate-field">
                <label>First Name</label>
                <input type="text" value={form.firstName} onChange={set('firstName')} placeholder="Raj" required />
              </div>
              <div className="gate-field">
                <label>Last Name</label>
                <input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Sharma" required />
              </div>
            </div>
          )}

          <div className="gate-field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>

          <div className="gate-field">
            <label>Password {mode === 'register' && <span>(min 8 characters)</span>}</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              minLength={mode === 'register' ? 8 : undefined}
              required
            />
          </div>

          {error && <div className="gate-error">{error}</div>}

          <button type="submit" className="gate-btn" disabled={loading}>
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthGateModal;
