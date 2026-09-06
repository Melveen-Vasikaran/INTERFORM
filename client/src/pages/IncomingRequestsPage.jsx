import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchRequests, approveRequest, rejectRequest } from '../utils/api';
import { Inbox, CheckCircle2, XCircle, Clock } from 'lucide-react';
import RejectionReasonModal from '../components/RejectionReasonModal';

export default function IncomingRequestsPage() {
  const { user, addToast } = useApp();
  const [requests, setRequests] = useState([]);
  const [selectedRejectReq, setSelectedRejectReq] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await fetchRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveRequest(id);
      addToast('Request approved and booking confirmed.', 'success');
      loadRequests();
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
      loadRequests();
    } catch (err) {
      addToast(err.message || 'Rejection failed.', 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
          HOD APPROVAL SYSTEM
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
          INCOMING REQUESTS
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Review and approve inter-departmental resource reservation requests.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading incoming requests...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <Inbox size={36} color="var(--text-muted)" />
          <h3>No incoming requests</h3>
          <p>There are currently no requests pending your approval.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => (
            <div key={req.id} className="sunlit-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{req.resource}</h3>
                  <span className={`badge-status ${req.status === 'Approved' ? 'badge-available' : req.status === 'Pending' ? 'badge-reserved' : 'badge-rejected'}`}>
                    {req.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Requester: <strong>{req.requester}</strong> ({req.department})
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Purpose: <strong>{req.purpose}</strong> • Date: <strong>{req.date}</strong> ({req.startTime} - {req.endTime})
                </div>
                {req.message && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.35rem' }}>
                    Note: "{req.message}"
                  </div>
                )}
              </div>

              {req.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setSelectedRejectReq(req)} className="btn btn-danger btn-sm">
                    <XCircle size={15} /> Reject
                  </button>
                  <button onClick={() => handleApprove(req.id)} className="btn btn-success btn-sm">
                    <CheckCircle2 size={15} /> Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedRejectReq && (
        <RejectionReasonModal
          request={selectedRejectReq}
          onClose={() => setSelectedRejectReq(null)}
          onConfirm={handleConfirmReject}
        />
      )}
    </div>
  );
}
