import React, { useState, useEffect } from 'react';
import { fetchRequests } from '../utils/api';
import { FileCheck, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await fetchRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const tabs = ['All', 'Pending', 'Approved', 'Rejected', 'Completed'];

  const filtered = activeTab === 'All' ? requests : requests.filter(r => r.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge-status badge-available">● Approved</span>;
      case 'Pending':
        return <span className="badge-status badge-reserved">● Pending</span>;
      case 'Rejected':
        return <span className="badge-status badge-rejected">● Rejected</span>;
      default:
        return <span className="badge-status badge-maintenance">● {status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
          RESOURCE REQUEST MANAGEMENT
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
          MY REQUESTS
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Track all your submitted resource reservation requests and HOD approval statuses.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              fontWeight: activeTab === tab ? 700 : 500,
              background: activeTab === tab ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === tab ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Request List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FileCheck size={36} color="var(--text-muted)" />
          <h3>No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} requests found</h3>
          <p>You haven't submitted any requests in this category yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(req => (
            <div key={req.id} className="sunlit-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{req.resource}</h3>
                  {getStatusBadge(req.status)}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Purpose: <strong>{req.purpose}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  📅 Date: {req.date} • ⏰ Time: {req.startTime} - {req.endTime} • Dept: {req.department}
                </div>
                {req.approvalReason && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong>HOD Feedback:</strong> {req.approvalReason}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                Requested by: {req.requester}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
