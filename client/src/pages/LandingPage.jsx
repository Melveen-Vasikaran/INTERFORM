import React from 'react';
import { Search, Share2, CalendarDays, ArrowRight, ShieldCheck, Sparkles, Layers, Building2, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ onExplore, onLogin }) {
  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <header style={{
        padding: '1.25rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'var(--accent-blue)',
            color: '#FFFFFF',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}>
            I
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              INTERFORM
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Connect. Share. Plan.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={onExplore} className="btn btn-outline">
            Explore Catalog
          </button>
          <button onClick={onLogin} className="btn btn-primary">
            Sign In / Demo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '5rem 2rem 4rem 2rem',
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--accent-blue-light)',
          color: 'var(--accent-blue)',
          padding: '0.35rem 0.85rem',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          border: '1px solid var(--accent-blue-border)'
        }}>
          <Sparkles size={14} /> College-Wide Resource Sharing & Scheduling Engine
        </div>

        <h1 style={{
          fontSize: '3.4rem',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          marginBottom: '1.25rem'
        }}>
          One campus.<br />
          Many departments.<br />
          <span style={{ color: 'var(--accent-blue)' }}>Shared possibilities.</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem auto',
          fontWeight: 400,
          lineHeight: 1.6
        }}>
          Discover, request, manage, and share campus resources from one simple platform.
          Designed for students, faculty, department heads, and campus administrators.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onExplore} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Explore Resources <ArrowRight size={18} />
          </button>
          <button onClick={onLogin} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Get Started
          </button>
        </div>
      </section>

      {/* Three Concepts: FIND - SHARE - PLAN */}
      <section style={{
        padding: '3.5rem 2rem',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Three Pillars of INTERFORM</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
              Transforming how higher education institutions share physical and digital assets
            </p>
          </div>

          <div className="grid-3">
            {/* FIND */}
            <div className="sunlit-card" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{
                background: 'var(--accent-blue-light)',
                color: 'var(--accent-blue)',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Search size={24} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CONCEPT 01
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0.5rem 0' }}>FIND</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Discover labs, auditoriums, seminar halls, high-end laptops, and 4K projectors across all campus buildings with instant capacity and equipment filters.
              </p>
            </div>

            {/* SHARE */}
            <div className="sunlit-card" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{
                background: 'var(--status-available-bg)',
                color: 'var(--status-available-text)',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Share2 size={24} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-available-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CONCEPT 02
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0.5rem 0' }}>SHARE</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Eliminate departmental silos. Request excess resource capacity from other departments with transparent HOD approval workflows and zero paperwork.
              </p>
            </div>

            {/* PLAN */}
            <div className="sunlit-card" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{
                background: 'var(--gold-bg)',
                color: 'var(--gold-accent)',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <CalendarDays size={24} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CONCEPT 03
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0.5rem 0' }}>PLAN</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Visual Campus Planner timeline with automated backend conflict detection to prevent double-booking and schedule collisions before they occur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Features Highlight */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Built for Every Academic Role</h2>
          <p style={{ color: 'var(--text-muted)' }}>Simple enough for a student. Powerful enough for an HOD. Complete for administrators.</p>
        </div>

        <div className="grid-4">
          <div className="sunlit-card">
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Students</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quick action cards to check availability, submit requests, and track upcoming bookings.</p>
          </div>
          <div className="sunlit-card">
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Staff</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Schedule lab workshops, reserve equipment, and organize campus events with ease.</p>
          </div>
          <div className="sunlit-card">
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>HODs</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage department resources, review incoming requests, and set maintenance windows.</p>
          </div>
          <div className="sunlit-card">
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Admins</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Global system configuration, user role management, utilization analytics, and college settings.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '2rem 3rem',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          <strong>INTERFORM</strong> — Connect. Share. Plan.
        </div>
        <div>
          Universal Campus Resource Management Engine
        </div>
      </footer>
    </div>
  );
}
