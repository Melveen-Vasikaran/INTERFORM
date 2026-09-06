import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchAnalytics, resetDemoData } from '../utils/api';
import { Building2, Layers, Clock, FileCheck, TrendingUp, AlertCircle, BarChart2, ArrowRight, Plus, Users, Sparkles, RefreshCw } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function AdminDashboard({ onNavigate }) {
  const { user, settings, addToast, loadSettings } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestoreDemo = async () => {
    try {
      await resetDemoData();
      await loadSettings();
      addToast('Sample demo data restored successfully.', 'info');
      loadData();
    } catch (err) {
      addToast('Failed to restore demo data.', 'danger');
    }
  };

  if (loading || !analytics) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading system analytics...</div>;
  }

  const { summary, mostUsedResources, underutilizedResources, deptActivity, recentBookings, recentRequests } = analytics;
  const isFreshSetup = summary.totalResources === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div className="sunlit-card" style={{ background: 'var(--accent-blue-light)', border: '1px solid var(--accent-blue-border)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Avatar user={user} size="lg" />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
                COLLEGE ADMINISTRATOR DASHBOARD
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
                Welcome, {user?.name || 'Administrator'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                Managing <strong>{settings?.collegeName || 'Institution'}</strong> • Department: <strong>{user?.department || 'Administration'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleRestoreDemo}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
            title="Load sample institution data for testing"
          >
            <RefreshCw size={14} /> Restore Sample Demo Data
          </button>
        </div>
      </div>

      {/* Fresh Institution Quick Start Launchpad (If new setup with 0 resources) */}
      {isFreshSetup && (
        <div className="sunlit-card" style={{ border: '2px dashed var(--accent-blue)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Sparkles size={22} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              New Institution Setup Launchpad
            </h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your custom institution platform for <strong>{settings?.collegeName}</strong> is ready! Follow these quick steps to get campus resources active:
          </p>

          <div className="grid-3" style={{ gap: '1rem' }}>
            {/* Step 1 */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.4rem' }}>STEP 1 • COMPLETED</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>Institution Configured</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {settings?.collegeName} setup with code {settings?.collegeCode || 'N/A'}.
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-available-text)', marginBottom: '0.4rem' }}>STEP 2 • ACTION REQUIRED</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>Add Campus Facilities</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                Add labs, seminar halls, projectors, or gear to your resource catalog.
              </div>
              <button onClick={() => onNavigate('resources')} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                <Plus size={15} /> Add First Resource
              </button>
            </div>

            {/* Step 3 */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-accent)', marginBottom: '0.4rem' }}>STEP 3 • ACTION REQUIRED</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>Invite HODs & Staff</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                Create accounts for department heads to manage approval queues.
              </div>
              <button onClick={() => onNavigate('users')} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                <Users size={15} /> Manage Users & Roles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Overview Cards */}
      <div className="grid-4">
        <div
          className="sunlit-card"
          onClick={() => onNavigate('resources')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Total Resources"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>TOTAL RESOURCES</span>
            <ArrowRight size={14} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.2rem 0' }}>
            {summary.totalResources}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Cataloged campus assets</div>
        </div>

        <div
          className="sunlit-card"
          onClick={() => onNavigate('bookings')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Active Bookings"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ACTIVE BOOKINGS</span>
            <ArrowRight size={14} color="var(--status-available-text)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '0.2rem 0' }}>
            {summary.activeBookings}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scheduled reservations</div>
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
            {summary.pendingRequests}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Awaiting approval</div>
        </div>

        <div
          className="sunlit-card"
          onClick={() => onNavigate('events')}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Upcoming Events"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>UPCOMING EVENTS</span>
            <ArrowRight size={14} color="var(--text-primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            {summary.totalEvents}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Campus programs</div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid-2">
        {/* Most Used Resources */}
        <div className="sunlit-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--status-available-text)" /> Most Used Resources
          </h3>
          {mostUsedResources.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No usage data recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mostUsedResources.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.name}</span>
                  <span style={{
                    background: 'var(--accent-blue-light)',
                    color: 'var(--accent-blue)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    {item.count} Bookings
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Underutilized Resources */}
        <div className="sunlit-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="var(--gold-accent)" /> Underutilized Resources
          </h3>
          {underutilizedResources.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All resources are actively utilized!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {underutilizedResources.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.department} • {item.category}</div>
                  </div>
                  <span style={{
                    background: 'var(--gold-bg)',
                    color: 'var(--gold-accent)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    0 Bookings
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Activity & Recent Bookings */}
      <div className="grid-2">
        <div className="sunlit-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Department Utilization Activity</h3>
          {Object.keys(deptActivity).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No department activity recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(deptActivity).map(([dept, count], idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <span>{dept}</span>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{count} Bookings</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(count * 25, 100)}%`,
                      background: 'var(--accent-blue)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sunlit-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent System Bookings</h3>
          {recentBookings.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent system bookings to display.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentBookings.map((b, idx) => (
                <div key={idx} style={{
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.resource}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    By {b.user} ({b.department}) • {b.date} ({b.startTime} - {b.endTime})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
