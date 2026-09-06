import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { setupInstitution } from '../utils/api';
import { Building2, ChevronRight, ChevronLeft, CheckCircle2, Shield, Layers, Rocket } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

export default function OnboardingWizard({ onComplete }) {
  const { addToast, loadSettings, login, setSettings } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [setupDone, setSetupDone] = useState(false); // Prevent duplicate submissions

  // Step 1: Institute Info
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [tagline, setTagline] = useState('Connect. Share. Plan.');
  const [collegeAddress, setCollegeAddress] = useState('');

  // Step 2: Admin Account
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3: First Department
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptBuilding, setDeptBuilding] = useState('Main Academic Block');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');

  const totalSteps = 4; // Added a step 4 confirmation

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNext = () => {
    if (step === 1) {
      if (!collegeName.trim()) {
        addToast('Please enter your college or university name.', 'warning');
        return;
      }
    }
    if (step === 2) {
      if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
        addToast('Please fill in all admin account fields.', 'warning');
        return;
      }
      if (!isValidEmail(adminEmail)) {
        addToast('Please enter a valid email address.', 'warning');
        return;
      }
      if (adminPassword.length < 6) {
        addToast('Password must be at least 6 characters.', 'warning');
        return;
      }
      if (adminPassword !== confirmPassword) {
        addToast('Passwords do not match.', 'danger');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinishSetup = async () => {
    // Prevent duplicate submissions
    if (loading || setupDone) return;
    setLoading(true);

    try {
      console.log('[INTERFORM Setup] Calling /api/institution/setup...');

      const res = await setupInstitution({
        collegeName,
        collegeCode,
        tagline,
        collegeAddress,
        adminName,
        adminEmail,
        adminPassword,
        deptName,
        deptCode,
        deptBuilding,
        hodName,
        hodEmail
      });

      console.log('[INTERFORM Setup] Server response:', res);

      // Setup is complete in database
      setSetupDone(true);
      
      // Update settings in context directly from the response (non-blocking)
      if (res.settings) {
        setSettings(res.settings);
      }

      // Explicitly login the new Admin to create a real authenticated session
      console.log('[INTERFORM Setup] Authenticating admin...');
      await login(adminEmail, adminPassword);
      console.log('[INTERFORM Setup] Authentication successful');

      // Also try to reload settings from server
      loadSettings().catch(err => {
        console.warn('[INTERFORM Setup] Non-critical: Could not reload settings from server:', err);
      });
      addToast(`🎉 ${collegeName} is ready! Welcome to your Admin Dashboard.`, 'success');

      console.log('[INTERFORM Setup] Auth set, calling onComplete...');

      // Navigate to dashboard
      if (onComplete) onComplete();

    } catch (err) {
      console.error('[INTERFORM Setup] FAILED:', err);
      const errorMsg = err?.message || 'Setup failed. Please check your connection and try again.';
      addToast(errorMsg, 'danger');
      setLoading(false);
    }
    // Note: don't setLoading(false) on success — we're navigating away
  };

  const stepIndicator = (num, label) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.78rem',
        fontWeight: 700,
        background: step >= num ? 'var(--accent-blue)' : 'var(--bg-secondary)',
        color: step >= num ? '#FFFFFF' : 'var(--text-muted)',
        border: step >= num ? 'none' : '1px solid var(--border-color)',
        transition: 'all 0.2s ease'
      }}>
        {step > num ? <CheckCircle2 size={16} /> : num}
      </div>
      <span style={{
        fontSize: '0.82rem',
        fontWeight: step === num ? 700 : 500,
        color: step === num ? 'var(--text-primary)' : 'var(--text-muted)'
      }}>{label}</span>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="sunlit-card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>

        {/* Header Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome to INTERFORM
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Let's set up your institution in a few quick steps
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '0.75rem 0',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {stepIndicator(1, 'Institution')}
          <div style={{ borderTop: '2px solid var(--border-color)', flex: 1, alignSelf: 'center', margin: '0 0.5rem' }} />
          {stepIndicator(2, 'Admin')}
          <div style={{ borderTop: '2px solid var(--border-color)', flex: 1, alignSelf: 'center', margin: '0 0.5rem' }} />
          {stepIndicator(3, 'Department')}
          <div style={{ borderTop: '2px solid var(--border-color)', flex: 1, alignSelf: 'center', margin: '0 0.5rem' }} />
          {stepIndicator(4, 'Launch')}
        </div>

        {/* Step 1: Institute Information */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Building2 size={20} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Institution</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
              Enter your college or university details. This will appear in the platform header for all users.
            </p>

            <div className="form-group">
              <label>College / University Name <span style={{ color: 'var(--status-reserved-text)' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Easwari Engineering College"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Institution Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. EEC, NIT"
                  value={collegeCode}
                  onChange={e => setCollegeCode(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Platform Tagline</label>
                <input
                  type="text"
                  className="form-control"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Campus Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 123 University Avenue, Chennai"
                value={collegeAddress}
                onChange={e => setCollegeAddress(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Admin Account */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Shield size={20} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Administrator Account</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
              This will be the primary admin who manages departments, users, and global settings.
            </p>

            <div className="form-group">
              <label>Full Name <span style={{ color: 'var(--status-reserved-text)' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dr. John Anderson"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Email Address <span style={{ color: 'var(--status-reserved-text)' }}>*</span></label>
              <input
                type="email"
                className="form-control"
                placeholder="admin@yourcollege.edu"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Password <span style={{ color: 'var(--status-reserved-text)' }}>*</span></label>
                <PasswordInput
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  aria-label="Admin password"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password <span style={{ color: 'var(--status-reserved-text)' }}>*</span></label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  aria-label="Confirm admin password"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: First Department */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Layers size={20} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Create Your First Department</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
              Add your first department now. You can add more later from the Admin panel. <em style={{ color: 'var(--text-muted)' }}>(Optional — you can skip this)</em>
            </p>

            <div className="form-group">
              <label>Department Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Computer Science & Engineering"
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Department Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CSE"
                  value={deptCode}
                  onChange={e => setDeptCode(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Building / Block</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Block A"
                  value={deptBuilding}
                  onChange={e => setDeptBuilding(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>HOD Name (Head of Dept)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dr. Sarah Williams"
                  value={hodName}
                  onChange={e => setHodName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>HOD Email (Sends Joining Link)</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. hod@college.edu"
                  value={hodEmail}
                  onChange={e => setHodEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Rocket size={20} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Review & Launch</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
              Review your setup details below. Click <strong>Finish Setup & Launch</strong> to create your institution dashboard.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Institution</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{collegeName}</div>
                {collegeCode && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Code: {collegeCode}</div>}
                {collegeAddress && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{collegeAddress}</div>}
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Administrator</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{adminName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{adminEmail}</div>
              </div>

              {deptName.trim() && (
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>First Department</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{deptName}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {deptCode && `Code: ${deptCode} • `}{deptBuilding}{hodName && ` • HOD: ${hodName}`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: step === 1 ? 'flex-end' : 'space-between',
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          {step > 1 && (
            <button type="button" onClick={handleBack} disabled={loading} className="btn btn-outline" style={{ gap: '0.3rem' }}>
              <ChevronLeft size={16} /> Back
            </button>
          )}

          {step < totalSteps ? (
            <button type="button" onClick={handleNext} className="btn btn-primary" style={{ gap: '0.3rem' }}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishSetup}
              disabled={loading || setupDone}
              className="btn btn-primary"
              style={{ gap: '0.3rem', padding: '0.65rem 2rem', opacity: setupDone ? 0.6 : 1 }}
            >
              <CheckCircle2 size={16} /> {loading ? 'Creating Dashboard...' : setupDone ? 'Setup Complete!' : 'Finish Setup & Launch'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
