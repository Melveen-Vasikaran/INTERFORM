import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchDepartments, fetchResources, fetchBookings, fetchEvents } from '../utils/api';
import ResourceCard from '../components/ResourceCard';
import { Building2, Layers, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function DepartmentHubPage() {
  const { user } = useApp();
  const [departments, setDepartments] = useState([]);
  const [selectedDeptName, setSelectedDeptName] = useState(user?.department || 'Computer Science');
  const [deptResources, setDeptResources] = useState([]);
  const [deptBookings, setDeptBookings] = useState([]);
  const [deptEvents, setDeptEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeptHubData = async () => {
      try {
        const [depts, resList, bkList, evtList] = await Promise.all([
          fetchDepartments(),
          fetchResources(),
          fetchBookings(),
          fetchEvents()
        ]);

        setDepartments(depts);

        const currentDept = selectedDeptName || user?.department || 'Computer Science';

        setDeptResources(resList.filter(r => r.department === currentDept));
        setDeptBookings(bkList.filter(b => b.department === currentDept));
        setDeptEvents(evtList.filter(e => e.department === currentDept));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDeptHubData();
  }, [selectedDeptName]);

  const activeDeptObj = departments.find(d => d.name === selectedDeptName) || {
    name: selectedDeptName,
    code: 'DEPT',
    building: 'Main Academic Block',
    description: 'Academic department facilitating university research, instruction, and resource scheduling.'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
            ACADEMIC DEPARTMENT DIRECTORY
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {activeDeptObj.name} Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {activeDeptObj.building} • Code: {activeDeptObj.code}
          </p>
        </div>

        {/* Department Switcher */}
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '220px', fontWeight: 600 }}
          value={selectedDeptName}
          onChange={e => setSelectedDeptName(e.target.value)}
        >
          {departments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Description Banner */}
      <div className="sunlit-card" style={{ background: 'var(--bg-secondary)', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>About Department</h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          {activeDeptObj.description || 'School of specialized academic study and research facilities.'}
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid-3">
        <div className="sunlit-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ALLOCATED RESOURCES</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.2rem 0' }}>
            {deptResources.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Labs, halls & equipment</div>
        </div>

        <div className="sunlit-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>UPCOMING BOOKINGS</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '0.2rem 0' }}>
            {deptBookings.filter(b => b.status === 'Upcoming').length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Active reservations</div>
        </div>

        <div className="sunlit-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DEPARTMENT EVENTS</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            {deptEvents.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Symposia & workshops</div>
        </div>
      </div>

      {/* Department Resources Catalog */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
          Department Resources ({deptResources.length})
        </h2>

        {deptResources.length === 0 ? (
          <div className="empty-state">
            <Building2 size={32} color="var(--text-muted)" />
            <h3>No resources assigned to this department</h3>
          </div>
        ) : (
          <div className="grid-3">
            {deptResources.map(res => (
              <ResourceCard key={res.id} resource={res} onViewDetails={() => {}} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Bookings & Events */}
      <div className="grid-2">
        <div className="sunlit-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Upcoming Department Bookings</h3>
          {deptBookings.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No upcoming bookings.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {deptBookings.slice(0, 5).map(b => (
                <div key={b.id} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700 }}>{b.resource}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    By {b.user} • {b.date} ({b.startTime} - {b.endTime})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sunlit-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Department Events</h3>
          {deptEvents.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No department events scheduled.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {deptEvents.map(e => (
                <div key={e.id} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700 }}>{e.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Venue: {e.venue} • {e.date}
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
