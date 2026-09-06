import React from 'react';
import { X, Sparkles, Building2, MapPin, Users, CheckCircle2 } from 'lucide-react';

export default function SmartAlternativesModal({ alternatives, onClose, onSelectAlternative }) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: 'var(--gold-bg)',
              color: 'var(--gold-accent)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>SUGGESTED ALTERNATIVES</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Matching requested category & capacity</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {alternatives.map((alt) => (
            <div key={alt.id} style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{alt.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  🏢 {alt.department} • 📍 {alt.location}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--status-available-text)', fontWeight: 600, marginTop: '0.2rem' }}>
                  ✓ Capacity: {alt.capacity} Seats • Available for requested slot
                </div>
              </div>

              <button
                onClick={() => onSelectAlternative(alt)}
                className="btn btn-primary btn-sm"
              >
                Select Resource
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
