import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  fetchDepartments, createDepartment, fetchUsers, toggleUserStatus,
  fetchInvitations, inviteHod, revokeInvitation, resendInvitation, createHod
} from '../utils/api';
import { Building2, Users, Plus, XCircle, RotateCcw, Mail, ShieldCheck, GraduationCap, UserCheck, CheckCircle2 } from 'lucide-react';
import Avatar from '../components/Avatar';
import PasswordInput from '../components/PasswordInput';

const MODAL_STYLE = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
};
const CARD_STYLE = {
  background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem',
  width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
};
const INPUT_STYLE = {
  width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
  color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box'
};
const LABEL_STYLE = {
  display: 'block', fontSize: '0.78rem', fontWeight: 700,
  color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em'
};

const ROLE_COLORS = {
  admin: { bg: '#eff6ff', color: '#1d4ed8' },
  hod: { bg: '#f0fdf4', color: '#15803d' },
  staff: { bg: '#fefce8', color: '#92400e' },
  student: { bg: '#fdf4ff', color: '#7e22ce' }
};

export default function AdminManagementPage({ initialTab = 'departments' }) {
  const { addToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState(initialTab);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Department Modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [building, setBuilding] = useState('Main Academic Block');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');

  // Create HOD Modal
  const [showCreateHodModal, setShowCreateHodModal] = useState(false);
  const [hodForm, setHodForm] = useState({ name: '', email: '', department: '', departmentId: '', password: '', confirmPassword: '' });
  const [hodSubmitting, setHodSubmitting] = useState(false);
  const [hodError, setHodError] = useState('');

  // Invite HOD Modal (email flow — kept for compatibility)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [deptList, userList, invList] = await Promise.all([
        fetchDepartments(),
        fetchUsers(),
        fetchInvitations()
      ]);
      setDepartments(deptList);
      setUsers(userList);
      setInvitations(invList);
      if (deptList.length > 0 && !inviteDept) setInviteDept(deptList[0].name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdminData(); }, []);

  // ── Department creation ──
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const res = await createDepartment({ name: deptName, code: deptCode || deptName.substring(0, 4).toUpperCase(), building, hodName, hodEmail });
      addToast(res.message || 'Department created successfully.', 'success');
      setShowDeptModal(false);
      setDeptName(''); setDeptCode(''); setHodName(''); setHodEmail('');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to create department.', 'danger');
    }
  };

  // ── Create HOD directly (no invitation) ──
  const handleCreateHod = async (e) => {
    e.preventDefault();
    setHodError('');
    if (hodForm.password !== hodForm.confirmPassword) { setHodError('Passwords do not match.'); return; }
    if (hodForm.password.length < 6) { setHodError('Password must be at least 6 characters.'); return; }
    if (!hodForm.department) { setHodError('Please select a department.'); return; }
    setHodSubmitting(true);
    try {
      const selectedDept = departments.find(d => d.name === hodForm.department);
      const res = await createHod({
        name: hodForm.name, email: hodForm.email,
        department: hodForm.department,
        departmentId: selectedDept?.id || hodForm.departmentId,
        password: hodForm.password
      });
      addToast(res.message || 'HOD account created.', 'success');
      setShowCreateHodModal(false);
      setHodForm({ name: '', email: '', department: '', departmentId: '', password: '', confirmPassword: '' });
      loadAdminData();
    } catch (err) {
      setHodError(err.message || 'Failed to create HOD account.');
    } finally {
      setHodSubmitting(false);
    }
  };

  // ── Toggle user active/inactive ──
  const handleToggleStatus = async (userObj) => {
    try {
      const res = await toggleUserStatus(userObj.id);
      addToast(res.message || 'Status updated.', 'info');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Update failed.', 'danger');
    }
  };

  // ── Invitation actions ──
  const handleSendInvite = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await inviteHod({ name: inviteName, email: inviteEmail, department: inviteDept });
      addToast('Invitation sent successfully.', 'success');
      setShowInviteModal(false);
      setInviteName(''); setInviteEmail('');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to send invitation.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (id) => {
    try { await resendInvitation(id); addToast('Invitation resent.', 'success'); loadAdminData(); }
    catch (err) { addToast(err.message || 'Failed to resend.', 'danger'); }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this invitation?')) return;
    try { await revokeInvitation(id); addToast('Invitation revoked.', 'info'); loadAdminData(); }
    catch (err) { addToast(err.message || 'Failed to revoke.', 'danger'); }
  };

  // ── Filtered users ──
  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (deptFilter !== 'all' && u.department !== deptFilter) return false;
    if (statusFilter === 'active' && u.isActive === false) return false;
    if (statusFilter === 'inactive' && u.isActive !== false) return false;
    return true;
  });

  const hodUsers = users.filter(u => u.role === 'hod');
  const staffUsers = users.filter(u => u.role === 'staff');
  const studentUsers = users.filter(u => u.role === 'student');

  // ── Tab button helper ──
  const TabBtn = ({ id, label, count }) => (
    <button onClick={() => setActiveSubTab(id)} style={{
      padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', cursor: 'pointer', border: 'none',
      fontWeight: activeSubTab === id ? 700 : 500,
      background: activeSubTab === id ? 'var(--accent-blue)' : 'transparent',
      color: activeSubTab === id ? '#fff' : 'var(--text-secondary)'
    }}>
      {label} {count !== undefined && `(${count})`}
    </button>
  );

  // ── User table row ──
  const UserRow = ({ u }) => {
    const isActive = u.isActive !== false;
    const rc = ROLE_COLORS[u.role] || ROLE_COLORS.student;
    return (
      <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
        <td style={{ padding: '0.9rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar user={u} size="sm" />
            <div>
              <div style={{ fontWeight: 700, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{u.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <div>{u.collegeId}</div>
          {u.role === 'student' && <div style={{ marginTop: '0.1rem', color: 'var(--text-muted)' }}>Reg: {u.registerNumber} | Yr {u.studentYear} | Sec {u.section}</div>}
          {u.role === 'staff' && <div style={{ marginTop: '0.1rem', color: 'var(--text-muted)' }}>ID: {u.staffId || u.collegeId} | {u.designation}</div>}
        </td>
        <td style={{ padding: '0.9rem 1.25rem' }}>
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, background: rc.bg, color: rc.color, textTransform: 'uppercase' }}>
            {u.role}
          </span>
        </td>
        <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.department}</td>
        <td style={{ padding: '0.9rem 1.25rem' }}>
          <span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: isActive ? '#d1fae5' : '#fee2e2', color: isActive ? '#065f46' : '#991b1b' }}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </td>
        <td style={{ padding: '0.9rem 1.25rem' }}>
          {u.role !== 'admin' && (
            <button onClick={() => handleToggleStatus(u)} style={{
              padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
              cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: isActive ? '#dc2626' : 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.3rem'
            }}>
              {isActive ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>ADMINISTRATIVE CONTROL CENTER</div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>CAMPUS ADMINISTRATION</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage departments, users, roles and institution settings.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Departments', value: departments.length, color: '#1d4ed8' },
          { label: 'HODs', value: hodUsers.length, color: '#15803d' },
          { label: 'Staff', value: staffUsers.length, color: '#92400e' },
          { label: 'Students', value: studentUsers.length, color: '#7e22ce' }
        ].map(s => (
          <div key={s.label} className="sunlit-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, marginTop: '0.2rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <TabBtn id="departments" label="Departments" count={departments.length} />
        <TabBtn id="hods" label="HOD Accounts" count={hodUsers.length} />
        <TabBtn id="users" label="All Users" count={users.length} />
      </div>

      {/* DEPARTMENTS TAB */}
      {activeSubTab === 'departments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowDeptModal(true)} className="btn btn-primary"><Plus size={18} /> Add Department</button>
          </div>
          <div className="sunlit-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {['Department', 'Code', 'Building', 'HOD', 'Status'].map(h => <th key={h} style={{ padding: '0.85rem 1.25rem' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                ) : departments.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{d.name}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>{d.code}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>{d.building}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>{d.hodName || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not Assigned</span>}</td>
                    <td style={{ padding: '1rem 1.25rem' }}><span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>● ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HOD ACCOUNTS TAB */}
      {activeSubTab === 'hods' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button onClick={() => setShowInviteModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--accent-blue)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.9rem' }}>
              <Mail size={16} /> Email Invite
            </button>
            <button onClick={() => setShowCreateHodModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Create HOD Account
            </button>
          </div>

          <div className="sunlit-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {['HOD Name', 'Email / College ID', 'Department', 'Status', 'Action'].map(h => <th key={h} style={{ padding: '0.85rem 1.25rem' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {hodUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar user={u} size="sm" />
                        <span style={{ fontWeight: 700 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.collegeId}</div>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>{u.department}</td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: u.isActive !== false ? '#d1fae5' : '#fee2e2', color: u.isActive !== false ? '#065f46' : '#991b1b' }}>
                        {u.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <button onClick={() => handleToggleStatus(u)} style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: u.isActive !== false ? '#dc2626' : 'var(--accent-blue)' }}>
                        {u.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {invitations.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem', background: 'rgba(59,130,246,0.04)' }}>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>{inv.name} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>(invited)</span></td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{inv.email}</td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>{inv.department}</td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      {inv.status === 'PENDING' && <span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8' }}>PENDING</span>}
                      {inv.status === 'ACCEPTED' && <span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>ACCEPTED</span>}
                      {(inv.status === 'EXPIRED' || inv.status === 'REVOKED') && <span style={{ padding: '0.2rem 0.55rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b' }}>{inv.status}</span>}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleResend(inv.id)} style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <RotateCcw size={12} /> Resend
                        </button>
                        {inv.status === 'PENDING' && (
                          <button onClick={() => handleRevoke(inv.id)} style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', fontSize: '0.75rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <XCircle size={12} /> Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {hodUsers.length === 0 && invitations.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No HOD accounts or invitations yet. Click "Create HOD Account" to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALL USERS TAB */}
      {activeSubTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filters */}
          <div className="sunlit-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Role:</label>
                <select style={{ ...INPUT_STYLE, width: 'auto', padding: '0.4rem 0.75rem' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="hod">HOD</option>
                  <option value="staff">Staff</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Department:</label>
                <select style={{ ...INPUT_STYLE, width: 'auto', padding: '0.4rem 0.75rem' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  <option value="all">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Status:</label>
                <select style={{ ...INPUT_STYLE, width: 'auto', padding: '0.4rem 0.75rem' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{filteredUsers.length} user(s) found</span>
            </div>
          </div>

          <div className="sunlit-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {['Name / Email', 'College ID', 'Role', 'Department', 'Status', 'Action'].map(h => <th key={h} style={{ padding: '0.85rem 1.25rem' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users match the selected filters.</td></tr>
                ) : filteredUsers.map(u => <UserRow key={u.id} u={u} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODALS ─── */}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div style={MODAL_STYLE} onClick={(e) => e.target === e.currentTarget && setShowDeptModal(false)}>
          <div style={CARD_STYLE}>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Add New Department</h2>
            <form onSubmit={handleAddDepartment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={LABEL_STYLE}>Department Name *</label><input style={INPUT_STYLE} required value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g. Civil Engineering" /></div>
              <div><label style={LABEL_STYLE}>Department Code</label><input style={INPUT_STYLE} value={deptCode} onChange={e => setDeptCode(e.target.value)} placeholder="e.g. CIVIL (auto-generated if blank)" /></div>
              <div><label style={LABEL_STYLE}>Building / Block</label><input style={INPUT_STYLE} value={building} onChange={e => setBuilding(e.target.value)} /></div>
              <div><label style={LABEL_STYLE}>HOD Name</label><input style={INPUT_STYLE} value={hodName} onChange={e => setHodName(e.target.value)} placeholder="Dr. Jane Doe" /></div>
              <div>
                <label style={LABEL_STYLE}>HOD Email — sends invitation link</label>
                <input style={INPUT_STYLE} type="email" value={hodEmail} onChange={e => setHodEmail(e.target.value)} placeholder="hod.civil@college.edu (optional)" />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>An invite link will be emailed automatically so the HOD can set their own password.</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowDeptModal(false)} style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create HOD Account Modal */}
      {showCreateHodModal && (
        <div style={MODAL_STYLE} onClick={(e) => e.target === e.currentTarget && setShowCreateHodModal(false)}>
          <div style={CARD_STYLE}>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.3rem' }}>Create HOD Account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Create a direct login account for a Head of Department. No email invitation needed.</p>
            {hodError && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>{hodError}</div>}
            <form onSubmit={handleCreateHod} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={LABEL_STYLE}>Full Name *</label><input style={INPUT_STYLE} required value={hodForm.name} onChange={e => setHodForm(f => ({ ...f, name: e.target.value }))} placeholder="Prof. Eleanor Vance" /></div>
              <div><label style={LABEL_STYLE}>Email Address *</label><input style={INPUT_STYLE} type="email" required value={hodForm.email} onChange={e => setHodForm(f => ({ ...f, email: e.target.value }))} placeholder="hod@college.edu" /></div>
              <div>
                <label style={LABEL_STYLE}>Department *</label>
                <select style={INPUT_STYLE} required value={hodForm.department} onChange={e => setHodForm(f => ({ ...f, department: e.target.value }))}>
                  <option value="">— Select Department —</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>HOD's department cannot be changed after creation.</div>
              </div>
              <PasswordInput label="Temporary Password *" value={hodForm.password} onChange={e => setHodForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" required />
              <PasswordInput label="Confirm Password *" value={hodForm.confirmPassword} onChange={e => setHodForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Re-enter password" required />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowCreateHodModal(false); setHodError(''); }} style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={hodSubmitting} className="btn btn-primary" style={{ flex: 2, padding: '0.75rem' }}>{hodSubmitting ? 'Creating...' : 'Create HOD Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Invite HOD Modal */}
      {showInviteModal && (
        <div style={MODAL_STYLE} onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}>
          <div style={CARD_STYLE}>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.3rem' }}>Send HOD Invitation</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Email the HOD a secure link to set their own password and join the platform.</p>
            <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={LABEL_STYLE}>Department *</label>
                <select style={INPUT_STYLE} required value={inviteDept} onChange={e => setInviteDept(e.target.value)}>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div><label style={LABEL_STYLE}>HOD Name *</label><input style={INPUT_STYLE} required value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Prof. Alan Turing" /></div>
              <div><label style={LABEL_STYLE}>HOD Email *</label><input style={INPUT_STYLE} type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="hod@college.edu" /></div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.75rem' }} disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Invitation Email'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
