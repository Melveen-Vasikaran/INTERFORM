import React from 'react';
import { X, Building2, MapPin, Users, Clock, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';

export default function ResourceDetailsModal({ resource, onClose, onRequest }) {
  if (!resource) return null;

  // Sample availability timeline slots for today
  const timeSlots = [
    { time: '08:00', status: 'Available' },
    { time: '09:00', status: 'Available' },
    { time: '10:00', status: 'Booked', user: 'Specialized Workshop' },
    { time: '11:00', status: 'Booked', user: 'Specialized Workshop' },
    { time: '12:00', status: 'Available' },
    { time: '13:00', status: 'Available' },
    { time: '14:00', status: resource.maintenancePeriods?.length ? 'Maintenance' : 'Available' },
    { time: '15:00', status: resource.maintenancePeriods?.length ? 'Maintenance' : 'Available' },
    { time: '16:00', status: 'Available' },
    { time: '17:00', status: 'Available' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
              {resource.category}
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {resource.name}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Quick Facts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          padding: '1rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>DEPARTMENT</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{resource.department}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>LOCATION</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{resource.location}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CAPACITY</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{resource.capacity} Seats / Units</div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>Description</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {resource.description || 'Standard institution resource for academic and departmental scheduling.'}
          </p>
        </div>

        {/* Facilities & Equipment */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Facilities & Equipment</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {resource.equipment && resource.equipment.length > 0 ? (
              resource.equipment.map((item, i) => (
                <span key={i} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)'
                }}>
                  ✓ {item}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Standard classroom setup.</span>
            )}
          </div>
        </div>

        {/* Availability Timeline */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="var(--accent-blue)" /> Today's Schedule Timeline
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem'
          }}>
            {timeSlots.map((slot, idx) => (
              <div key={idx} style={{
                padding: '0.5rem 0.35rem',
                textAlign: 'center',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid',
                backgroundColor: slot.status === 'Available' ? 'var(--status-available-bg)' : slot.status === 'Booked' ? 'var(--status-reserved-bg)' : 'var(--status-maintenance-bg)',
                borderColor: slot.status === 'Available' ? 'var(--status-available-border)' : slot.status === 'Booked' ? 'var(--status-reserved-border)' : 'var(--status-maintenance-border)',
                color: slot.status === 'Available' ? 'var(--status-available-text)' : slot.status === 'Booked' ? 'var(--status-reserved-text)' : 'var(--status-maintenance-text)'
              }}>
                <div>{slot.time}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, marginTop: '0.1rem' }}>{slot.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
          {onRequest && resource.status === 'Available' && (
            <button
              onClick={() => {
                onClose();
                onRequest(resource);
              }}
              className="btn btn-primary"
            >
              Request Resource
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
