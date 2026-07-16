import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Mail, Trophy, MessageCircle, Settings, LogOut,
  Menu, X, ShieldCheck, Zap, Flame, Bell, ChevronDown, Award
} from 'lucide-react';
import phintraLogo from '../../assets/phintra_logo.png';
import phintraSentinel from '../../assets/phintra_sentinel.png';

const NAV_ITEMS = [
  { name: 'Dashboard',     path: '/user/dashboard',   icon: LayoutDashboard,
    color: '#2563eb', colorBg: 'rgba(37,99,235,0.1)',   colorBorder: 'rgba(37,99,235,0.22)',  colorGlow: 'rgba(37,99,235,0.4)',  colorHover: '#1d4ed8' },
  { name: 'Trainings',    path: '/user/training',    icon: BookOpen,
    color: '#7c3aed', colorBg: 'rgba(124,58,237,0.1)',  colorBorder: 'rgba(124,58,237,0.22)', colorGlow: 'rgba(124,58,237,0.4)', colorHover: '#6d28d9' },
  { name: 'Report Mail',  path: '/user/report',      icon: Mail,
    color: '#e11d48', colorBg: 'rgba(225,29,72,0.08)',  colorBorder: 'rgba(225,29,72,0.2)',   colorGlow: 'rgba(225,29,72,0.4)',  colorHover: '#be123c' },
  { name: 'Leaderboard',  path: '/user/leaderboard', icon: Trophy,
    color: '#d97706', colorBg: 'rgba(217,119,6,0.1)',   colorBorder: 'rgba(217,119,6,0.22)',  colorGlow: 'rgba(217,119,6,0.45)', colorHover: '#b45309' },
  { name: 'Message Admin',path: '/user/messages',    icon: MessageCircle,
    color: '#059669', colorBg: 'rgba(5,150,105,0.08)',  colorBorder: 'rgba(5,150,105,0.2)',   colorGlow: 'rgba(5,150,105,0.4)',  colorHover: '#047857' },
  { name: 'Settings',     path: '/user/profile',     icon: Settings,
    color: '#475569', colorBg: 'rgba(71,85,105,0.08)',  colorBorder: 'rgba(71,85,105,0.2)',   colorGlow: 'rgba(71,85,105,0.3)',  colorHover: '#334155' },
];

