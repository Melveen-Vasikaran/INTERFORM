import React, { useState, useEffect } from 'react';
import { fetchBookings } from '../utils/api';
import ConflictAlerts from '../components/ConflictAlerts';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState([]);

  const loadConflicts = async () => {
    try {
      const allBookings = await fetchBookings();
      setConflicts(allBookings.filter(b => b.status === 'Conflict'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConflicts();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 className="page-title" style={{ color: '#f87171' }}>
          <AlertTriangle size={24} color="#f87171" /> Cross-Department Conflict Radar
        </h2>
        <p className="page-subtitle">Detect double bookings, over-capacity asset allocation, and execute schedule shifts.</p>
      </div>

      <ConflictAlerts conflicts={conflicts} onResolved={loadConflicts} />
    </div>
  );
}
