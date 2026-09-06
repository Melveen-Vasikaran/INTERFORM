import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchBookings, cancelBooking } from '../utils/api';
import { Clock, Calendar, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function MyBookingsPage() {
  const { addToast } = useApp();
  const [bookings, setBookings] = useState([]);
  const [activeSection, setActiveSection] = useState('Upcoming');
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking reservation?')) return;
    try {
      await cancelBooking(id);
      addToast('Booking cancelled successfully.', 'info');
      loadBookings();
    } catch (err) {
      addToast(err.message || 'Failed to cancel booking.', 'danger');
    }
  };

  const sections = ['Upcoming', 'Today', 'Past', 'Cancelled'];

  const todayStr = new Date().toISOString().split('T')[0];

  const getFilteredBookings = () => {
    switch (activeSection) {
      case 'Today':
        return bookings.filter(b => b.date === todayStr && b.status !== 'Cancelled');
      case 'Upcoming':
        return bookings.filter(b => b.status === 'Upcoming' && b.date >= todayStr);
      case 'Past':
        return bookings.filter(b => b.status === 'Completed' || (b.date < todayStr && b.status !== 'Cancelled'));
      case 'Cancelled':
        return bookings.filter(b => b.status === 'Cancelled');
      default:
        return bookings;
    }
  };

  const filtered = getFilteredBookings();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
          CONFIRMED RESERVATIONS LOG
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
          MY BOOKINGS
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your confirmed resource reservations and view upcoming scheduled times.
        </p>
      </div>

      {/* Section Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {sections.map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              fontWeight: activeSection === sec ? 700 : 500,
              background: activeSection === sec ? 'var(--accent-blue)' : 'transparent',
              color: activeSection === sec ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Bookings Grid/List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Clock size={36} color="var(--text-muted)" />
          <h3>No {activeSection.toLowerCase()} bookings</h3>
          <p>You don't have any {activeSection.toLowerCase()} bookings yet.</p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(bk => (
            <div key={bk.id} className="sunlit-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{bk.resource}</h3>
                  <span className={`badge-status ${bk.status === 'Cancelled' ? 'badge-unavailable' : 'badge-available'}`}>
                    {bk.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Purpose: <strong>{bk.purpose}</strong>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div>📅 Date: <strong>{bk.date}</strong></div>
                  <div>⏰ Time: <strong>{bk.startTime} - {bk.endTime}</strong></div>
                  <div>🏢 Department: {bk.department}</div>
                </div>
              </div>

              {bk.status !== 'Cancelled' && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleCancel(bk.id)}
                    className="btn btn-outline btn-sm"
                    style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
