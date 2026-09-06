import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, CheckCircle, Coins } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createBooking } from '../utils/api';

export default function BookingModal({ resource, onClose, onSuccess }) {
  const { activeDept, addToast, refreshData } = useApp();

  const [startDate, setStartDate] = useState('2026-09-06T09:00');
  const [endDate, setEndDate] = useState('2026-09-06T17:00');
  const [requestedBy, setRequestedBy] = useState('Alex Rivera');
  const [purpose, setPurpose] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);

  if (!resource) return null;

  // Calculate estimated total hours & credits
  const start = new Date(startDate);
  const end = new Date(endDate);
  const hoursTotal = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600))) || 1;
  const estimatedCredits = hoursTotal * (resource.hourlyCreditCost || 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      addToast('Please enter the project or reservation purpose.', 'warning');
      return;
    }

    setSubmitting(true);
    setConflictWarning(null);

    try {
      const res = await createBooking({
        resourceId: resource.id,
        requestingDepartmentId: activeDept?.id || 'dept-eng',
        requestingDepartmentName: activeDept?.name || 'Engineering',
        requestedBy,
        purpose,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        priority
      });

      if (res.hasConflict) {
        setConflictWarning(res.conflictingBooking);
        addToast('Warning: Schedule conflict detected! Request flagged for review.', 'warning');
      } else {
        addToast(`Booking request submitted successfully for ${resource.name}!`, 'success');
        refreshData();
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      addToast('Failed to create booking request.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Reserve Resource</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{resource.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* Department Info & Credits */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requesting Dept</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {activeDept?.name || 'Engineering'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rate & Total</span>
                <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Coins size={14} />
                  {estimatedCredits} credits ({hoursTotal} hrs)
                </div>
              </div>
            </div>

            {/* Conflict Banner if Detected */}
            {conflictWarning && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                color: '#f87171',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <AlertTriangle size={16} />
                  Schedule Conflict Flagged
                </div>
                <div style={{ marginTop: '0.35rem', lineHeight: '1.4' }}>
                  This time window overlaps with an existing booking by <strong>{conflictWarning.requestingDepartmentName}</strong> ({conflictWarning.purpose}). Your request is saved with <strong>Conflict Status</strong> for resolution.
                </div>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Requested By</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={requestedBy} 
                  onChange={(e) => setRequestedBy(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Strategic Priority</label>
                <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Line-Stop</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project / Reservation Purpose</label>
              <textarea 
                className="form-textarea" 
                rows="3" 
                placeholder="Describe the cross-departmental objective or milestone..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
