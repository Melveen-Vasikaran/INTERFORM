import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { verifyInvitation, acceptInvitation } from '../utils/api';
import PasswordInput from '../components/PasswordInput';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';

export default function AcceptInvitation({ token }) {
  const { setAuthFromSetup, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteData, setInviteData] = useState(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const data = await verifyInvitation(token);
        setInviteData(data);
      } catch (err) {
        setError(err.message || 'Invalid or expired invitation token.');
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      return addToast('Password must be at least 8 characters long.', 'danger');
    }
    if (password !== confirmPassword) {
      return addToast('Passwords do not match.', 'danger');
    }

    setSubmitting(true);
    try {
      const res = await acceptInvitation({ token, password, profilePhotoUrl });
      addToast(res.message, 'success');
      setAuthFromSetup(res.token, res.user);
    } catch (err) {
      addToast(err.message || 'Failed to accept invitation.', 'danger');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Verifying invitation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)' }}>
        <div className="sunlit-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--status-danger-text)', marginBottom: '1rem' }}>Invitation Error</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => window.location.href = '/'} className="btn btn-primary">Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: '2rem' }}>
      <div className="sunlit-card" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Welcome to {inviteData.collegeName}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Hello, <strong>{inviteData.name}</strong>
          </p>
        </div>

        <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
            You have been invited to join as:
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-blue)', marginBottom: '1rem' }}>
            HEAD OF DEPARTMENT
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>DEPARTMENT</div>
              <div style={{ fontWeight: 500 }}>{inviteData.department}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>EMAIL</div>
              <div style={{ fontWeight: 500 }}>{inviteData.email}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Create Your Account</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Profile Photo (Optional)</label>
            <div style={{ alignSelf: 'flex-start' }}>
              <ProfilePhotoUploader 
                currentPhotoUrl={profilePhotoUrl} 
                onPhotoUploaded={setProfilePhotoUrl} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Password *</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Confirm Password *</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ marginTop: '1rem', width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Join Platform'}
          </button>
        </form>
      </div>
    </div>
  );
}
