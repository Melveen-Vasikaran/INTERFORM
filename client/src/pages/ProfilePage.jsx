import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Shield, Building2, Mail, GraduationCap, Briefcase } from 'lucide-react';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';

export default function ProfilePage() {
  const { user, setUser, addToast } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [studentYear, setStudentYear] = useState(user?.studentYear || '3rd Year');
  const [designation, setDesignation] = useState(user?.designation || 'Student');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name,
      department,
      studentYear,
      designation
    };
    setUser(updated);
    localStorage.setItem('interform_user', JSON.stringify(updated));
    addToast('Profile updated successfully.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
          USER CREDENTIALS & ACCOUNT
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
          MY PROFILE
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          View and manage your institution profile information.
        </p>
      </div>

      <div className="sunlit-card">
        {/* Header Profile Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <ProfilePhotoUploader />

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.name}</h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              College ID: <strong>{user?.collegeId}</strong> • Role: <span style={{ textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-blue)' }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile}>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>College ID</label>
              <input
                type="text"
                className="form-control"
                value={user?.collegeId || ''}
                disabled
                style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                className="form-control"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                required
              />
            </div>
          </div>

          {user?.role === 'student' ? (
            <div className="form-group">
              <label>Academic Year</label>
              <select className="form-control" value={studentYear} onChange={e => setStudentYear(e.target.value)}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                className="form-control"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
