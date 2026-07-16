import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UserTopbar from '../components/user/UserTopbar';
import CommandPaletteModal from '../components/common/CommandPaletteModal';
import NotificationDrawer from '../components/common/NotificationDrawer';
import LoadingThreeDotsJumping from '../components/common/LoadingThreeDotsJumping';
import dashboardBg from '../assets/dashboard_bg_hills.jpg';



const UserLayout = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loading transition on page change
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600); // 600ms transition time for smooth loading effect
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const isDashboard = location.pathname === '/user/dashboard' || location.pathname === '/user';

  return (
    <div className="employee-portal" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
    }}>
      <UserTopbar
        onSearchClick={() => setSearchOpen(true)}
        onNotificationsClick={() => setNotificationsOpen(true)}
      />

      <main style={{
        flex: 1,
        padding: '24px 32px 32px 32px',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        boxSizing: 'border-box',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }} className="emp-main-content">
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <LoadingThreeDotsJumping />
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <CommandPaletteModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800&family=Rajdhani:wght@400;500;600;700&family=Oxanium:wght@400;500;600;700&family=Teko:wght@500;600;700&family=Fredoka:wght@600;700;900&display=swap');


        /* 1. Fredoka & Orbitron: Main headings, card titles, hero achievements */
        .employee-portal h1,
        .employee-portal h2,
        .employee-portal h3,
        .employee-portal h4,
        .employee-portal h5,
        .employee-portal h6,
        .employee-portal .gaming-title,
        .employee-portal .achievement-heading {
          font-family: 'Fredoka', 'Orbitron', sans-serif !important;
          letter-spacing: 0.5px;
          font-weight: 950 !important;
        }

        /* 2. Rajdhani: Body text, descriptions, table text, readable content */
        .employee-portal,
        .employee-portal p,
        .employee-portal span,
        .employee-portal div,
        .employee-portal td,
        .employee-portal th,
        .employee-portal li,
        .employee-portal table {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
        }

        /* 3. Oxanium & Fredoka: Buttons, badges, navbar links, labels */
        .employee-portal button,
        .employee-portal .btn,
        .employee-portal .badge,
        .employee-portal a,
        .employee-portal .emp-nav-link,
        .employee-portal .card-title,
        .employee-portal label,
        .employee-portal .form-label,
        .employee-portal .tab-btn {
          font-family: 'Fredoka', 'Oxanium', sans-serif !important;
          font-weight: 700;
        }

        /* 4. Teko: Score numbers, XP, level, rank, leaderboard numbers */
        .employee-portal .gamified-metric,
        .employee-portal .gaming-metric,
        .employee-portal .score-number,
        .employee-portal .xp-amount,
        .employee-portal .rank-number,
        .employee-portal .leaderboard-number,
        .employee-portal .level-label {
          font-family: 'Teko', sans-serif !important;
          letter-spacing: 1px;
        }

        /* ─── Global 3D Cartoon Cards ─── */
        .employee-portal div[style*="background: #ffffff"],
        .employee-portal div[style*="background-color: #ffffff"],
        .employee-portal div[style*="background: rgb(255, 255, 255)"],
        .employee-portal div[style*="background-color: rgb(255, 255, 255)"] {
          border: 2px solid #cbd5e1 !important;
          border-bottom: 6px solid #b2c0d2 !important;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04), inset 0 2px 0 rgba(255, 255, 255, 0.8) !important;
          border-radius: 24px !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* ─── Global 3D Buttons ─── */
        .employee-portal button:not(.emp-hamburger-btn):not([style*="background: transparent"]):not([style*="background-color: transparent"]):not([style*="background:none"]):not([style*="background-color:none"]),
        .employee-portal .btn-primary {
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          border-bottom: 4px solid rgba(0, 0, 0, 0.25) !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.4) !important;
          transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          transform: translateY(0px) !important;
        }
        .employee-portal button:not(.emp-hamburger-btn):not([style*="background: transparent"]):not([style*="background-color: transparent"]):not([style*="background:none"]):not([style*="background-color:none"]):hover,
        .employee-portal .btn-primary:hover {
          transform: translateY(-2px) !important;
          border-bottom-width: 5px !important;
          box-shadow: 0 6px 12px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.4) !important;
        }
        .employee-portal button:not(.emp-hamburger-btn):not([style*="background: transparent"]):not([style*="background-color: transparent"]):not([style*="background:none"]):not([style*="background-color:none"]):active,
        .employee-portal .btn-primary:active {
          transform: translateY(1.5px) !important;
          border-bottom-width: 1px !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4) !important;
        }

        /* ─── Global 3D Inputs / Form Elements ─── */
        .employee-portal input[type="text"],
        .employee-portal input[type="password"],
        .employee-portal input[type="email"],
        .employee-portal select,
        .employee-portal textarea {
          border: 2.5px solid #cbd5e1 !important;
          border-radius: 16px !important;
          box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.06) !important;
          transition: border-color 0.2s ease !important;
          font-family: 'Fredoka', sans-serif !important;
          font-weight: 600 !important;
          padding: 10px 14px !important;
          background-color: #ffffff !important;
        }
        .employee-portal input:focus,
        .employee-portal select:focus,
        .employee-portal textarea:focus {
          border-color: #3b82f6 !important;
          outline: none !important;
        }

        /* ─── Global Progress Bar Upgrades ─── */
        .employee-portal div[style*="height: 6px"][style*="background: rgba(255, 255, 255, 0.1)"],
        .employee-portal div[style*="height: 6px"][style*="backgroundColor: #f1f5f9"],
        .employee-portal div[style*="height: 6px"][style*="background-color: #f1f5f9"] {
          height: 10px !important;
          border: 2px solid #cbd5e1 !important;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08) !important;
          border-radius: 99px !important;
          background: #e2e8f0 !important;
        }

        @media (max-width: 768px) {
          .emp-main-content { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default UserLayout;
