import React from 'react';
import { useApp } from '../context/AppContext';
import { markNotificationRead, markAllNotificationsRead } from '../utils/api';
import { X, Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function NotificationsDrawer({ onClose, onNavigate }) {
  const { notifications, loadNotifications, addToast } = useApp();

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      loadNotifications();
      addToast('All notifications marked as read.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} color="var(--status-available-text)" />;
      case 'warning':
        return <AlertTriangle size={16} color="var(--gold-accent)" />;
      case 'danger':
        return <AlertCircle size={16} color="var(--status-error-text)" />;
      case 'info':
      default:
        return <Info size={16} color="var(--accent-blue)" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div 
        onClick={e => e.stopPropagation()} 
        style={{
          width: '380px',
          height: '100vh',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.2s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Notification Center</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Action Header */}
        {notifications.length > 0 && (
          <div style={{
            padding: '0.6rem 1.5rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>{notifications.filter(n => !n.read).length} Unread</span>
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-blue)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {notifications.length === 0 ? (
            <div className="empty-state" style={{ margin: '2rem 0' }}>
              <Bell size={32} color="var(--text-muted)" />
              <h4>No notifications</h4>
              <p style={{ fontSize: '0.82rem' }}>You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    handleMarkRead(n.id);
                    if (n.link && onNavigate) {
                      onNavigate(n.link);
                      onClose();
                    }
                  }}
                  style={{
                    padding: '0.85rem 1rem',
                    background: n.read ? 'var(--bg-card)' : 'var(--accent-blue-light)',
                    border: '1px solid',
                    borderColor: n.read ? 'var(--border-color)' : 'var(--accent-blue-border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <div style={{ marginTop: '0.15rem' }}>{getIcon(n.type)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </div>
                    </div>
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
