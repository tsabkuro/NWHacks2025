import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import api from '../api';

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
    } catch (err) {
      let errorMessages = 'Login failed.';
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          errorMessages = Object.values(data)
            .flat()
            .map((msg) => msg.slice(0, 50))
            .join('\n');
        } else if (typeof data === 'string') {
          errorMessages = data.slice(0, 50);
        }
      } else if (err.message) {
        errorMessages = err.message.slice(0, 50);
      }
      setError(errorMessages);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="bg-white p-4 rounded shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center" style={{ color: '#4caf50' }}>Welcome Back</h2>
        {error && (
          <Alert variant="danger" className="mt-3" style={{ whiteSpace: 'pre-wrap' }}>
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit} className="mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </Form.Group>
          <Button
            type="submit"
            style={{ backgroundColor: '#4caf50', border: 'none', width: '100%' }}
          >
            Log In
          </Button>
        </Form>
        <div className="text-center mt-3">
          Don’t have an account?{' '}
          <Button
            variant="link"
            style={{ color: '#4caf50', textDecoration: 'underline' }}
            onClick={onSwitchToRegister}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;