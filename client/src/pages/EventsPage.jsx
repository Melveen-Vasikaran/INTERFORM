import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchEvents, createEvent, fetchResources } from '../utils/api';
import { Calendar, Plus, MapPin, Clock, Users, X, AlertCircle } from 'lucide-react';

export default function EventsPage() {
  const { user, addToast } = useApp();
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [venueId, setVenueId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [type, setType] = useState('Seminar');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState(user?.name || '');
  const [conflictData, setConflictData] = useState(null);

  const loadEventsData = async () => {
    try {
      const [evtData, resData] = await Promise.all([
        fetchEvents(),
        fetchResources()
      ]);
      setEvents(evtData);
      setResources(resData);
      if (resData.length > 0 && !venueId) {
        setVenueId(resData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventsData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setConflictData(null);

    const selectedResource = resources.find(r => r.id === venueId);
    if (!selectedResource) return;

    try {
      await createEvent({
        title,
        venue: selectedResource.name,
        venueId: selectedResource.id,
        date,
        startTime,
        endTime,
        description,
        organizer: organizer || user.name,
        type
      });

      addToast('Event scheduled successfully!', 'success');
      setShowCreateModal(false);
      loadEventsData();
    } catch (err) {
      if (err.status === 409 && err.data) {
        setConflictData({
          reason: err.data.reason,
          alternativeVenues: err.data.alternativeVenues || []
        });
      } else {
        addToast(err.message || 'Failed to schedule event.', 'danger');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
            ACADEMIC & CAMPUS CALENDAR
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
            EVENTS & SEMINARS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Browse upcoming college symposia, departmental workshops, and guest lectures.
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'hod' || user?.role === 'staff') && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={18} /> Schedule Event
          </button>
        )}
      </div>

      {/* Events Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading campus events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <Calendar size={36} color="var(--text-muted)" />
          <h3>No upcoming events scheduled</h3>
          <p>Be the first to schedule a college seminar or departmental workshop.</p>
        </div>
      ) : (
        <div className="grid-3">
          {events.map(evt => (
            <div key={evt.id} className="sunlit-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    background: 'var(--accent-blue-light)',
                    color: 'var(--accent-blue)'
                  }}>
                    {evt.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {evt.department}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {evt.title}
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {evt.description || 'College academic gathering and research showcase.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="var(--accent-blue)" />
                    <span>Venue: <strong>{evt.venue}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={15} color="var(--accent-blue)" />
                    <span>📅 {evt.date} • ⏰ {evt.startTime} - {evt.endTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={15} color="var(--accent-blue)" />
                    <span>Organizer: <strong>{evt.organizer}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Schedule Campus Event</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Venue Conflict Warning */}
            {conflictData && (
              <div style={{
                background: 'var(--status-error-bg)',
                border: '1px solid var(--status-error-border)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-error-text)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <AlertCircle size={18} /> Venue unavailable during this time.
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--status-error-text)', marginTop: '0.2rem' }}>
                  {conflictData.reason}
                </p>

                {conflictData.alternativeVenues.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--status-error-border)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      SUGGESTED ALTERNATIVE VENUES:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {conflictData.alternativeVenues.map(alt => (
                        <div key={alt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{alt.name} ({alt.location})</span>
                          <button
                            type="button"
                            onClick={() => {
                              setVenueId(alt.id);
                              setConflictData(null);
                              addToast(`Selected venue: ${alt.name}`, 'info');
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            Use Venue
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Event Name / Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AI & Robotics National Conference 2026"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Event Type</label>
                  <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
                    <option value="Seminar">Seminar</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Conference">Conference</option>
                    <option value="College Event">College Event</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Venue (Resource)</label>
                  <select className="form-control" value={venueId} onChange={e => setVenueId(e.target.value)} required>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.location} - Cap: {r.capacity})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" className="form-control" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" className="form-control" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>Organizer Name</label>
                <input type="text" className="form-control" value={organizer} onChange={e => setOrganizer(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Event Description</label>
                <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
