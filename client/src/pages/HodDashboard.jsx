import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchResources, fetchRequests, fetchBookings, fetchEvents, approveRequest, rejectRequest } from '../utils/api';
import { Inbox, Building2, Clock, Calendar, CheckCircle2, XCircle, ArrowRight, Plus } from 'lucide-react';
import RejectionReasonModal from '../components/RejectionReasonModal';
import Avatar from '../components/Avatar';
import AddResourceModal from '../components/AddResourceModal';

export default function HodDashboard({ onNavigate }) {
  const { user, addToast } = useApp();
  const [stats, setStats] = useState({
    deptResourcesCount: 0,
    pendingRequestsCount: 0,
    todaysBookingsCount: 0,
    upcomingEventsCount: 0
  });

  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRejectReq, setSelectedRejectReq] = useState(null);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [addResourceCategory, setAddResourceCategory] = useState('Classrooms');

  const loadHodData = async () => {
    try {
      const [resList, reqList, bkList, evtList] = await Promise.all([
        fetchResources(),
        fetchRequests(),
        fetchBookings(),
        fetchEvents()
      ]);

      const deptName = user?.department || 'Computer Science';

      const deptRes = resList.filter(r => r.department === deptName);
      const pending = reqList.filter(r => r.status === 'Pending');
      const todayBk = bkList.filter(b => b.status === 'Upcoming' || b.status === 'Active');
      const deptEvts = evtList.filter(e => e.department === deptName);

      setStats({
        deptResourcesCount: deptRes.length,
        pendingRequestsCount: pending.length,
        todaysBookingsCount: todayBk.length,
        upcomingEventsCount: deptEvts.length
      });

      setPendingRequests(pending);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHodData();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      await approveRequest(id);
      addToast('Request approved and booking confirmed.', 'success');
      loadHodData();
    } catch (err) {
      addToast(err.message || 'Approval failed.', 'danger');
    }
  };

  const handleConfirmReject = async (reason) => {
    if (!selectedRejectReq) return;
    try {
      await rejectRequest(selectedRejectReq.id, reason);
      addToast('Request rejected.', 'info');
      setSelectedRejectReq(null);
      loadHodData();
    } catch (err) {
      addToast(err.message || 'Rejection failed.', 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="sunlit-card" style={{ background: 'var(--accent-blue-light)', border: '1px solid var(--accent-blue-border)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Avatar user={user} size="lg" />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
              HOD & DEPARTMENT COORDINATOR DASHBOARD
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Good Morning, {user?.name || 'Department Head'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Managing Department: <strong>{user?.department || 'Computer Science'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Overview Metric Cards */}
      <div className="grid-4">
        {/* Department Resources -> Resource Explorer */}
        <div
          className="sunlit-card"
          onClick={() => onNavigate('resources')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Department Resources"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>DEPARTMENT RESOURCES</span>
            <ArrowRight size={14} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.2rem 0' }}>
            {stats.deptResourcesCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Owned facilities & gear</div>
        </div>

        {/* Pending Requests -> Incoming Requests Page */}
        <div
          className="sunlit-card"
          onClick={() => onNavigate('incoming')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to review Pending Requests"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>PENDING REQUESTS</span>
            <ArrowRight size={14} color="var(--status-reserved-text)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-reserved-text)', margin: '0.2rem 0' }}>
            {stats.pendingRequestsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Awaiting your decision</div>
        </div>

        {/* Today's Bookings -> Bookings Log */}
        <div
          className="sunlit-card"
          onClick={() => onNavigate('bookings')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Bookings Log"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>TODAY'S BOOKINGS</span>
            <ArrowRight size={14} color="var(--status-available-text)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '0.2rem 0' }}>
            {stats.todaysBookingsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scheduled reservations</div>
        </div>

        {/* Upcoming Events -> Department Events */}
        <div
          className="sunlit-card"
          onClick={() => onNavigate('events')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Department Events"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>UPCOMING EVENTS</span>
            <ArrowRight size={14} color="var(--text-primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            {stats.upcomingEventsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Department seminars</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
        <div className="grid-4">
          <button 
            onClick={() => { setAddResourceCategory('Classrooms'); setShowAddResourceModal(true); }}
            className="sunlit-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <Plus size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Add Classroom</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Register new classroom</div>
            </div>
          </button>

          <button 
            onClick={() => { setAddResourceCategory('Laboratories'); setShowAddResourceModal(true); }}
            className="sunlit-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ background: 'var(--status-available-bg)', color: 'var(--status-available-text)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <Plus size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Add Laboratory</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Register lab facility</div>
            </div>
          </button>

          <button 
            onClick={() => { setAddResourceCategory('Technical Equipment'); setShowAddResourceModal(true); }}
            className="sunlit-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ background: 'var(--status-reserved-bg)', color: 'var(--status-reserved-text)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <Plus size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Add Equipment</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Register department gear</div>
            </div>
          </button>
        </div>
      </div>

      {/* Pending Incoming Requests Section */}
      <div className="sunlit-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Incoming Resource Requests</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Review inter-departmental and student requests for your department's resources
            </p>
          </div>
          <button onClick={() => onNavigate('incoming')} className="btn btn-outline btn-sm">
            View All Requests
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={32} color="var(--status-available-text)" />
            <h3>No pending requests</h3>
            <p>All incoming requests for your department have been processed.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pendingRequests.map(req => (
              <div key={req.id} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{req.resource}</span>
                    <span className="badge-status badge-reserved">Pending</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Requested by <strong>{req.requester}</strong> ({req.department})
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    📅 Date: <strong>{req.date}</strong> • ⏰ Time: <strong>{req.startTime} - {req.endTime}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                    "{req.purpose}" {req.message && `— Extra: ${req.message}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedRejectReq(req)}
                    className="btn btn-danger btn-sm"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="btn btn-success btn-sm"
                  >
                    <CheckCircle2 size={15} /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      {selectedRejectReq && (
        <RejectionReasonModal
          request={selectedRejectReq}
          onClose={() => setSelectedRejectReq(null)}
          onConfirm={handleConfirmReject}
        />
      )}

      {/* Add Resource Modal */}
      {showAddResourceModal && (
        <AddResourceModal
          onClose={() => setShowAddResourceModal(false)}
          onSuccess={async () => {
            setShowAddResourceModal(false);
            loadHodData();
            addToast('Resource added successfully.', 'success');
          }}
          initialCategory={addResourceCategory}
        />
      )}
    </div>
  );
}
