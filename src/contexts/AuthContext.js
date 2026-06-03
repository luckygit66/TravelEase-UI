import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const API = process.env.REACT_APP_API_URL || 'http://localhost:5055/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('te_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('te_user') || 'null'));

  const login = async (email, password) => {
    const res = await fetch(`${API}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid email or password');
    const data = await res.json();
    persist(data);
    return data;
  };

  const register = async (email, password, firstName, lastName) => {
    const res = await fetch(`${API}/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    persist(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('te_token');
    localStorage.removeItem('te_user');
    setToken(null);
    setUser(null);
  };

  const persist = (data) => {
    const u = { id: data.id, email: data.email, firstName: data.firstName };
    localStorage.setItem('te_token', data.token);
    localStorage.setItem('te_user', JSON.stringify(u));
    setToken(data.token);
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
