import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import api from '../api';

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
      setError('');
      onRegisterSuccess(key);
    } catch (err) {
      let errorMessages = 'Registration failed.';
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          errorMessages = Object.values(data)
            .flat()
            .map((msg) => msg.slice(0, 100))
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

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="bg-white p-4 rounded shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center" style={{ color: '#4caf50' }}>Create an Account</h2>
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
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password1"
              value={formData.password1}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button
            type="submit"
            style={{ backgroundColor: '#4caf50', border: 'none', width: '100%' }}
          >
            Sign Up
          </Button>
        </Form>
        <div className="text-center mt-3">
          Already have an account?{' '}
          <Button
            variant="link"
            style={{ color: '#4caf50', textDecoration: 'underline' }}
            onClick={onSwitchToLogin}
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Register;