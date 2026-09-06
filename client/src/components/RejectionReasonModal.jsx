import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function RejectionReasonModal({ request, onClose, onConfirm }) {
  const [reason, setReason] = useState('Resource already reserved during the requested time.');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-error-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={20} /> Reject Request
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Please provide a clear reason for rejecting <strong>{request.requester}</strong>'s request for <strong>{request.resource}</strong> on {request.date}.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rejection Reason</label>
            <textarea
              className="form-control"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
