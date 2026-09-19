import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { loginWithAdminCredentials, signInWithGoogle, ADMIN_USERNAME } from '../lib/auth.js';
import AdgesLogo from './AdgesLogo.jsx';

export default function AdminLoginModal({ open, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = loginWithAdminCredentials(username, password);
    setLoading(false);

    if (res.success) {
      setUsername('');
      setPassword('');
      if (onLoginSuccess) onLoginSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed.');
      }
    }
    setGoogleLoading(false);
  }

  function handleFillDemo() {
    setUsername(ADMIN_USERNAME);
    setPassword('adges@admin123');
    setError('');
  }

  return (
    <Modal open={open} onClose={onClose} title={null}>
      <div className="login-header">
        <AdgesLogo className="login-crest" size={42} />
        <div>
          <h3 id="admin-login-title" style={{ fontSize: '1.24rem', margin: 0, color: 'var(--ink-900)' }}>ADGES Admin Portal</h3>
          <div className="login-subtitle">Association of Drilling & Geological Engineering Students &bull; SRID, UMaT</div>
        </div>
      </div>

      <div style={{ background: 'var(--paper-dim)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 6, marginBottom: 18, fontSize: '.8rem', color: 'var(--ink-700)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Administrator Access for Executive Officers & Content Editors</span>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{ background: 'none', border: 'none', color: 'var(--green-700)', textDecoration: 'underline', cursor: 'pointer', fontSize: '.76rem', fontWeight: 600 }}
          >
            Quick Fill
          </button>
        </div>
      </div>

      {error && <div className="form-msg error" style={{ marginBottom: 16 }}>{error}</div>}

      <form className="admin-form" onSubmit={handleSubmit} id="admin-login-form">
        <div>
          <label htmlFor="admin-username-input">Admin Username</label>
          <input
            id="admin-username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ADGES-SRID"
            required
            autoComplete="username"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="admin-password-input">Password</label>
          <div className="input-with-action">
            <input
              id="admin-password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="admin-form-actions" style={{ marginTop: 22 }}>
          <button
            id="admin-login-submit-btn"
            type="submit"
            className="admin-btn-primary"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In as Admin'}
          </button>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="login-divider">
        <span>or</span>
      </div>

      <button
        id="google-signin-btn"
        type="button"
        className="admin-btn-secondary"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '11px 16px'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        {googleLoading ? 'Connecting Google…' : 'Sign in with Google Account'}
      </button>
    </Modal>
  );
}
