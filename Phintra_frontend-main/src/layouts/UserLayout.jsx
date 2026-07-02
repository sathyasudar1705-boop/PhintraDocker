import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UserTopbar from '../components/user/UserTopbar';
import CommandPaletteModal from '../components/common/CommandPaletteModal';
import NotificationDrawer from '../components/common/NotificationDrawer';
import LoadingThreeDotsJumping from '../components/common/LoadingThreeDotsJumping';

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

  return (
    <div className="employee-portal" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <UserTopbar
        onSearchClick={() => setSearchOpen(true)}
        onNotificationsClick={() => setNotificationsOpen(true)}
      />

      <main style={{
        flex: 1,
        padding: '32px 24px',
        width: '100%',
        maxWidth: '1400px',
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
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800&family=Rajdhani:wght@400;500;600;700&family=Oxanium:wght@400;500;600;700&family=Teko:wght@500;600;700&display=swap');

        /* 1. Orbitron: Main headings, hero titles, level titles, achievement headings */
        .employee-portal h1,
        .employee-portal h2,
        .employee-portal h3,
        .employee-portal h4,
        .employee-portal h5,
        .employee-portal h6,
        .employee-portal .gaming-title,
        .employee-portal .achievement-heading {
          font-family: 'Orbitron', sans-serif !important;
          letter-spacing: 0.8px;
        }

        /* 2. Rajdhani: Body text, descriptions, table text, readable content */
        .employee-portal,
        .employee-portal p,
        .employee-portal span,
        .employee-portal div,
        .employee-portal td,
        .employee-portal th,
        .employee-portal li,
        .employee-portal input,
        .employee-portal select,
        .employee-portal textarea,
        .employee-portal table {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 500;
        }

        /* 3. Oxanium: Buttons, badges, navbar links, card titles, labels */
        .employee-portal button,
        .employee-portal .btn,
        .employee-portal .badge,
        .employee-portal a,
        .employee-portal .emp-nav-link,
        .employee-portal .card-title,
        .employee-portal label,
        .employee-portal .form-label,
        .employee-portal .tab-btn {
          font-family: 'Oxanium', sans-serif !important;
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

        @media (max-width: 768px) {
          .emp-main-content { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default UserLayout;
