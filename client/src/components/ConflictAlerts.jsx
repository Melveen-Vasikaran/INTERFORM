import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { updateBookingStatus } from '../utils/api';
import { useApp } from '../context/AppContext';

export default function ConflictAlerts({ conflicts = [], onResolved }) {
  const { addToast, refreshData } = useApp();

  const handleResolve = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus, `Resolved via Conflict Radar by Administrator.`);
      addToast(`Conflict for booking ${bookingId} resolved to ${newStatus.toUpperCase()}!`, 'success');
      refreshData();
      onResolved && onResolved();
    } catch (err) {
      addToast('Failed to resolve conflict.', 'danger');
    }
  };

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <CheckCircle2 size={26} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Zero Active Schedule Conflicts</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          All shared departmental resources are synchronized with no overlapping reservation windows.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {conflicts.map(c => (
        <div key={c.id} className="glass-card" style={{
          padding: '1.25rem 1.5rem',
          borderLeft: '4px solid var(--accent-rose)',
          background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.08) 0%, rgba(19, 27, 46, 1) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.2)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Conflict Flag #{c.id}
                  </span>
                  <span className="status-pill conflict">Collides</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {c.resourceName}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Requesting Dept: <strong>{c.requestingDepartmentName}</strong> ({c.requestedBy})
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                  Time Window: {new Date(c.startDate).toLocaleString()} — {new Date(c.endDate).toLocaleString()}
                </div>
                {c.approverNote && (
                  <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.4rem', fontStyle: 'italic' }}>
                    ⚠️ {c.approverNote}
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', fontWeight: 600 }}>
                Resolution Actions:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => handleResolve(c.id, 'Approved')}
                >
                  Override & Approve
                </button>
                <button 
                  className="btn-danger"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => handleResolve(c.id, 'Rejected')}
                >
                  Decline Booking
                </button>
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
