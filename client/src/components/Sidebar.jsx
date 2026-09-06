import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Search, 
  CalendarDays, 
  FileCheck, 
  Clock, 
  Calendar, 
  Building2, 
  Users, 
  BarChart3, 
  Settings as SettingsIcon,
  User,
  Inbox
} from 'lucide-react';
import Avatar from './Avatar';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const { role, user } = useApp();

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'users', label: 'Users & Roles', icon: Users },
          { id: 'resources', label: 'Resources Explorer', icon: Search },
          { id: 'requests', label: 'All Requests', icon: FileCheck },
          { id: 'bookings', label: 'All Bookings', icon: Clock },
          { id: 'planner', label: 'Campus Planner', icon: CalendarDays },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'settings', label: 'Admin Settings', icon: SettingsIcon },
        ];
      case 'hod':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'department', label: 'My Department', icon: Building2 },
          { id: 'resources', label: 'Resource Catalog', icon: Search },
          { id: 'incoming', label: 'Incoming Requests', icon: Inbox },
          { id: 'bookings', label: 'Bookings Log', icon: Clock },
          { id: 'planner', label: 'Campus Planner', icon: CalendarDays },
          { id: 'events', label: 'Department Events', icon: Calendar },
          { id: 'profile', label: 'My Profile', icon: User },
        ];
      case 'staff':
      case 'student':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'resources', label: 'Resource Explorer', icon: Search },
          { id: 'planner', label: 'Campus Planner', icon: CalendarDays },
          { id: 'requests', label: 'My Requests', icon: FileCheck },
          { id: 'bookings', label: 'My Bookings', icon: Clock },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'profile', label: 'My Profile', icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside style={{
      width: '250px',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        {/* Navigation Label */}
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '0 0.75rem 0.75rem 0.75rem'
        }}>
          Navigation
        </div>

        {/* Links List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--accent-blue-light)' : 'transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent-blue-border)' : '1px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--accent-blue)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Summary */}
      {user && (
        <div style={{
          padding: '0.85rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Avatar user={user} size="sm" />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.department}
            </div>
            <div style={{
              display: 'inline-block',
              marginTop: '0.2rem',
              padding: '0.1rem 0.35rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '0.62rem',
              fontWeight: 700,
              color: 'var(--accent-blue)',
              textTransform: 'uppercase'
            }}>
              {user.role}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
