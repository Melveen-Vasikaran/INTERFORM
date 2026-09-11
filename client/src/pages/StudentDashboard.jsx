import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchResources, fetchRequests, fetchBookings, fetchEvents } from '../utils/api';
import { Search, CalendarDays, FileCheck, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function StudentDashboard({ onNavigate }) {
  const { user } = useApp();
  const [stats, setStats] = useState({
    availableCount: 0,
    pendingCount: 0,
    upcomingCount: 0,
    todayEventsCount: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [resList, reqList, bkList, evtList] = await Promise.all([
          fetchResources(),
          fetchRequests(),
          fetchBookings(),
          fetchEvents()
        ]);

        const avail = resList.filter(r => r.status === 'Available').length;
        const pending = reqList.filter(r => r.status === 'Pending').length;
        const upcoming = bkList.filter(b => b.status === 'Upcoming').length;
        const eventsToday = evtList.length;

        setStats({
          availableCount: avail,
          pendingCount: pending,
          upcomingCount: upcoming,
          todayEventsCount: eventsToday
        });

        // Combine recent activity
        const activity = [
          ...reqList.map(r => ({
            id: r.id,
            title: `Request for ${r.resource}`,
            desc: `Status: ${r.status} (${r.date})`,
            time: r.createdAt,
            type: r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'danger' : 'info'
          })),
          ...bkList.map(b => ({
            id: b.id,
            title: `Booking: ${b.resource}`,
            desc: `Scheduled for ${b.date} (${b.startTime} - ${b.endTime})`,
            time: b.createdAt,
            type: 'success'
          }))
        ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 5);

        setRecentActivity(activity);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Greeting Banner */}
      <div className="sunlit-card" style={{ background: 'var(--accent-blue-light)', border: '1px solid var(--accent-blue-border)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Avatar user={user} size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              STUDENT DASHBOARD
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Good Morning, {user?.name || 'Student'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Department: <strong>{user?.department || 'Computer Science'}</strong>
            </p>
            {/* Student-specific identity tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
              {user?.registerNumber && (
                <span style={{ padding: '0.2rem 0.65rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  Reg: {user.registerNumber}
                </span>
              )}
              {user?.studentYear && (
                <span style={{ padding: '0.2rem 0.65rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Year {user.studentYear}
                </span>
              )}
              {user?.section && (
                <span style={{ padding: '0.2rem 0.65rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Section {user.section}
                </span>
              )}
              <span style={{ padding: '0.2rem 0.65rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                STUDENT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
        <div className="grid-4">
          <button
            onClick={() => onNavigate('resources')}
            className="sunlit-card"
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <Search size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Find a Resource</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Explore labs & gear</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('planner')}
            className="sunlit-card"
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ background: 'var(--status-available-bg)', color: 'var(--status-available-text)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <CalendarDays size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Check Availability</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>View campus timeline</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('requests')}
            className="sunlit-card"
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ background: 'var(--status-reserved-bg)', color: 'var(--status-reserved-text)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <FileCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>My Requests</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Track request status</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('bookings')}
            className="sunlit-card"
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>My Bookings</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upcoming reservations</div>
            </div>
          </button>
        </div>
      </div>

      {/* Interactive Overview Cards */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Overview</h3>
        <div className="grid-4">
          <div
            className="sunlit-card"
            onClick={() => onNavigate('resources')}
            style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            title="Click to view Available Resources"
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>AVAILABLE RESOURCES</span>
              <ArrowRight size={14} color="var(--status-available-text)" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '0.2rem 0' }}>
              {stats.availableCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Ready across campus</div>
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
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-reserved-text)', margin: '0.2rem 0' }}>
              {stats.pendingCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Awaiting HOD review</div>
          </div>

          <div
            className="sunlit-card"
            onClick={() => onNavigate('bookings')}
            style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            title="Click to view Upcoming Bookings"
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>UPCOMING BOOKINGS</span>
              <ArrowRight size={14} color="var(--accent-blue)" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.2rem 0' }}>
              {stats.upcomingCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Confirmed slots</div>
          </div>

          <div
            className="sunlit-card"
            onClick={() => onNavigate('events')}
            style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            title="Click to view Today's Events"
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>TODAY'S EVENTS</span>
              <ArrowRight size={14} color="var(--text-primary)" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {stats.todayEventsCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Seminars & Workshops</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="sunlit-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No recent activity to show.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivity.map((act, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{act.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{act.desc}</div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {act.time ? new Date(act.time).toLocaleDateString() : 'Recent'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
