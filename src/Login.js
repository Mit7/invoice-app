import React, { useState } from 'react';
import { login } from './api';
import './css/Login.css'; // Make sure to create this file

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Replace this with your actual login logic
      const user = await login(email, password);
      onLogin(user);
    } catch {
      setError('Invalid email or password');
    }
  }

  return (
    <div className="split-screen">
      <div className="split left">
        <div className="brand-box">
          <h1>Welcome!</h1>
          <p>Manage Your Invoices with Us.</p>
        </div>
      </div>
      <div className="split right">
        <div className="login-container">
          <h2 className="login-title">Sign In</h2>
          {error && <div className="login-error">{error}</div>}
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
            <button type="submit" className="login-btn">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;