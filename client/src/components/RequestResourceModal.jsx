import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { submitRequest } from '../utils/api';
import { X, Calendar, Clock, FileText, Send, AlertCircle } from 'lucide-react';
import SmartAlternativesModal from './SmartAlternativesModal';

export default function RequestResourceModal({ resource, onClose, onSuccess }) {
  const { user, addToast } = useApp();
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflictData, setConflictData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose || !date || !startTime || !endTime) {
      addToast('Please fill in all required fields.', 'danger');
      return;
    }

    setLoading(true);
    setConflictData(null);

    try {
      const payload = {
        resourceId: resource.id,
        resourceName: resource.name,
        department,
        purpose,
        date,
        startTime,
        endTime,
        message
      };

      const res = await submitRequest(payload);
      addToast('Request submitted successfully.', 'success');
      if (onSuccess) onSuccess(res.request);
      onClose();
    } catch (err) {
      if (err.status === 409 && err.data?.conflict) {
        // Handle Conflict & Smart Alternatives
        setConflictData({
          reason: err.data.reason,
          alternatives: err.data.alternatives || []
        });
      } else {
        addToast(err.message || 'Failed to submit request.', 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlternative = (altResource) => {
    // Replace selected resource with alternative
    setConflictData(null);
    addToast(`Switched request to suggested alternative: ${altResource.name}`, 'info');
    onClose();
    // Re-open request modal for alternative resource
    onSuccess(null, altResource);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
              RESOURCE REQUEST FORM
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Request {resource.name}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Conflict Warning banner if conflict occurred */}
        {conflictData && (
          <div style={{
            background: 'var(--status-error-bg)',
            border: '1px solid var(--status-error-border)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-error-text)', fontWeight: 700, fontSize: '0.9rem' }}>
              <AlertCircle size={18} /> Conflict Detected
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--status-error-text)', marginTop: '0.25rem' }}>
              This resource is unavailable during the selected time. {conflictData.reason}
            </p>

            {conflictData.alternatives.length > 0 && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--status-error-border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  SUGGESTED ALTERNATIVES:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {conflictData.alternatives.map((alt) => (
                    <div key={alt.id} style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.6rem 0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{alt.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{alt.department} • Capacity: {alt.capacity}</div>
                      </div>
                      <button
                        onClick={() => handleSelectAlternative(alt)}
                        className="btn btn-primary btn-sm"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Resource Summary */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem'
          }}>
            <strong>Selected Resource:</strong> {resource.name} ({resource.location})
          </div>

          {/* Department & Date */}
          <div className="grid-2">
            <div className="form-group">
              <label>Requesting Department</label>
              <input
                type="text"
                className="form-control"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Reservation Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Times */}
          <div className="grid-2">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                className="form-control"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                className="form-control"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Purpose */}
          <div className="form-group">
            <label>Purpose of Request</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Guest Lecture, Lab Work, Student Event"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              required
            />
          </div>

          {/* Additional Requirements */}
          <div className="form-group">
            <label>Message / Additional Requirements</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Specify setup requirements, extra hardware, mic setup, etc."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Send size={16} />
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
