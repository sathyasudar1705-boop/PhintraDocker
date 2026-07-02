import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { 
  Home, BookOpen, AlertTriangle, Trophy, MessageSquare, 
  Settings, LogOut, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import phintraLogo from '../../assets/phintra_logo.png';

const EmployeeSidebar = () => {
  const { currentUser, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: Home },
    { name: 'Trainings', path: '/user/training', icon: BookOpen },
    { name: 'Report Mail', path: '/user/report', icon: AlertTriangle },
    { name: 'Leaderboard', path: '/user/leaderboard', icon: Trophy },
    { name: 'Message with Admin', path: '/user/messages', icon: MessageSquare },
    { name: 'Settings', path: '/user/profile', icon: Settings },
  ];

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Confirm Log Out',
      description: 'Are you sure you want to log out of the employee portal?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      logout();
      navigate('/user/login');
    }
  };

  return (
    <aside style={{
      width: '80px',
      backgroundColor: '#0f172a', // Primary Navy
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'fixed',
      top: '16px',
      bottom: '16px',
      left: '16px',
      zIndex: 100,
      padding: '24px 0',
      borderRadius: '24px', // Rounded corner panels
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      justifyContent: 'space-between'
    }}>
      {/* Top Brand Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
        <img src={phintraLogo} alt="Phintra Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
      </div>

      {/* Nav Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isHome = item.path === '/user/dashboard' && (location.pathname === '/user' || location.pathname === '/user/');
          const isActive = location.pathname === item.path || isHome;

          return (
            <div
              key={item.name}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  color: isActive ? '#06b6d4' : '#94a3b8',
                  background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 15px rgba(6, 182, 212, 0.15)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                <Icon size={20} />
                
                {/* Active Indicator side line */}
                {isActive && (
                  <motion.div
                    layoutId="activeSideLine"
                    style={{
                      position: 'absolute',
                      left: '-8px',
                      width: '4px',
                      height: '20px',
                      background: '#06b6d4',
                      borderRadius: '0 4px 4px 0',
                      boxShadow: '0 0 8px #06b6d4'
                    }}
                  />
                )}
              </Link>

              {/* Tooltip on Hover */}
              <AnimatePresence>
                {hoveredItem === item.name && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      left: '60px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      zIndex: 1000
                    }}
                  >
                    {item.name}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Logout Bottom Button */}
      <div style={{ position: 'relative' }}
        onMouseEnter={() => setHoveredItem('Log Out')}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            color: '#ef4444',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={20} />
        </button>

        {/* Tooltip on Hover */}
        <AnimatePresence>
          {hoveredItem === 'Log Out' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{
                position: 'absolute',
                left: '60px',
                top: '58%',
                transform: 'translateY(-50%)',
                background: '#ef4444',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                zIndex: 1000
              }}
            >
              Log Out
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
