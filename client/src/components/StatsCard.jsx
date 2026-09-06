import React from 'react';

export default function StatsCard({ title, value, change, icon: Icon, color = '#3b82f6', subtitle }) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{title}</span>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-md)',
        background: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.15)`,
        border: `1px solid rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.3)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
}
