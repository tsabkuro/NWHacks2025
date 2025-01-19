import React, { useState } from 'react';
import api from '../api';
import './Register.css';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password1: '',
    password2: '',
  });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const { username, email, firstName, lastName, password1, password2 } = formData;
  
    try {
      const response = await api.post('/auth/registration/', {
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password1,
        password2,
      });
      const { key } = response.data;
      localStorage.setItem('token', key);
      setError(''); // Clear any previous error
      onRegisterSuccess(key);
    } catch (err) {
      // Extract error messages from the API response
      let errorMessages = 'Registration failed.';
  
      if (err.response && err.response.data) {
        const data = err.response.data;
  
        // Check if the response contains field-specific errors
        if (typeof data === 'object') {
          errorMessages = Object.values(data)
            .flat() // Flatten nested arrays (e.g., [["Error 1"], ["Error 2"]])
            .map((msg) => msg.slice(0, 100)) // Truncate each message to 50 characters
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

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="register-title">Create an Account</h2>
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
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password1">Password</label>
          <input
            type="password"
            id="password1"
            name="password1"
            value={formData.password1}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="register-button">Sign Up</button>
      </form>
      <p className="switch-text">
        Already have an account?{' '}
        <button type="button" className="switch-button" onClick={onSwitchToLogin}>
          Log In
        </button>
      </p>
    </div>
  );
}

export default Register;