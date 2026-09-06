import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchDepartments, createDepartment, fetchUsers, updateUser, fetchResources, fetchInvitations, inviteHod, revokeInvitation, resendInvitation } from '../utils/api';
import { Building2, Users, Layers, Plus, Edit, CheckCircle2, XCircle, Mail, RotateCcw } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function AdminManagementPage({ initialTab = 'departments' }) {
  const { addToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState(initialTab);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [building, setBuilding] = useState('Main Academic Block');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');

  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('hod');
  const [userDept, setUserDept] = useState('');

  // HOD Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAdminData = async () => {
    try {
      const [deptList, userList, resList, invList] = await Promise.all([
        fetchDepartments(),
        fetchUsers(),
        fetchResources(),
        fetchInvitations()
      ]);
      setDepartments(deptList);
      setUsers(userList);
      setResources(resList);
      setInvitations(invList);
      if (deptList.length > 0) {
        setUserDept(deptList[0].name);
        if (!inviteDept) setInviteDept(deptList[0].name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const res = await createDepartment({
        name: deptName,
        code: deptCode || deptName.substring(0, 4).toUpperCase(),
        building,
        hodName,
        hodEmail
      });
      addToast(res.message || 'Department created successfully.', 'success');
      setShowDeptModal(false);
      setDeptName('');
      setDeptCode('');
      setHodName('');
      setHodEmail('');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to create department.', 'danger');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // In a real app, this would call an API like createUser()
      // For this demo, we'll just mock a success toast since users are seeded in memory
      addToast(`User account for ${userName} (${userRole.toUpperCase()}) created in ${userDept}.`, 'success');
      setShowUserModal(false);
      setUserName('');
      setUserEmail('');
    } catch (err) {
      addToast(err.message || 'Failed to create user.', 'danger');
    }
  };

  const handleToggleUserActive = async (userObj) => {
    try {
      await updateUser(userObj.id, { isActive: !userObj.isActive });
      addToast(`User account ${!userObj.isActive ? 'activated' : 'deactivated'}.`, 'info');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Update failed.', 'danger');
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await inviteHod({
        name: inviteName,
        email: inviteEmail,
        department: inviteDept
      });
      addToast('Invitation sent successfully.', 'success');
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to send invitation.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (id) => {
    try {
      await resendInvitation(id);
      addToast('Invitation resent successfully.', 'success');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to resend.', 'danger');
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await revokeInvitation(id);
      addToast('Invitation revoked.', 'info');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to revoke.', 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
          ADMINISTRATIVE CONTROL CENTER
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
          CAMPUS ADMINISTRATION
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage departments, user credentials & roles, and institution resources.
        </p>
      </div>

      {/* Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveSubTab('departments')}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            fontWeight: activeSubTab === 'departments' ? 700 : 500,
            background: activeSubTab === 'departments' ? 'var(--accent-blue)' : 'transparent',
            color: activeSubTab === 'departments' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            fontWeight: activeSubTab === 'users' ? 700 : 500,
            background: activeSubTab === 'users' ? 'var(--accent-blue)' : 'transparent',
            color: activeSubTab === 'users' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Users & Roles ({users.length})
        </button>

        <button
          onClick={() => setActiveSubTab('hods')}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            fontWeight: activeSubTab === 'hods' ? 700 : 500,
            background: activeSubTab === 'hods' ? 'var(--accent-blue)' : 'transparent',
            color: activeSubTab === 'hods' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          HOD Management
        </button>
      </div>

      {/* Content Panels */}
      {activeSubTab === 'departments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowDeptModal(true)} className="btn btn-primary">
              <Plus size={18} /> Add Department
            </button>
          </div>

          <div className="sunlit-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>DEPARTMENT NAME</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>CODE</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>BUILDING</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>HOD NAME</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{d.name}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>{d.code}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>{d.building}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>{d.hodName || 'Assigned HOD'}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge-status badge-available">● Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowUserModal(true)} className="btn btn-primary">
              <Plus size={18} /> Add User
            </button>
          </div>

          <div className="sunlit-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>NAME</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>COLLEGE ID / EMAIL</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>ROLE</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>DEPARTMENT</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar user={u} size="sm" />
                        <span style={{ fontWeight: 700 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                      <div>{u.collegeId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: 'var(--accent-blue-light)',
                        color: 'var(--accent-blue)',
                        textTransform: 'uppercase'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>{u.department}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        onClick={() => handleToggleUserActive(u)}
                        className={`btn btn-sm ${u.isActive !== false ? 'btn-outline' : 'btn-primary'}`}
                      >
                        {u.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="modal-overlay" onClick={() => setShowDeptModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Add New Department</h3>
            <form onSubmit={handleAddDepartment}>
              <div className="form-group">
                <label>Department Name</label>
                <input type="text" className="form-control" placeholder="e.g. Civil Engineering" value={deptName} onChange={e => setDeptName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Department Code</label>
                <input type="text" className="form-control" placeholder="e.g. CIVIL" value={deptCode} onChange={e => setDeptCode(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Building / Block</label>
                <input type="text" className="form-control" value={building} onChange={e => setBuilding(e.target.value)} />
              </div>
              <div className="form-group">
                <label>HOD Name</label>
                <input type="text" className="form-control" placeholder="e.g. Dr. Jane Doe" value={hodName} onChange={e => setHodName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>HOD Email Address (Sends Joining Link)</label>
                <input type="email" className="form-control" placeholder="e.g. hod.civil@college.edu" value={hodEmail} onChange={e => setHodEmail(e.target.value)} />
                <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  An automated joining link will be emailed to this address for the HOD to set up their account and enter their dashboard.
                </small>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowDeptModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Create User Account</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Assign a role and department. Users with the HOD role will automatically manage resources and approvals for their assigned department.
            </p>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" className="form-control" placeholder="e.g. Dr. Alan Turing" value={userName} onChange={e => setUserName(e.target.value)} required />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" className="form-control" placeholder="alan@university.edu" value={userEmail} onChange={e => setUserEmail(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>System Role *</label>
                  <select className="form-control" value={userRole} onChange={e => setUserRole(e.target.value)} required>
                    <option value="student">Student</option>
                    <option value="staff">Staff / Faculty</option>
                    <option value="hod">Head of Department (HOD)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Department Assignment *</label>
                  <select className="form-control" value={userDept} onChange={e => setUserDept(e.target.value)} required>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                    <option value="Campus Wide">Campus Wide / No Department</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeSubTab === 'hods' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
              <Mail size={18} /> Invite HOD
            </button>
          </div>

          <div className="sunlit-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>DEPARTMENT</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>HOD NAME / EMAIL</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>STATUS</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {/* Active HODs */}
                {users.filter(u => u.role === 'hod').map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{u.department}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge-status badge-available">● Active</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>-</td>
                  </tr>
                ))}
                
                {/* Pending/Expired/Revoked Invitations */}
                {invitations.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.88rem', background: inv.status === 'PENDING' ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{inv.department}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600 }}>{inv.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {inv.status === 'PENDING' && <span className="badge-status badge-reserved">● Invitation Pending</span>}
                      {inv.status === 'EXPIRED' && <span className="badge-status badge-unavailable">● Expired</span>}
                      {inv.status === 'REVOKED' && <span className="badge-status badge-unavailable">● Revoked</span>}
                      {inv.status === 'ACCEPTED' && <span className="badge-status badge-available">● Accepted</span>}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {(inv.status === 'PENDING' || inv.status === 'EXPIRED' || inv.status === 'REVOKED') && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleResend(inv.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} title="Resend Invitation">
                            <RotateCcw size={14} /> Resend
                          </button>
                          {inv.status === 'PENDING' && (
                            <button onClick={() => handleRevoke(inv.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--status-danger-text)', borderColor: 'var(--status-danger-border)' }} title="Revoke Invitation">
                              <XCircle size={14} /> Revoke
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                
                {users.filter(u => u.role === 'hod').length === 0 && invitations.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No Head of Departments assigned or invited yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite HOD Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="sunlit-card" style={{ width: '100%', maxWidth: '450px', background: 'var(--bg-color)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Invite Head of Department</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Send an email invitation allowing a new HOD to create their secure account.
            </p>
            <form onSubmit={handleSendInvite}>
              <div className="form-group">
                <label>Department *</label>
                <select className="form-control" value={inviteDept} onChange={e => setInviteDept(e.target.value)} required>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>HOD Name *</label>
                <input type="text" className="form-control" placeholder="Enter full name" value={inviteName} onChange={e => setInviteName(e.target.value)} required />
              </div>
              
              <div className="form-group">
                <label>HOD Email *</label>
                <input type="email" className="form-control" placeholder="hod@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-outline" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
