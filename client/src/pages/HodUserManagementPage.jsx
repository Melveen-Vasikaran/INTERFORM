import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchUsers, createStaff, createStudent, toggleUserStatus } from '../utils/api';
import { Users, UserCheck, GraduationCap, Plus, CheckCircle2, XCircle, Shield } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import Avatar from '../components/Avatar';

const MODAL_STYLE = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
};
const CARD_STYLE = {
  background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem',
  width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
};
const INPUT_STYLE = {
  width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
  color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box'
};
const LABEL_STYLE = {
  display: 'block', fontSize: '0.8rem', fontWeight: 700,
  color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase'
};

// ─── Staff Creation Modal ───
function AddStaffModal({ deptName, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', staffId: '', designation: 'Assistant Professor', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await createStaff({
        name: form.name, email: form.email, staffId: form.staffId || undefined,
        designation: form.designation, phone: form.phone, password: form.password
      });
      onSuccess(res.message || 'Staff added successfully.');
    } catch (err) {
      setError(err.message || 'Failed to create staff account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={MODAL_STYLE} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={CARD_STYLE}>
        <h2 style={{ fontWeight: 800, marginBottom: '0.25rem', fontSize: '1.4rem' }}>Add Staff Member</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Department: <strong>{deptName}</strong> (auto-assigned)
        </p>
        {error && <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label style={LABEL_STYLE}>Full Name *</label><input style={INPUT_STYLE} required value={form.name} onChange={set('name')} placeholder="Dr. Jane Smith" /></div>
          <div><label style={LABEL_STYLE}>Email Address *</label><input style={INPUT_STYLE} type="email" required value={form.email} onChange={set('email')} placeholder="jane.smith@college.edu" /></div>
          <div><label style={LABEL_STYLE}>Staff ID <span style={{ fontWeight: 400, textTransform: 'none' }}>(leave blank to auto-generate)</span></label><input style={INPUT_STYLE} value={form.staffId} onChange={set('staffId')} placeholder="STF-0001 (optional)" /></div>
          <div><label style={LABEL_STYLE}>Designation</label>
            <select style={INPUT_STYLE} value={form.designation} onChange={set('designation')}>
              <option>Professor</option>
              <option>Associate Professor</option>
              <option>Assistant Professor</option>
              <option>Lab Instructor</option>
              <option>Teaching Assistant</option>
              <option>Lecturer</option>
            </select>
          </div>
          <div><label style={LABEL_STYLE}>Phone (optional)</label><input style={INPUT_STYLE} value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" /></div>
          <PasswordInput label="Password *" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required />
          <PasswordInput label="Confirm Password *" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter password" required />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '0.75rem', background: 'var(--accent-blue)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: '#fff', fontWeight: 700 }}>{loading ? 'Creating...' : 'Create Staff Account'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Student Creation Modal ───
function AddStudentModal({ deptName, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', registerNumber: '', year: '1', section: 'A', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await createStudent({
        name: form.name, email: form.email, registerNumber: form.registerNumber,
        year: form.year, section: form.section, phone: form.phone, password: form.password
      });
      onSuccess(res.message || 'Student added successfully.');
    } catch (err) {
      setError(err.message || 'Failed to create student account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={MODAL_STYLE} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={CARD_STYLE}>
        <h2 style={{ fontWeight: 800, marginBottom: '0.25rem', fontSize: '1.4rem' }}>Add Student</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Department: <strong>{deptName}</strong> (auto-assigned)
        </p>
        {error && <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label style={LABEL_STYLE}>Full Name *</label><input style={INPUT_STYLE} required value={form.name} onChange={set('name')} placeholder="Aisha Patel" /></div>
          <div><label style={LABEL_STYLE}>Email Address *</label><input style={INPUT_STYLE} type="email" required value={form.email} onChange={set('email')} placeholder="aisha@student.college.edu" /></div>
          <div><label style={LABEL_STYLE}>Register Number *</label><input style={INPUT_STYLE} required value={form.registerNumber} onChange={set('registerNumber')} placeholder="CS2024001" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label style={LABEL_STYLE}>Year</label>
              <select style={INPUT_STYLE} value={form.year} onChange={set('year')}>
                {['1','2','3','4'].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div><label style={LABEL_STYLE}>Section</label><input style={INPUT_STYLE} value={form.section} onChange={set('section')} placeholder="A" maxLength={5} /></div>
          </div>
          <div><label style={LABEL_STYLE}>Phone (optional)</label><input style={INPUT_STYLE} value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" /></div>
          <PasswordInput label="Password *" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required />
          <PasswordInput label="Confirm Password *" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter password" required />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '0.75rem', background: 'var(--accent-blue)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: '#fff', fontWeight: 700 }}>{loading ? 'Creating...' : 'Create Student Account'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── User Row Card ───
function UserRow({ userObj, onToggle }) {
  const isActive = userObj.isActive !== false;
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(userObj);
    setToggling(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
      <Avatar user={userObj} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{userObj.name}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{userObj.email}</div>
        {userObj.role === 'student' && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Reg: <strong>{userObj.registerNumber || userObj.collegeId}</strong> | Year {userObj.studentYear} | Section {userObj.section}
          </div>
        )}
        {userObj.role === 'staff' && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            ID: <strong>{userObj.staffId || userObj.collegeId}</strong> | {userObj.designation}
          </div>
        )}
      </div>
      <span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 700, background: isActive ? 'var(--success-light, #d1fae5)' : 'var(--danger-light, #fee2e2)', color: isActive ? 'var(--success, #065f46)' : 'var(--danger, #991b1b)' }}>
        {isActive ? 'ACTIVE' : 'INACTIVE'}
      </span>
      <button onClick={handleToggle} disabled={toggling} title={isActive ? 'Deactivate account' : 'Activate account'} style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: isActive ? 'var(--danger, #dc2626)' : 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
        {toggling ? '...' : (isActive ? 'Deactivate' : 'Activate')}
      </button>
    </div>
  );
}

// ─── Main Page ───
export default function HodUserManagementPage() {
  const { user, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('staff');
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const all = await fetchUsers();
      setStaff(all.filter(u => u.role === 'staff'));
      setStudents(all.filter(u => u.role === 'student'));
    } catch (err) {
      addToast('Failed to load users.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggle = async (userObj) => {
    const { toggleUserStatus } = await import('../utils/api');
    try {
      const res = await toggleUserStatus(userObj.id);
      addToast(res.message || 'Status updated.', 'info');
      loadUsers();
    } catch (err) {
      addToast(err.message || 'Failed to update status.', 'danger');
    }
  };

  const handleStaffAdded = (msg) => {
    addToast(msg, 'success');
    setShowAddStaff(false);
    loadUsers();
  };
  const handleStudentAdded = (msg) => {
    addToast(msg, 'success');
    setShowAddStudent(false);
    loadUsers();
  };

  const TAB_BTN = (id, label, Icon, count) => (
    <button onClick={() => setActiveTab(id)} style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.2rem',
      borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', cursor: 'pointer', border: 'none',
      fontWeight: activeTab === id ? 700 : 500,
      background: activeTab === id ? 'var(--accent-blue)' : 'transparent',
      color: activeTab === id ? '#fff' : 'var(--text-secondary)'
    }}>
      <Icon size={16} /> {label} ({count})
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>HOD CONTROL PANEL</div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>Staff & Students</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Managing: <strong>{user?.department || 'Your Department'}</strong> — All accounts are isolated to your department only.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sunlit-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Staff</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>{staff.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{staff.filter(s => s.isActive !== false).length} active</div>
        </div>
        <div className="sunlit-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Students</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>{students.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{students.filter(s => s.isActive !== false).length} active</div>
        </div>
        <div className="sunlit-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Department</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{user?.department}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fully isolated</div>
        </div>
      </div>

      {/* Tabs + Actions */}
      <div className="sunlit-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
            {TAB_BTN('staff', 'Staff Members', UserCheck, staff.length)}
            {TAB_BTN('students', 'Students', GraduationCap, students.length)}
          </div>
          <button onClick={() => activeTab === 'staff' ? setShowAddStaff(true) : setShowAddStudent(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'var(--accent-blue)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            <Plus size={18} /> Add {activeTab === 'staff' ? 'Staff Member' : 'Student'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading users...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeTab === 'staff' && (
              staff.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <UserCheck size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>No staff members yet. Click "Add Staff Member" to create the first one.</p>
                </div>
              ) : staff.map(s => <UserRow key={s.id} userObj={s} onToggle={handleToggle} />)
            )}
            {activeTab === 'students' && (
              students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>No students yet. Click "Add Student" to enroll the first student.</p>
                </div>
              ) : students.map(s => <UserRow key={s.id} userObj={s} onToggle={handleToggle} />)
            )}
          </div>
        )}
      </div>

      {showAddStaff && <AddStaffModal deptName={user?.department} onClose={() => setShowAddStaff(false)} onSuccess={handleStaffAdded} />}
      {showAddStudent && <AddStudentModal deptName={user?.department} onClose={() => setShowAddStudent(false)} onSuccess={handleStudentAdded} />}
    </div>
  );
}
