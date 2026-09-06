import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, User, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import NotificationsDrawer from './NotificationsDrawer';
import Avatar from './Avatar';

export default function Navbar({ onNavigate, currentPage, sidebarCollapsed, onToggleSidebar }) {
  const { user, role, logout, notifications, settings, switchDemoRole } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left Area: Compact Sidebar Toggle Icon & Institute Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Compact Icon-Only Sidebar Toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.4rem 0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={sidebarCollapsed ? "Open Sidebar Menu" : "Collapse Sidebar Menu"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} color="var(--accent-blue)" /> : <PanelLeftClose size={18} color="var(--text-muted)" />}
          </button>
        )}

        {/* Brand Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'var(--accent-blue)',
            color: '#FFFFFF',
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem'
          }}>
            I
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              {settings.collegeName || 'INTERFORM'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {settings.tagline || 'Connect. Share. Plan.'}
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Role Switcher, Notifications, User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Role Preset Selector (Quick Switcher) */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--accent-blue)',
                cursor: 'pointer'
              }}
            >
              <span style={{ textTransform: 'uppercase' }}>Role: {role}</span>
              <ChevronDown size={14} />
            </button>

            {showRoleDropdown && (
              <div style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                width: '160px',
                zIndex: 200
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', fontWeight: 600 }}>SWITCH ROLE VIEW</div>
                {['student', 'staff', 'hod', 'admin'].map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchDemoRole(r);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '0.4rem 0.6rem',
                      background: role === r ? 'var(--accent-blue-light)' : 'transparent',
                      color: role === r ? 'var(--accent-blue)' : 'var(--text-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: role === r ? 700 : 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {r === 'hod' ? 'HOD / Coordinator' : r}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Icon */}
        <button
          onClick={() => setShowNotifs(true)}
          style={{
            position: 'relative',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#DC2626',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Info */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
            <Avatar user={user} size="sm" onClick={() => onNavigate('profile')} style={{ cursor: 'pointer' }} />
            <div style={{ textAlign: 'right', display: 'none', mdDisplay: 'block' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.department}</div>
            </div>
            <button
              onClick={logout}
              className="btn btn-outline btn-sm"
              title="Logout"
              style={{ padding: '0.4rem 0.6rem' }}
            >
              <LogOut size={15} />
              <span style={{ fontSize: '0.8rem' }}>Exit</span>
            </button>
          </div>
        ) : (
          <button onClick={() => onNavigate('login')} className="btn btn-primary btn-sm">
            Login
          </button>
        )}
      </div>

      {/* Notifications Slide Drawer */}
      {showNotifs && <NotificationsDrawer onClose={() => setShowNotifs(false)} onNavigate={onNavigate} />}
    </header>
  );
}
