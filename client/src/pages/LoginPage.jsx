import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, Shield, ArrowLeft, User, KeyRound } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

export default function LoginPage({ onSuccess, onBackToLanding, onStartSetup }) {
  const { login, addToast } = useApp();
  const [emailOrId, setEmailOrId] = useState('sophia.chen@student.college.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(emailOrId, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error toasted in context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (email) => {
    setEmailOrId(email);
    setPassword('password123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Back to Home button */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      )}

      <div className="sunlit-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        {/* Logo & Tagline */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'var(--accent-blue)',
            color: '#FFFFFF',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.4rem',
            marginBottom: '0.75rem'
          }}>
            I
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            INTERFORM
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.15rem' }}>
            Connect. Share. Plan.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} color="var(--accent-blue)" /> Email / College ID
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. STU-2024-089 or name@college.edu"
              value={emailOrId}
              onChange={e => setEmailOrId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <KeyRound size={16} color="var(--accent-blue)" /> Password
              </span>
            </label>
            <PasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              aria-label="Login password"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            <LogIn size={18} /> {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        {/* Register New Institution */}
        {onStartSetup && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              First time? Setting up for a new college?
            </p>
            <button
              onClick={onStartSetup}
              className="btn btn-outline"
              style={{ width: '100%', padding: '0.65rem', gap: '0.4rem' }}
            >
              <Shield size={16} /> Register New Institution
            </button>
          </div>
        )}

        {/* Demo Quick Presets */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Quick Demo Login Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
            <button
              onClick={() => handleQuickDemoLogin('sophia.chen@student.college.edu')}
              style={{
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              🎓 Student
            </button>

            <button
              onClick={() => handleQuickDemoLogin('marcus.brody@college.edu')}
              style={{
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              👨‍🏫 Staff
            </button>

            <button
              onClick={() => handleQuickDemoLogin('hod.cs@college.edu')}
              style={{
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              🏛️ HOD
            </button>

            <button
              onClick={() => handleQuickDemoLogin('admin@college.edu')}
              style={{
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Password Recovery</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Please contact your college ICT Helpdesk or Department Coordinator to reset your institution credentials.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForgotModal(false)} className="btn btn-primary">
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
