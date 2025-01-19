import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Categories from './components/Categories';
import SpendingsTable from './components/SpendingsTable'; // <--- new

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isRegistering, setIsRegistering] = useState(false);

  function handleLoginSuccess(newToken) {
    setToken(newToken);
  }

  function handleRegisterSuccess(newToken) {
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <div>
      <h1>Fiscal.ly</h1>
      {token ? (
        <>
          <button onClick={handleLogout}>Logout</button>
          <SpendingsTable />
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
    </div>
  );
}

export default App;