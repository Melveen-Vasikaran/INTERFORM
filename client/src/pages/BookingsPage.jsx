import React, { useState, useEffect } from 'react';
import { fetchBookings, updateBookingStatus } from '../utils/api';
import { useApp } from '../context/AppContext';
import { CalendarRange, Clock, CheckCircle2, XCircle, AlertTriangle, Coins, Filter } from 'lucide-react';

export default function BookingsPage() {
  const { departments, activeDept, addToast, refreshData } = useApp();

  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  const loadBookings = async () => {
    try {
      const data = await fetchBookings({
        status: selectedStatus,
        requestingDept: selectedDeptFilter
      });
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [selectedStatus, selectedDeptFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus, `Status updated by ${activeDept?.name || 'Admin'}`);
      addToast(`Booking ${id} set to ${newStatus.toUpperCase()}`, 'success');
      loadBookings();
      refreshData();
    } catch (err) {
      addToast('Failed to update status.', 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div>
        <h2 className="page-title">
          <CalendarRange size={24} color="var(--accent-emerald)" /> Inter-Departmental Schedule & Approvals
        </h2>
        <p className="page-subtitle">Manage asset reservations, approve pending requests, and track credit settlements.</p>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['All', 'Pending', 'Approved', 'Conflict', 'Rejected'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedStatus === st ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedStatus === st ? '#ffffff' : 'var(--text-secondary)',
                border: selectedStatus === st ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select 
            className="form-select"
            style={{ width: '200px', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
          >
            <option value="All">All Requesting Depts</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table / Card List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {bookings.map(b => (
          <div key={b.id} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>#{b.id}</span>
                  <span className={`status-pill ${b.status.toLowerCase()}`}>
                    {b.status}
                  </span>
                  <span className="dept-tag">
                    Requesting: {b.requestingDepartmentName}
                  </span>
                  <span className="dept-tag" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    Owner: {b.ownerDepartmentName}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.4rem', color: 'var(--text-primary)' }}>
                  {b.resourceName}
                </h4>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Purpose: {b.purpose}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} />
                    {new Date(b.startDate).toLocaleString()} — {new Date(b.endDate).toLocaleString()}
                  </span>
                  <span style={{ color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Coins size={14} />
                    {b.totalCreditCost} Credits ({b.hoursTotal} hrs)
                  </span>
                  <span>Requested By: <strong>{b.requestedBy}</strong></span>
                </div>

                {b.approverNote && (
                  <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    Note: {b.approverNote}
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'center' }}>
                {b.status === 'Pending' || b.status === 'Conflict' ? (
                  <>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => handleStatusUpdate(b.id, 'Approved')}
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleStatusUpdate(b.id, 'Rejected')}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => handleStatusUpdate(b.id, b.status === 'Approved' ? 'Pending' : 'Approved')}
                  >
                    Change Status
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No booking requests found matching criteria.
        </div>
      )}

    </div>
  );
}
