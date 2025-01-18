import React, { useState } from 'react';
import api from '../api';
import './Login.css';

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { key } = response.data;
      localStorage.setItem('token', key);
      setError('');
      onLoginSuccess(key);
    } catch {
      setError('Invalid username or password.');
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Welcome Back</h2>
        {error && <p className="login-error">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Log In</button>
      </form>
      <p className="switch-text">
        Don’t have an account?{' '}
        <button type="button" className="switch-button" onClick={onSwitchToRegister}>
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default Login;