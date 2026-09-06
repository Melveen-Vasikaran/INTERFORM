import React, { useState, useEffect } from 'react';
import { fetchResources, fetchBookings, fetchDepartments } from '../utils/api';
import { CalendarDays, Filter, ChevronLeft, ChevronRight, Clock, Building2 } from 'lucide-react';

export default function CampusPlannerPage() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Date & Filter State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    const loadPlannerData = async () => {
      try {
        const [resList, bkList, deptList] = await Promise.all([
          fetchResources(),
          fetchBookings(),
          fetchDepartments()
        ]);
        setResources(resList);
        setBookings(bkList);
        setDepartments(deptList);
      } catch (err) {
        console.error(err);
      }
    };
    loadPlannerData();
  }, []);

  const filteredResources = resources.filter(r => {
    if (selectedDept !== 'All' && r.department !== selectedDept) return false;
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    return true;
  });

  const getSlotStatus = (resource, timeStr) => {
    // Check maintenance
    if (resource.status === 'Maintenance') {
      return { status: 'Maintenance', label: 'Maintenance' };
    }

    // Check bookings for this date and time
    const slotHour = parseInt(timeStr.split(':')[0], 10);

    const bk = bookings.find(b => {
      if (b.resourceId !== resource.id && b.resource !== resource.name) return false;
      if (b.date !== selectedDate) return false;
      if (b.status === 'Cancelled') return false;

      const startHour = parseInt(b.startTime.split(':')[0], 10);
      const endHour = parseInt(b.endTime.split(':')[0], 10);

      return (slotHour >= startHour && slotHour < endHour);
    });

    if (bk) {
      return { status: 'Booked', label: bk.purpose || 'Reserved', user: bk.user };
    }

    return { status: 'Available', label: 'Available' };
  };

  const handleDateShift = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          VISUAL RESOURCE OCCUPANCY MATRIX
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
          CAMPUS PLANNER
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time visual schedule overview of campus facilities and equipment.
        </p>
      </div>

      {/* Control Bar: Date Selector & Category Filters */}
      <div className="sunlit-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem' }}>
        {/* Date Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => handleDateShift(-1)} className="btn btn-outline btn-sm">
            <ChevronLeft size={16} /> Prev Day
          </button>

          <input
            type="date"
            className="form-control"
            style={{ width: '170px', fontWeight: 700, textAlign: 'center' }}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />

          <button onClick={() => handleDateShift(1)} className="btn btn-outline btn-sm">
            Next Day <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="btn btn-secondary btn-sm"
          >
            Today
          </button>
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: '180px', fontSize: '0.85rem' }}
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: '170px', fontSize: '0.85rem' }}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Laboratories">Laboratories</option>
            <option value="Seminar Halls">Seminar Halls</option>
            <option value="Auditoriums">Auditoriums</option>
            <option value="Cameras">Cameras</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--status-available-bg)', border: '1px solid var(--status-available-border)' }}></span>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Available</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--status-reserved-bg)', border: '1px solid var(--status-reserved-border)' }}></span>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Booked / Reserved</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--status-maintenance-bg)', border: '1px solid var(--status-maintenance-border)' }}></span>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Maintenance</span>
        </div>
      </div>

      {/* Planner Grid Table */}
      <div className="sunlit-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', width: '100px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                TIME
              </th>
              {filteredResources.map(r => (
                <th key={r.id} style={{ padding: '1rem', minWidth: '160px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  <div>{r.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{r.department}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>
                  {time}
                </td>
                {filteredResources.map(r => {
                  const slot = getSlotStatus(r, time);
                  return (
                    <td key={r.id} style={{ padding: '0.5rem' }}>
                      <div style={{
                        padding: '0.5rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: '1px solid',
                        background: slot.status === 'Available' ? 'var(--status-available-bg)' : slot.status === 'Booked' ? 'var(--status-reserved-bg)' : 'var(--status-maintenance-bg)',
                        borderColor: slot.status === 'Available' ? 'var(--status-available-border)' : slot.status === 'Booked' ? 'var(--status-reserved-border)' : 'var(--status-maintenance-border)',
                        color: slot.status === 'Available' ? 'var(--status-available-text)' : slot.status === 'Booked' ? 'var(--status-reserved-text)' : 'var(--status-maintenance-text)',
                        textAlign: 'center'
                      }}>
                        {slot.status === 'Available' ? 'Available' : slot.label}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