const UserTopbar = ({ onSearchClick, onNotificationsClick }) => {
  const { currentUser, notifications, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizzesDropdownOpen, setQuizzesDropdownOpen] = useState(false);

  useEffect(() => {
    if (!quizzesDropdownOpen) return;
    const handleOutsideClick = () => setQuizzesDropdownOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [quizzesDropdownOpen]);

  const unreadCount = notifications ? notifications.filter(n => !n.is_read).length : 0;
  const xp = currentUser?.rewards_balance || 1010;
  const level = Math.floor(xp / 100) + 1;
  const streak = currentUser?.streakDays || 0;
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const isActive = (path) => {
    if (path === '/user/dashboard') {
      return location.pathname === '/user/dashboard' || location.pathname === '/user' || location.pathname === '/user/';
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Log Out',
      description: 'Are you sure you want to leave the portal?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (ok) {
      logout();
      navigate('/user/login');
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.emp-profile-dropdown-wrapper')) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [dropdownOpen]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        height: '70px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Scan-line overlay — clipped to header bounds only */}
      <div className="topbar-scanline" aria-hidden="true" style={{ clipPath: 'inset(0)' }} />
      {/* Left: Logo & Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', display: 'none', padding: '4px' }}
          className="emp-hamburger-btn"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={phintraSentinel} alt="Phintra Sentinel" style={{ width: '135px', height: 'auto', maxHeight: '42px', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Center: Desktop Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="emp-desktop-nav">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.path);
          const isTrainings = item.name === 'Trainings';

          if (isTrainings) {
            return (
              <div key={item.path} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Link
                  to={item.path}
                  style={{
                    '--btn-color': item.color,
                    '--btn-shadow': item.colorHover,
                    padding: '5px 28px 5px 12px',
                  }}
                  className={`emp-nav-link ${active ? 'active-3d' : 'inactive-3d'}`}
                  data-color={item.color}
                  data-glow={item.colorGlow}
                >
                  {/* Pulsing outer glow ring — per-page color */}
                  {active && (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        inset: '-2px',
                        borderRadius: '99px',
                        border: `1.5px solid ${item.colorGlow}`,
                        pointerEvents: 'none',
                        zIndex: -1,
                      }}
                    />
                  )}
                  <motion.span
                    animate={active ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <item.icon size={15} style={{ opacity: active ? 1 : 0.7 }} />
                  </motion.span>
                  {item.name}
                </Link>

                {/* Dropdown Arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setQuizzesDropdownOpen(!quizzesDropdownOpen);
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    color: active ? '#ffffff' : '#64748b',
                    zIndex: 3
                  }}
                >
                  <ChevronDown size={12} style={{ transform: quizzesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                </button>

                {/* Submenu Dropdown */}
                <AnimatePresence>
                  {quizzesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '8px',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        zIndex: 100,
                        minWidth: '150px',
                        overflow: 'hidden'
                      }}
                    >
                      <div 
                        onClick={() => {
                          setQuizzesDropdownOpen(false);
                          navigate('/user/quizzes');
                        }}
                        style={{
                          padding: '12px 16px',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Award size={14} color="#7c3aed" />
                        Quizzes Page
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                '--btn-color': item.color,
                '--btn-shadow': item.colorHover,
                padding: '5px 12px',
              }}
              className={`emp-nav-link ${active ? 'active-3d' : 'inactive-3d'}`}
              data-color={item.color}
              data-glow={item.colorGlow}
            >
              {/* Pulsing outer glow ring — per-page color */}
              {active && (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    inset: '-2px',
                    borderRadius: '99px',
                    border: `1.5px solid ${item.colorGlow}`,
                    pointerEvents: 'none',
                    zIndex: -1,
                  }}
                />
              )}
              <motion.span
                animate={active ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <item.icon size={15} style={{ opacity: active ? 1 : 0.7 }} />
              </motion.span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Right: Badges & Profile Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* XP Badge */}
        <motion.div
          animate={{ boxShadow: ['0 0 0px rgba(37,99,235,0)', '0 0 12px rgba(37,99,235,0.3)', '0 0 0px rgba(37,99,235,0)'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            padding: '6px 14px', borderRadius: '99px',
            position: 'relative', overflow: 'hidden'
          }}
          className="emp-topbar-xp"
        >
          <div className="xp-shimmer" aria-hidden="true" />
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
            style={{ display: 'flex' }}
          >
            <Zap size={13} color="#3b82f6" fill="#3b82f6" />
          </motion.span>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb' }}>{xp} XP</span>
          <span style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: '600' }} className="emp-topbar-lvl">· Lv.{level}</span>
        </motion.div>



        {/* Notifications Icon */}
        <motion.button
          animate={unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
          onClick={onNotificationsClick}
          style={{
            position: 'relative', width: '38px', height: '38px',
            background: '#f1f5f9', border: '1px solid #cbd5e1',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0
          }}
          className="emp-topbar-icon-btn"
        >
          <Bell size={17} color="#475569" />
          {unreadCount > 0 && (
            <>
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#ef4444', color: '#fff',
                fontSize: '9px', fontWeight: '800',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #ffffff', zIndex: 2
              }}>{unreadCount}</span>
              <span className="bell-ping" aria-hidden="true" />
            </>
          )}
        </motion.button>

        {/* Profile Dropdown */}
        <div className="emp-profile-dropdown-wrapper" style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '2px', borderRadius: '12px',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{ boxShadow: ['0 2px 8px rgba(37,99,235,0.25)', '0 2px 18px rgba(6,182,212,0.5)', '0 2px 8px rgba(37,99,235,0.25)'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '800', color: '#fff', flexShrink: 0,
                }}
              >
                {initials}
              </motion.div>
              <span className="avatar-online-dot" aria-hidden="true" />
            </div>
            <ChevronDown size={14} color="#475569" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '8px',
                  width: '240px', background: '#fff', border: '1px solid #e2e8f0',
                  borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08)',
                  overflow: 'hidden', zIndex: 200,
                }}
              >
                {/* Details */}
                <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    {currentUser?.name || 'Employee'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', wordBreak: 'break-all' }}>
                    {currentUser?.email || 'employee@phintra.com'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                    <span style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px' }}>
                      LVL {level}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{currentUser?.role || 'Employee'}</span>
                  </div>
                </div>

                {/* Links */}
                <div style={{ padding: '6px' }}>
                  <Link
                    to="/user/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
                      fontWeight: '600', color: '#475569', textDecoration: 'none',
                      transition: 'all 0.15s'
                    }}
                    className="emp-dropdown-link"
                  >
                    <Settings size={15} />
                    Settings
                  </Link>
                </div>

                {/* Logout */}
                <div style={{ padding: '6px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
                      fontWeight: '600', color: '#ef4444', background: 'transparent',
                      border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                    className="emp-dropdown-logout"
                  >
                    <LogOut size={15} />
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '70px',
              left: 0,
              right: 0,
              background: '#fff',
              borderBottom: '1px solid #e2e8f0',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 95,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}
            className="emp-mobile-menu"
          >
            {NAV_ITEMS.map(item => {
              const active = isActive(item.path);
              const isTrainings = item.name === 'Trainings';
              return (
                <React.Fragment key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: active ? item.color : '#64748b',
                      background: active ? item.colorBg : 'transparent',
                      border: active ? `1px solid ${item.colorBorder}` : '1px solid transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s'
                    }}
                    className="emp-mobile-link"
                  >
                    <item.icon size={16} />
                    {item.name}
                  </Link>

                  {isTrainings && (
                    <Link
                      to="/user/quizzes"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 16px 8px 36px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: location.pathname === '/user/quizzes' ? '#7c3aed' : '#64748b',
                        background: location.pathname === '/user/quizzes' ? 'rgba(124,58,237,0.08)' : 'transparent',
                        border: '1px solid transparent',
                        textDecoration: 'none',
                        transition: 'all 0.15s',
                        marginTop: '-2px',
                        marginBottom: '2px'
                      }}
                      className="emp-mobile-link"
                    >
                      <Award size={14} />
                      Quizzes Page
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bungee+Tint&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        /* ─── Gaming Animations ─── */
        @keyframes scanline {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-150%); }
          100% { transform: translateX(350%); }
        }
        @keyframes ping {
          0%   { transform: scale(1); opacity: 0.8; }
          80%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes onlinePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
          50%       { box-shadow: 0 0 0 4px rgba(16,185,129,0); }
        }

        /* Scan-line top bar sweep */
        .topbar-scanline {
          position: absolute;
          top: 0; left: 0;
          width: 30%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(37,99,235,0.04), transparent);
          animation: scanline 5s linear infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* XP badge shimmer */
        .xp-shimmer {
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
          animation: shimmer 3.5s ease-in-out infinite;
          pointer-events: none;
          border-radius: 99px;
        }

        /* Notification bell ping ring */
        .bell-ping {
          position: absolute;
          top: -4px; right: -4px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #ef4444;
          animation: ping 1.5s ease-out infinite;
          z-index: 1;
        }

        /* Avatar online green dot */
        .avatar-online-dot {
          position: absolute;
          bottom: -2px; right: -2px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #fff;
          animation: onlinePulse 2s ease-in-out infinite;
        }

        /* ─── 3D Cartoon Navigation Buttons (Fredoka Font Style) ─── */
        .emp-nav-link {
          font-family: 'Fredoka', 'Oxanium', sans-serif !important;
          font-size: 11px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          box-sizing: border-box !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          border-radius: 99px !important;
          text-decoration: none !important;
          position: relative !important;
        }

        /* Active 3D button */
        .emp-nav-link.active-3d {
          color: #ffffff !important;
          background: var(--btn-color) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.25) !important;
          border-bottom: 3.5px solid var(--btn-shadow) !important;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1.5px 0 rgba(255, 255, 255, 0.4) !important;
          text-shadow: 0 1.5px 0 var(--btn-shadow) !important;
          transform: translateY(-1.5px);
        }
        .emp-nav-link.active-3d:active {
          border-bottom-width: 1px !important;
          transform: translateY(1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
        }

        /* Inactive 3D button */
        .emp-nav-link.inactive-3d {
          color: #475569 !important;
          background: #f1f5f9 !important;
          border: 1.5px solid #cbd5e1 !important;
          border-bottom: 2.5px solid #94a3b8 !important;
          box-shadow: 0 2px 3px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
          text-shadow: none !important;
          transform: translateY(0px);
        }
        .emp-nav-link.inactive-3d:hover {
          color: #0f172a !important;
          background: #e2e8f0 !important;
          border-bottom-color: #64748b !important;
          transform: translateY(-1px);
        }
        .emp-nav-link.inactive-3d:active {
          border-bottom-width: 1px !important;
          transform: translateY(1px);
        }

        .emp-dropdown-link:hover, .emp-mobile-link:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .emp-dropdown-logout:hover {
          background: rgba(239, 68, 68, 0.05) !important;
        }
        .emp-topbar-icon-btn:hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
          box-shadow: 0 0 10px rgba(37,99,235,0.15) !important;
        }
        @media (max-width: 991px) {
          .emp-desktop-nav { display: none !important; }
          .emp-hamburger-btn { display: block !important; }
        }
        @media (max-width: 580px) {
          .emp-topbar-logo-text { display: none !important; }
          .emp-topbar-xp { padding: 4px 8px !important; }
          .emp-topbar-lvl { display: none !important; }
          .emp-topbar-streak { display: none !important; }
        }
      `}</style>
    </motion.header>
  );
};

export default UserTopbar;
