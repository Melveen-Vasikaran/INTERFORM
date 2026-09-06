import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/StatsCard';
import ResourceCard from '../components/ResourceCard';
import ConflictAlerts from '../components/ConflictAlerts';
import TimelineGantt from '../components/TimelineGantt';
import BookingModal from '../components/BookingModal';
import { fetchResources, fetchBookings, fetchProjects, fetchAuditLogs } from '../utils/api';
import { Layers, CalendarRange, AlertTriangle, Workflow, TrendingUp, ShieldCheck, Activity, Plus } from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { activeDept, analytics, refreshData } = useApp();

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [resData, bkData, projData, logsData] = await Promise.all([
        fetchResources(),
        fetchBookings(),
        fetchProjects(),
        fetchAuditLogs()
      ]);
      setResources(resData);
      setBookings(bkData);
      setProjects(projData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeDept]);

  const activeConflicts = bookings.filter(b => b.status === 'Conflict');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">
            Enterprise Synergy Command
          </h2>
          <p className="page-subtitle">
            Cross-departmental planning, shared asset utilization & mutual aid ledger.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => onNavigate('resources')}>
            <Layers size={16} /> Catalog
          </button>
          <button className="btn-primary" onClick={() => onNavigate('exchange')}>
            <TrendingUp size={16} /> Mutual Aid Exchange
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid-4">
        <StatsCard 
          title="Total Shared Assets" 
          value={analytics?.summary?.totalResources || resources.length} 
          subtitle="Hardware, Labs & Talent"
          icon={Layers} 
          color="#3b82f6" 
        />
        <StatsCard 
          title="Active Bookings" 
          value={bookings.filter(b => b.status === 'Approved' || b.status === 'Pending').length} 
          subtitle="Cross-Dept Reservations"
          icon={CalendarRange} 
          color="#10b981" 
        />
        <StatsCard 
          title="Active Conflicts" 
          value={activeConflicts.length} 
          subtitle={activeConflicts.length > 0 ? "Requires Resolution!" : "All Schedules Clear"}
          icon={AlertTriangle} 
          color={activeConflicts.length > 0 ? "#f43f5e" : "#34d399"} 
        />
        <StatsCard 
          title="Estimated Cost Savings" 
          value={`$${(analytics?.summary?.savedCostEstimateDollars || 142000).toLocaleString()}`} 
          subtitle="Via Inter-Dept Sharing"
          icon={TrendingUp} 
          color="#8b5cf6" 
        />
      </div>

      {/* Conflict Alert Banner if any conflicts exist */}
      {activeConflicts.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> Schedule Collisions Flagged ({activeConflicts.length})
            </h3>
            <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => onNavigate('conflicts')}>
              Open Conflict Radar →
            </button>
          </div>
          <ConflictAlerts conflicts={activeConflicts} onResolved={loadDashboardData} />
        </section>
      )}

      {/* Featured Shared Assets Grid */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>High-Demand Shared Resources</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Available for inter-departmental booking</p>
          </div>
          <button className="btn-secondary" onClick={() => onNavigate('resources')}>View All ({resources.length})</button>
        </div>

        <div className="grid-3">
          {resources.slice(0, 3).map(res => (
            <ResourceCard 
              key={res.id} 
              resource={res} 
              onBook={(r) => setSelectedResource(r)} 
            />
          ))}
        </div>
      </section>

      {/* Joint Roadmap & Audit Feed split row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Joint Roadmap Overview */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Workflow size={18} color="var(--accent-purple)" /> Active Joint Projects
            </h3>
            <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => onNavigate('projects')}>
              Full Roadmap →
            </button>
          </div>
          <TimelineGantt projects={projects.slice(0, 2)} />
        </section>

        {/* Real-time Audit Activity Log Feed */}
        <section className="glass-card" style={{ padding: '1.25rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-blue)" /> Inter-Dept Audit Feed
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>{log.actor}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: '1.3' }}>
                  {log.details}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Booking Modal */}
      {selectedResource && (
        <BookingModal 
          resource={selectedResource} 
          onClose={() => setSelectedResource(null)} 
          onSuccess={loadDashboardData}
        />
      )}

    </div>
  );
}
