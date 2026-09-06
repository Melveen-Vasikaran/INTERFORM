import React from 'react';
import { Building2, Users, MapPin, Wrench, Info, AlertCircle } from 'lucide-react';

export default function ResourceCard({ resource, onViewDetails, onRequestResource }) {
  const isAllotted = resource.status === 'Reserved' || resource.status === 'Unavailable' || resource.slotStatus === 'Unavailable';

  const getStatusBadge = () => {
    if (resource.status === 'Available' && resource.slotStatus !== 'Unavailable') {
      return <span className="badge-status badge-available">● Available</span>;
    }
    if (resource.status === 'Reserved') {
      return <span className="badge-status badge-reserved">● Allotted / Reserved</span>;
    }
    if (resource.status === 'Maintenance') {
      return <span className="badge-status badge-maintenance">● Maintenance</span>;
    }
    return <span className="badge-status badge-unavailable">● Unavailable (Allotted)</span>;
  };

  return (
    <div className="sunlit-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Header: Title & Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {resource.category}
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {resource.name}
            </h3>
          </div>
          {getStatusBadge()}
        </div>

        {/* Description snippet */}
        {resource.description && (
          <p style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.85rem',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {resource.description}
          </p>
        )}

        {/* Info Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={15} color="var(--text-muted)" />
            <span><strong>Department:</strong> {resource.department}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={15} color="var(--text-muted)" />
            <span><strong>Location:</strong> {resource.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={15} color="var(--text-muted)" />
            <span><strong>Capacity:</strong> {resource.capacity} Seats / Units</span>
          </div>
        </div>

        {/* Allotment Warning Note */}
        {isAllotted && (
          <div style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--status-reserved-bg)',
            border: '1px solid var(--status-reserved-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            color: 'var(--status-reserved-text)',
            fontWeight: 600,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <AlertCircle size={14} /> Currently allotted or unavailable for immediate booking.
          </div>
        )}

        {/* Equipment Badges */}
        {resource.equipment && resource.equipment.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              EQUIPMENT & SPECIFICATIONS:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {resource.equipment.slice(0, 3).map((item, idx) => (
                <span key={idx} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  {item}
                </span>
              ))}
              {resource.equipment.length > 3 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                  +{resource.equipment.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
        <button
          onClick={() => onViewDetails(resource)}
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
        >
          View Details
        </button>
        {onRequestResource && !isAllotted && (
          <button
            onClick={() => onRequestResource(resource)}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            Request
          </button>
        )}
      </div>
    </div>
  );
}
