import React, { useState, useEffect } from 'react';
import { Container, Navbar, Button } from 'react-bootstrap';
import Login from './components/Login';
import Register from './components/Register';
import Categories from './components/Categories';
import SpendingsTable from './components/SpendingsTable';
import GPTQuery from './components/GPTQuery';
import StatsDashboard from './components/StatsDashboard';
import ReceiptUpload from './components/ReceiptUpload';
import api from './api';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // NEW: store spendings here
  const [spendings, setSpendings] = useState([]);

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchSpendings();
    }
  }, [token]);

  // Fetch categories
  async function fetchCategories() {
    try {
      const response = await api.get('/transactions/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  // NEW: Fetch spendings
  async function fetchSpendings() {
    try {
      const response = await api.get('/transactions/spendings/');
      setSpendings(response.data);
    } catch (error) {
      console.error('Error fetching spendings:', error);
    }
  }

  // Create category
  async function addCategory(name, parent) {
    try {
      const response = await api.post('/transactions/categories/', {
        name,
        parent: parent || null,
      });
      setCategories((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  // Update category
  async function updateCategory(categoryId, data) {
    try {
      const response = await api.patch(`/transactions/categories/${categoryId}/`, data);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? response.data : cat))
      );
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  async function deleteCategory(categoryId) {
    try {
      await api.delete(`/transactions/categories/${categoryId}/`);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  function handleLoginSuccess(newToken) {
    setToken(newToken);
  }

  function handleRegisterSuccess(newToken) {
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setCategories([]);
    setSpendings([]); // Clear spendings on logout
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        bg="white"
        expand="lg"
        className="shadow-sm mb-4"
        style={{ borderBottom: '2px solid #4caf50' }}
      >
        <Container>
          <Navbar.Brand style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.5rem' }}>
            Fiscal.ly
          </Navbar.Brand>
          {token && (
            <Button
              variant="outline-success"
              onClick={handleLogout}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                fontWeight: 'bold',
              }}
            >
              Logout
            </Button>
          )}
        </Container>
      </Navbar>

      <Container>
        {token ? (
          <>
            {/* Receipt Upload (if you want to keep it here) */}
            <ReceiptUpload />

            {/* Categories */}
            <Categories
              categories={categories}
              addCategory={addCategory}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
            />

            {/* Spendings with addCategory if you want to add category on the fly */}
            <SpendingsTable categories={categories} addCategory={addCategory} />

            {/* STATS DASHBOARD for aggregated data */}
            <StatsDashboard spendings={spendings} />

            {/* GPT Query */}
            <GPTQuery token={token} />
          </>
        ) : isRegistering ? (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setIsRegistering(false)}
          />
        ) : (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setIsRegistering(true)}
          />
        )}
      </Container>

      <footer
        className="text-center mt-4 py-3 mt-auto"
        style={{ backgroundColor: '#f9f9f9', borderTop: '1px solid #ddd' }}
      >
        <p style={{ color: '#4caf50', fontWeight: 'bold', margin: 0 }}>
          Fiscal.ly - Manage your finances with ease
        </p>
      </footer>
    </div>
  );
}

export default App;