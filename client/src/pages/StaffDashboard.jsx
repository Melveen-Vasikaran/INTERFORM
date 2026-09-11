import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchResources, fetchRequests, fetchBookings, fetchEvents } from '../utils/api';
import { Search, CalendarDays, FileCheck, Clock, Calendar, PlusCircle, ArrowRight } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function StaffDashboard({ onNavigate }) {
  const { user } = useApp();
  const [stats, setStats] = useState({
    activeBookings: 0,
    pendingRequests: 0,
    eventsCount: 0
  });

  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const [reqs, bks, evts] = await Promise.all([
          fetchRequests(),
          fetchBookings(),
          fetchEvents()
        ]);
        setStats({
          activeBookings: bks.filter(b => b.status === 'Upcoming' || b.status === 'Active').length,
          pendingRequests: reqs.filter(r => r.status === 'Pending').length,
          eventsCount: evts.length
        });
      } catch (err) {
        console.error(err);
      }
    };
    loadStaffData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="sunlit-card" style={{ background: 'var(--accent-blue-light)', border: '1px solid var(--accent-blue-border)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Avatar user={user} size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
              STAFF / INSTRUCTOR DASHBOARD
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Good Morning, {user?.name || 'Staff Member'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Department: <strong>{user?.department || 'Computer Science'}</strong>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
              {(user?.staffId || user?.collegeId) && (
                <span style={{ padding: '0.2rem 0.65rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  ID: {user.staffId || user.collegeId}
                </span>
              )}
              {user?.designation && (
                <span style={{ padding: '0.2rem 0.65rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user.designation}
                </span>
              )}
              <span style={{ padding: '0.2rem 0.65rem', background: '#fefce8', border: '1px solid #fde68a', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
                STAFF
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
        <div className="grid-4">
          <button onClick={() => onNavigate('resources')} className="sunlit-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <Search size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Find Resource</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Search labs & equipment</div>
            </div>
          </button>

          <button onClick={() => onNavigate('resources')} className="sunlit-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ background: 'var(--status-available-bg)', color: 'var(--status-available-text)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <PlusCircle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Request Resource</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submit lab or hall request</div>
            </div>
          </button>

          <button onClick={() => onNavigate('planner')} className="sunlit-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ background: 'var(--gold-bg)', color: 'var(--gold-accent)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <CalendarDays size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Campus Planner</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visual usage timeline</div>
            </div>
          </button>

          <button onClick={() => onNavigate('events')} className="sunlit-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <Calendar size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Events</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Seminars & workshops</div>
            </div>
          </button>
        </div>
      </div>

      {/* Interactive Overview Metrics */}
      <div className="grid-3">
        <div
          className="sunlit-card"
          onClick={() => onNavigate('bookings')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Active Bookings"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ACTIVE BOOKINGS</span>
            <ArrowRight size={14} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.2rem 0' }}>{stats.activeBookings}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Reserved sessions</div>
        </div>

        <div
          className="sunlit-card"
          onClick={() => onNavigate('requests')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Pending Requests"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>PENDING REQUESTS</span>
            <ArrowRight size={14} color="var(--status-reserved-text)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-reserved-text)', margin: '0.2rem 0' }}>{stats.pendingRequests}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Awaiting approval</div>
        </div>

        <div
          className="sunlit-card"
          onClick={() => onNavigate('events')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Scheduled Events"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>SCHEDULED EVENTS</span>
            <ArrowRight size={14} color="var(--status-available-text)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '0.2rem 0' }}>{stats.eventsCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>College & Dept events</div>
        </div>
      </div>
    </div>
  );
}
