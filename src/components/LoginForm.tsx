import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      setIsLoading(false);
      return;
    }

    try {
      await login(username, password);
    } catch (error: any) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-header">
        <div className="university-logo">
          <div className="logo-container">
            <div className="logo-main">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3c72"/>
                    <stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" stroke="#fff" strokeWidth="3"/>
                <path d="M35 30 L65 30 L65 35 L60 35 L60 65 L55 65 L55 45 L45 45 L45 65 L40 65 L40 35 L35 35 Z" fill="white"/>
                <circle cx="50" cy="25" r="8" fill="white"/>
                <path d="M30 70 Q50 60 70 70" stroke="white" strokeWidth="3" fill="none"/>
              </svg>
            </div>
            <div className="logo-pulse"></div>
          </div>
          <div className="university-info">
            <h1>MEDITRACK</h1>
            <p>Medical Records Management System</p>
            <div className="tagline">Secure • Efficient • Reliable</div>
          </div>
        </div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header-card">
            <div className="card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 1L21 5V11C21 16.55 17.16 21.74 12 23C6.84 21.74 3 16.55 3 11V5L12 1Z" fill="url(#cardGradient)" stroke="#1e3c72" strokeWidth="1"/>
                <defs>
                  <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e3f2fd"/>
                    <stop offset="100%" stopColor="#bbdefb"/>
                  </linearGradient>
                </defs>
                <path d="M9 12L11 14L15 10" stroke="#1e3c72" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h2>Secure Access Portal</h2>
            <p>Enter your credentials to access the medical records system</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#666"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C11.45 17 11 16.55 11 16S11.45 15 12 15 13 15.45 13 16 12.55 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z" fill="#666"/>
                  </svg>
                </span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#f44336"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-spinner">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="login-bottom">
        <p>&copy; 2024 Meditrack Medical Records Management System. All rights reserved.</p>
        <p>For technical support, contact your system administrator.</p>
      </div>
    </div>
  );
};

export default LoginForm;