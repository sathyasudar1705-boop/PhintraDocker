import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import CommandPaletteModal from '../components/common/CommandPaletteModal';
import NotificationDrawer from '../components/common/NotificationDrawer';

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      
      {/* Sidebar (handles both Desktop & Mobile drawers) */}
      <AdminSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Content Layout Container */}
      <div style={{
        flex: 1,
        marginLeft: '260px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: 'calc(100% - 260px)'
      }} className="main-content-layout">
        
        {/* Top Navbar */}
        <AdminTopbar 
          onMenuClick={() => setMobileMenuOpen(true)} 
          onSearchClick={() => setSearchOpen(true)} 
          onNotificationsClick={() => setNotificationsOpen(true)} 
        />

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }} className="app-main-content">
          <div className="animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPaletteModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

      {/* Simple styling rules injected via a style block to handle desktop vs mobile display toggle */}
      <style>{`
        @media (max-width: 991px) {
          .desktop-sidebar-only {
            display: none !important;
          }
          .main-content-layout {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .mobile-burger-only {
            display: block !important;
          }
          .app-header-nav {
            padding: 0 16px !important;
          }
          .app-main-content {
            padding: 16px !important;
          }
          .search-bar-responsive {
            display: none !important;
          }
          .page-title-responsive {
            display: none !important;
          }
          .profile-text-responsive {
            display: none !important;
          }
        }
        .sidebar-nav-hover:hover {
          background-color: var(--border-color) !important;
          color: var(--text-main) !important;
        }
        .sidebar-nav-logout-hover:hover {
          background-color: var(--color-danger-light) !important;
        }
        .search-input-hover:hover {
          background-color: var(--border-color) !important;
          border-color: var(--border-hover) !important;
        }
        .notification-btn-hover:hover {
          background-color: var(--bg-sidebar) !important;
          border-color: var(--border-hover) !important;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
