import React from 'react';
import { Calendar, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function TimelineGantt({ projects = [] }) {
  if (!projects || projects.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No projects available.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {projects.map(proj => (
        <div key={proj.id} className="glass-card" style={{ padding: '1.5rem' }}>
          
          {/* Project Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="dept-tag">
                  <span className="dept-dot" style={{ background: '#3b82f6' }}></span>
                  Lead: {proj.leadDepartmentName}
                </span>
                <span className={`status-pill ${proj.status.toLowerCase().replace(' ', '-')}`}>
                  {proj.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--text-primary)' }}>
                {proj.name}
              </h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completion Status</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                {proj.completionPercentage}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden', margin: '1rem 0 1.25rem 0' }}>
            <div style={{
              height: '100%',
              width: `${proj.completionPercentage}%`,
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '4px'
            }} />
          </div>

          {/* Participating Departments Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Participating Depts:</span>
            {proj.participatingDepartments.map((deptName, idx) => (
              <span key={idx} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                {deptName}
              </span>
            ))}
          </div>

          {/* Milestones Horizontal Workflow Timeline */}
          <div style={{
            background: 'rgba(11, 15, 25, 0.6)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cross-Departmental Milestone Chain & Dependencies
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${proj.milestones.length}, 1fr)`, gap: '1rem', position: 'relative' }}>
              {proj.milestones.map((m, idx) => {
                const isCompleted = m.status === 'Completed';
                const isInProgress = m.status === 'In Progress';
                
                return (
                  <div key={m.id} style={{
                    background: isCompleted ? 'rgba(16, 185, 129, 0.08)' : isInProgress ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : isInProgress ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{m.dept}</span>
                      {isCompleted ? <CheckCircle2 size={14} color="#34d399" /> : <Clock size={14} color="#fbbf24" />}
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.3' }}>
                      {m.title}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      Due: {m.dueDate}
                    </div>

                    {m.dependsOn && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#fbbf24', fontStyle: 'italic' }}>
                        🔗 Depends on {m.dependsOn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
