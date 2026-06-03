import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';
import Logo from '../components/Logo';

function RegisterPage({ onSuccess, onGoLogin, onGoHome }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.email, form.password, form.firstName, form.lastName);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo" onClick={onGoHome}><Logo iconSize={28} /></div>
        <h2>Create account</h2>
        <p className="auth-sub">Start finding smarter flights</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-row">
            <div className="auth-field">
              <label>First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={set('firstName')}
                placeholder="Ali"
                required
              />
            </div>
            <div className="auth-field">
              <label>Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={set('lastName')}
                placeholder="Khan"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-field">
            <label>Password <span>(min 8 characters)</span></label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={onGoLogin}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
