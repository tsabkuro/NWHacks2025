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
      setError(''); // Clear any previous error
      onLoginSuccess(key);
    } catch (err) {
      // Extract error messages from the API response
      let errorMessages = 'Login failed.';
  
      if (err.response && err.response.data) {
        const data = err.response.data;
  
        // Check if the response contains field-specific errors
        if (typeof data === 'object') {
          errorMessages = Object.values(data)
            .flat() // Flatten nested arrays (e.g., [["Error 1"], ["Error 2"]])
            .map((msg) => msg.slice(0, 50)) // Truncate each message to 50 characters
            .join('\n'); // Join messages with newlines
        } else if (typeof data === 'string') {
          errorMessages = data.slice(0, 50); // Truncate string errors
        }
      } else if (err.message) {
        errorMessages = err.message.slice(0, 50); // Fallback to generic error
      }
  
      setError(errorMessages);
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Welcome Back</h2>
        {error && (
            <div className="error-message">
                {error.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
                ))}
            </div>
        )}
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