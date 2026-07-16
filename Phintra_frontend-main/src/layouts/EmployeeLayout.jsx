import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from '../components/user/EmployeeSidebar';
import UserTopbar from '../components/user/UserTopbar';
import CommandPaletteModal from '../components/common/CommandPaletteModal';
import NotificationDrawer from '../components/common/NotificationDrawer';

const EmployeeLayout = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', backgroundAttachment: 'fixed', backgroundImage: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 45%, #F8FAFC 100%)' }}>
      
      {/* Gamified compact sidebar */}
      <EmployeeSidebar />

      {/* Main Content Layout Container */}
      <div style={{
        flex: 1,
        marginLeft: '112px',
        marginRight: '16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: 'calc(100% - 128px)'
      }} className="main-content-layout">
        
        {/* Top Navbar */}
        <UserTopbar 
          onMenuClick={() => {}} 
          onSearchClick={() => setSearchOpen(true)} 
          onNotificationsClick={() => setNotificationsOpen(true)} 
        />

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: '16px 0 32px 0', overflowY: 'auto' }} className="app-main-content">
          <div className="animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPaletteModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

      {/* Simple styling rules injected via a style block to handle layout display toggle */}
      <style>{`
        .main-content-layout {
          position: relative;
        }
        .main-content-layout::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          background-image: linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
        }
        .app-main-content::-webkit-scrollbar {
          display: none;
        }
        .app-main-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 768px) {
          .main-content-layout {
            margin-left: 16px !important;
            margin-right: 16px !important;
            width: calc(100% - 32px) !important;
          }
          aside {
            display: none !important; /* Hide sidebar on mobile/small tablets or make drawer */
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeLayout;
