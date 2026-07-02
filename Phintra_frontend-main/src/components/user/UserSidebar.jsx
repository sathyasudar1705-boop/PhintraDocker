import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Mail, Trophy, MessageCircle, Settings, LogOut, X, ShieldCheck, Zap
} from 'lucide-react';
import phintraLogo from '../../assets/phintra_logo.png';

const NAV_ITEMS = [
  { name: 'Dashboard',     path: '/user/dashboard',   icon: LayoutDashboard,
    color: '#93c5fd', colorBg: 'rgba(37,99,235,0.2)',   colorBorder: 'rgba(37,99,235,0.3)',  colorGlow: '#60a5fa',  barGrad: 'linear-gradient(180deg,#60a5fa,#2563EB)' },
  { name: 'Trainings',    path: '/user/training',    icon: BookOpen,
    color: '#c4b5fd', colorBg: 'rgba(124,58,237,0.2)',  colorBorder: 'rgba(124,58,237,0.3)', colorGlow: '#a78bfa',  barGrad: 'linear-gradient(180deg,#a78bfa,#7c3aed)' },
  { name: 'Report Mail',  path: '/user/report',      icon: Mail,
    color: '#fda4af', colorBg: 'rgba(225,29,72,0.15)',  colorBorder: 'rgba(225,29,72,0.25)', colorGlow: '#fb7185',  barGrad: 'linear-gradient(180deg,#fb7185,#e11d48)' },
  { name: 'Leaderboard',  path: '/user/leaderboard', icon: Trophy,
    color: '#fcd34d', colorBg: 'rgba(217,119,6,0.18)',  colorBorder: 'rgba(217,119,6,0.3)',  colorGlow: '#fbbf24',  barGrad: 'linear-gradient(180deg,#fbbf24,#d97706)' },
  { name: 'Message Admin',path: '/user/messages',    icon: MessageCircle,
    color: '#6ee7b7', colorBg: 'rgba(5,150,105,0.15)',  colorBorder: 'rgba(5,150,105,0.28)', colorGlow: '#34d399',  barGrad: 'linear-gradient(180deg,#34d399,#059669)' },
  { name: 'Settings',     path: '/user/profile',     icon: Settings,
    color: '#cbd5e1', colorBg: 'rgba(71,85,105,0.2)',   colorBorder: 'rgba(71,85,105,0.3)',  colorGlow: '#94a3b8',  barGrad: 'linear-gradient(180deg,#94a3b8,#475569)' },
];

const UserSidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { currentUser, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const xp = currentUser?.rewards_balance || 1010;
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Log Out',
      description: 'Are you sure you want to leave the portal?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (ok) { logout(); navigate('/user/login'); }
  };

  const isActive = (path) => {
    if (path === '/user/dashboard') {
      return location.pathname === '/user/dashboard' || location.pathname === '/user' || location.pathname === '/user/';
    }
    return location.pathname === path;
  };

  const SidebarContent = ({ onItemClick }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '54px', height: '54px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'visible',
            }}
          >
            <img src={phintraLogo} alt="Phintra Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Phintra</div>
            <div style={{ fontSize: '9px', fontWeight: '700', color: '#06B6D4', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1px' }}>Security Hub</div>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '800', color: '#fff', flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.15)'
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || 'Employee'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <span style={{ background: 'rgba(37,99,235,0.3)', color: '#60a5fa', fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '99px', border: '1px solid rgba(96,165,250,0.3)' }}>
                LVL {level}
              </span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{currentUser?.role || 'Employee'}</span>
            </div>
          </div>
        </div>
        {/* XP Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                style={{ display: 'flex' }}
              >
                <Zap size={10} color="#f59e0b" />
              </motion.span> XP Progress
            </span>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{xpInLevel}/100</span>
          </div>
          <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: `${xpInLevel}%`, height: '100%',
              background: 'linear-gradient(90deg, #2563EB, #06B6D4)',
              borderRadius: '99px',
              transition: 'width 0.6s ease',
              minWidth: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div className="sidebar-xp-shimmer" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
        <div style={{ fontSize: '9px', fontWeight: '800', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
          Navigation
        </div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
                fontSize: '13px', fontWeight: active ? '700' : '500',
                color: active ? item.color : '#64748b',
                background: active ? item.colorBg : 'transparent',
                border: active ? `1px solid ${item.colorBorder}` : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              className="emp-sidebar-nav-link"
            >
              {active && (
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6], scaleY: [0.85, 1.1, 0.85] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: '3px', height: '60%', background: item.barGrad,
                    borderRadius: '0 3px 3px 0',
                    boxShadow: `0 0 8px ${item.colorGlow}`
                  }}
                />
              )}
              {!active && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: '3px', height: '60%', background: '#2563EB',
                  borderRadius: '0 3px 3px 0', opacity: 0
                }} />
              )}
              <motion.span
                animate={active ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                style={{ display: 'flex', flexShrink: 0 }}
              >
                <Icon size={16} style={{ color: active ? item.colorGlow : '#475569' }} />
              </motion.span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', borderRadius: '10px', width: '100%',
            fontSize: '13px', fontWeight: '600', color: '#ef4444',
            background: 'transparent', border: '1px solid transparent',
            cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left'
          }}
          className="emp-sidebar-logout"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        width: '240px', background: '#0B1120',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100,
        display: 'flex', flexDirection: 'column'
      }} className="desktop-sidebar-only">
        <SidebarContent onItemClick={undefined} />
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '260px', background: '#0B1120', display: 'flex', flexDirection: 'column',
              boxShadow: '4px 0 32px rgba(0,0,0,0.5)', animation: 'slideInLeft 0.2s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            <SidebarContent onItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        /* ─── Sidebar Gaming Animations ─── */
        @keyframes sidebarXpShimmer {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
        @keyframes sidebarEdgeGlow {
          0%, 100% { box-shadow: 1px 0 0 rgba(37,99,235,0.12), 2px 0 20px rgba(37,99,235,0.0); }
          50%       { box-shadow: 1px 0 0 rgba(37,99,235,0.25), 2px 0 20px rgba(37,99,235,0.12); }
        }

        /* XP bar shimmer inside the fill */
        .sidebar-xp-shimmer {
          position: absolute;
          top: 0; left: 0;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          animation: sidebarXpShimmer 2s ease-in-out infinite;
          border-radius: 99px;
        }

        /* Sidebar right-edge neon glow */
        .desktop-sidebar-only {
          animation: sidebarEdgeGlow 3s ease-in-out infinite !important;
        }

        .emp-sidebar-nav-link:hover {
          background: rgba(255,255,255,0.04) !important;
          color: #94a3b8 !important;
          border-color: rgba(255,255,255,0.04) !important;
          box-shadow: inset 0 0 12px rgba(37,99,235,0.08) !important;
        }
        .emp-sidebar-logout:hover {
          background: rgba(239,68,68,0.08) !important;
          border-color: rgba(239,68,68,0.15) !important;
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default UserSidebar;
