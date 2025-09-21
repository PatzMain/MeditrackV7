import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="brand-section">
            <h1 className="brand-title">meditrack</h1>
            <p className="brand-subtitle">
              Connect with healthcare professionals and manage your medical records securely.
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <form onSubmit={handleSubmit} className="login-form">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="form-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="form-input"
              />

              {error && <div className="error-alert">{error}</div>}

              <button type="submit" disabled={isLoading} className="login-btn">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="demo-accounts">
              <div className="demo-title">Demo Accounts:</div>
              <div className="demo-list">
                <div className="demo-item">
                  <strong>Admin:</strong> admin / admin123
                </div>
                <div className="demo-item">
                  <strong>Superadmin:</strong> superadmin / superadmin123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;