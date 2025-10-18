import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role'));
  const [authToken, setAuthToken] = useState(localStorage.getItem('auth_token'));

  useEffect(() => {
    if (userRole && authToken) {
      localStorage.setItem('user_role', userRole);
      localStorage.setItem('auth_token', authToken);
    } else {
      localStorage.removeItem('user_role');
      localStorage.removeItem('auth_token');
    }
  }, [userRole, authToken]);

  function handleLogin(user) {
    setUserRole(user.role);
    setAuthToken(localStorage.getItem('auth_token'));
  }

  function handleLogout() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_token');
    setUserRole(null);
    setAuthToken(null);
  }

  if (!userRole) {
    return (
      <div className="app-wrapper">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  const allowedRoles = ['admin', 'accounts_1st', 'accounts_2nd', 'accounts_3rd', 'final_accountant'];

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="app-wrapper">
        <div className="unauthorized">
          <h2>Unauthorized Role</h2>
          <p>Your account does not have access to this application.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard role={userRole} onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
       
      </BrowserRouter>
    </div>
  );
}

export default App;
