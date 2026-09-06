import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingWizard from './pages/OnboardingWizard';


import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import HodDashboard from './pages/HodDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AcceptInvitation from './pages/AcceptInvitation';


import ResourceExplorerPage from './pages/ResourceExplorerPage';
import CampusPlannerPage from './pages/CampusPlannerPage';
import MyRequestsPage from './pages/MyRequestsPage';
import IncomingRequestsPage from './pages/IncomingRequestsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import EventsPage from './pages/EventsPage';
import DepartmentHubPage from './pages/DepartmentHubPage';
import AdminManagementPage from './pages/AdminManagementPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import { ArrowLeft } from 'lucide-react';

function MainApp() {
  const { user, role, toasts } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageHistory, setPageHistory] = useState(['dashboard']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);

  const getInitialViewState = () => {
    const path = window.location.pathname;
    if (path.startsWith('/accept-invitation/')) {
      const token = path.split('/')[2];
      if (token) return 'accept-invitation';
    }
    return user ? 'app' : 'landing';
  };

  const [viewState, setViewState] = useState(getInitialViewState);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/accept-invitation/')) {
      const token = path.split('/')[2];
      if (token) setInviteToken(token);
    }
  }, []);

  useEffect(() => {
    if (user && viewState !== 'app') {
      setViewState('app');
    } else if (!user && viewState === 'app') {
      setViewState('login');
    }
  }, [user]);

  const handleNavigate = (page) => {
    if (page === 'login') {
      setViewState('login');
    } else if (page === 'landing') {
      setViewState('landing');
    } else {
      if (page !== currentPage) {
        setPageHistory(prev => [...prev, page]);
      }
      setCurrentPage(page);
    }
  };

  const handleGoBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();
      const prevPage = newHistory[newHistory.length - 1] || 'dashboard';
      setPageHistory(newHistory);
      setCurrentPage(prevPage);
    } else {
      setCurrentPage('dashboard');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const renderDashboardByRole = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'hod':
        return <HodDashboard onNavigate={handleNavigate} />;
      case 'staff':
        return <StaffDashboard onNavigate={handleNavigate} />;
      case 'student':
      default:
        return <StudentDashboard onNavigate={handleNavigate} />;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'resources':
        return <ResourceExplorerPage />;
      case 'planner':
        return <CampusPlannerPage />;
      case 'requests':
        return <MyRequestsPage />;
      case 'incoming':
        return <IncomingRequestsPage />;
      case 'bookings':
        return <MyBookingsPage />;
      case 'events':
        return <EventsPage />;
      case 'department':
        return <DepartmentHubPage />;
      case 'departments':
        return <AdminManagementPage initialTab="departments" />;
      case 'users':
        return <AdminManagementPage initialTab="users" />;
      case 'analytics':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return renderDashboardByRole();
    }
  };

  const renderContent = () => {
    if (viewState === 'setup') {
      return (
        <OnboardingWizard
          onComplete={() => setViewState('app')}
        />
      );
    }
    
    if (viewState === 'login' || (!user && viewState === 'app')) {
      return (
        <LoginPage 
          onSuccess={() => setViewState('app')} 
          onBackToLanding={() => setViewState('landing')}
          onStartSetup={() => setViewState('setup')}
        />
      );
    }
    
    if (viewState === 'accept-invitation') {
      return (
        <AcceptInvitation 
          token={inviteToken}
          onSuccess={() => setViewState('app')} 
          onBackToLanding={() => setViewState('landing')}
        />
      );
    }
    
    if (viewState === 'landing') {
      return (
        <LandingPage 
          onExplore={() => {
            setViewState('app');
            handleNavigate('resources');
          }}
          onLogin={() => setViewState('login')}
        />
      );
    }

    return (
      <>
        {!sidebarCollapsed && (
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={handleNavigate}
          />
        )}
        
        <div className="main-wrapper" style={{ width: sidebarCollapsed ? '100%' : 'calc(100% - 250px)' }}>
          <Navbar 
            onNavigate={handleNavigate} 
            currentPage={currentPage}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />
          
          <main className="page-content">
            {currentPage !== 'dashboard' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={handleGoBack}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--accent-blue)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  title="Return to Previous Page"
                >
                  <ArrowLeft size={15} /> <span>Back</span>
                </button>
              </div>
            )}
            {renderPage()}
          </main>
        </div>
      </>
    );
  };

  return (
    <div className="app-container">
      {renderContent()}

      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        zIndex: 3000
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'success' ? '#16A34A' : t.type === 'warning' ? '#D97706' : t.type === 'danger' ? '#DC2626' : '#1E3A8A',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            fontWeight: 600,
            fontSize: '0.88rem',
            animation: 'slideInRight 0.2s ease'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
