import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/landing.css';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    // Small delay for UX feel
    await new Promise((r) => setTimeout(r, 400));

    const result = login(username, password);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="landing-blob landing-blob--teal" />
      <div className="landing-blob landing-blob--green" />

      <div className="login-card">
        <div className="login-card__brand">
          <div className="login-card__brand-icon">
            <Zap size={22} />
          </div>
          <span className="login-card__brand-text">RE-FLOW AI</span>
        </div>

        <h2 className="login-card__title">Admin Login</h2>
        <p className="login-card__subtitle">Enter your credentials to access the dashboard</p>

        <form onSubmit={handleSubmit} id="admin-login-form">
          {error && <div className="login-form__error">{error}</div>}

          <div className="login-form__group">
            <label className="login-form__label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              className="login-form__input"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="login-form__group">
            <label className="login-form__label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="login-form__input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--landing-text-muted)',
                  padding: '0.2rem',
                  display: 'flex',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-form__submit"
            disabled={isLoading}
            id="login-submit-btn"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Static Credentials Helper */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              fontSize: '0.82rem',
              color: '#475569',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>Static Admin Credentials</span>
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                }}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Auto-fill
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
              <span>User: <strong>admin</strong></span>
              <span>Pass: <strong>admin123</strong></span>
            </div>
          </div>
        </form>

        <Link to="/" className="login-card__back">
          ← Back to Splash Page
        </Link>
      </div>
    </div>
  );
}
