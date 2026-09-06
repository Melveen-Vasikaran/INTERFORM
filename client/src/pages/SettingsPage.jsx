import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchSettings, updateSettings } from '../utils/api';
import { Settings as SettingsIcon, Save, Building, ShieldCheck, Globe, Clock, Upload } from 'lucide-react';

export default function SettingsPage() {
  const { addToast, loadSettings } = useApp();
  const [collegeName, setCollegeName] = useState('AURA Institute of Technology');
  const [tagline, setTagline] = useState('Connect. Share. Plan.');
  const [collegeCode, setCollegeCode] = useState('AURA');
  const [collegeWebsite, setCollegeWebsite] = useState('');
  const [collegeAddress, setCollegeAddress] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [maxDuration, setMaxDuration] = useState(4);
  const [advanceDays, setAdvanceDays] = useState(14);
  const [autoApprove, setAutoApprove] = useState(false);
  const [requireHodApproval, setRequireHodApproval] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSettings();
        if (data.collegeName) setCollegeName(data.collegeName);
        if (data.tagline) setTagline(data.tagline);
        if (data.collegeCode) setCollegeCode(data.collegeCode);
        if (data.collegeWebsite) setCollegeWebsite(data.collegeWebsite);
        if (data.collegeAddress) setCollegeAddress(data.collegeAddress);
        if (data.adminEmail) setAdminEmail(data.adminEmail);
        if (data.academicYear) setAcademicYear(data.academicYear);
        if (data.bookingRules) {
          setMaxDuration(data.bookingRules.maxDurationHours || 4);
          setAdvanceDays(data.bookingRules.advanceDays || 14);
          if (data.bookingRules.autoApprove !== undefined) setAutoApprove(data.bookingRules.autoApprove);
          if (data.bookingRules.requireHodApproval !== undefined) setRequireHodApproval(data.bookingRules.requireHodApproval);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({
        collegeName,
        tagline,
        collegeCode,
        collegeWebsite,
        collegeAddress,
        adminEmail,
        academicYear,
        bookingRules: {
          maxDurationHours: parseInt(maxDuration, 10),
          advanceDays: parseInt(advanceDays, 10),
          autoApprove,
          requireHodApproval
        }
      });
      await loadSettings();
      addToast('System settings saved successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save settings.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
          GLOBAL PLATFORM CONFIGURATION
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
          INSTITUTION SETUP & SETTINGS
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Configure your institution's identity, branding, and global scheduling rules. Changes here will apply across the entire platform.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Institution Identity */}
        <div className="sunlit-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="var(--accent-blue)" /> Institution Identity
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.75rem' }}>
            Enter your college or university details. The name and tagline appear in the top header bar for all users.
          </p>

          <div className="form-group">
            <label>College / University Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. National Institute of Technology"
              value={collegeName}
              onChange={e => setCollegeName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Platform Tagline</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Connect. Share. Plan."
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Institution Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. NIT, AURA"
                value={collegeCode}
                onChange={e => setCollegeCode(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>College Website URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://www.yourcollege.edu"
                value={collegeWebsite}
                onChange={e => setCollegeWebsite(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Current Academic Year</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 2026-2027"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Campus Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 123 University Avenue, Tech City, 600001"
              value={collegeAddress}
              onChange={e => setCollegeAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Admin Contact Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@yourcollege.edu"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Booking Rules */}
        <div className="sunlit-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--accent-blue)" /> Global Booking Rules
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.75rem' }}>
            These rules apply campus-wide. HODs can only approve or reject requests — they cannot override these limits.
          </p>

          <div className="grid-2">
            <div className="form-group">
              <label>Max Booking Duration (Hours)</label>
              <input
                type="number"
                className="form-control"
                min={1}
                max={24}
                value={maxDuration}
                onChange={e => setMaxDuration(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Advance Reservation Window (Days)</label>
              <input
                type="number"
                className="form-control"
                min={1}
                max={90}
                value={advanceDays}
                onChange={e => setAdvanceDays(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Approval Workflow */}
        <div className="sunlit-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--accent-blue)" /> Approval Workflow
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.75rem' }}>
            Control how resource requests flow through the system. When HOD approval is required, each request is routed to the HOD of the department that owns the resource.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={requireHodApproval}
                onChange={e => setRequireHodApproval(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Require HOD Approval for Cross-Department Requests</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  When a student or staff from another department requests a resource, the owning department's HOD must approve it before the booking is confirmed.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={e => setAutoApprove(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Auto-Approve Same-Department Requests</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  When a user requests a resource from their own department, automatically approve the booking without HOD review.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.65rem 2rem' }}>
            <Save size={18} /> {loading ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
