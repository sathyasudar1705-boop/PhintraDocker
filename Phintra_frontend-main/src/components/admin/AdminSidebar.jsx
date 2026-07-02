import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { 
  LayoutDashboard, Send, PlusCircle, Mail, Users, Building2, 
  BookOpen, Award, AlertTriangle, BarChart3, Trophy, Settings, 
  LogOut, ShieldCheck, X, Activity, Brain, FileText, Globe, 
  Calendar, History, Fingerprint, ShieldAlert, Sparkles
} from 'lucide-react';
import phintraLogo from '../../assets/phintra_logo.png';


const AdminSidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { currentUser, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const menuGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Executive Dashboard', path: '/admin/executive-dashboard', icon: Activity },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'Awareness Insights', path: '/admin/awareness-insights', icon: BarChart3 },
      ]
    },
    {
      label: 'CAMPAIGNS',
      items: [
        { name: 'Campaigns', path: '/admin/campaigns', icon: Send },
        { name: 'Create Campaign', path: '/admin/create-campaign', icon: PlusCircle },
        { name: 'Template Builder', path: '/admin/template-builder', icon: FileText },
        { name: 'Landing Builder', path: '/admin/landing-builder', icon: Globe },
        { name: 'Email Templates', path: '/admin/email-templates', icon: Mail },
        { name: 'Campaign Calendar', path: '/admin/calendar', icon: Calendar },
        { name: 'Awareness Builder', path: '/admin/awareness-builder', icon: Sparkles },
        { name: 'Email Simulator', path: '/admin/email-simulator', icon: Mail },
      ]
    },
    {
      label: 'USERS',
      items: [
        { name: 'Users / Employees', path: '/admin/employees', icon: Users },
        { name: 'Departments', path: '/admin/departments', icon: Building2 },
        { name: 'Support Messages', path: '/admin/support-messages', icon: Mail },
      ]
    },
    {
      label: 'SECURITY',
      items: [
        { name: 'Threat Feed', path: '/admin/threat-feed', icon: ShieldAlert },
        { name: 'Reported Emails', path: '/admin/reported-emails', icon: AlertTriangle },
        { name: 'SMTP Email Logs', path: '/admin/email-logs', icon: Mail },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
        { name: 'Security Maturity', path: '/admin/security-maturity', icon: ShieldCheck },
      ]
    },
    {
      label: 'ADMINISTRATION',
      items: [
        { name: 'Training Modules', path: '/admin/training-modules', icon: BookOpen },
        { name: 'Quizzes', path: '/admin/quizzes', icon: Award },
        { name: 'Roles & Permissions', path: '/admin/roles-permissions', icon: Fingerprint },
        { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Confirm Log Out',
      description: 'Are you sure you want to log out of the admin console?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      logout();
      navigate('/admin/login');
    }
  };

  const renderNavItems = (onItemClick) => {
    return menuGroups.map((group, gIdx) => (
      <div key={group.label} style={{ marginBottom: gIdx === menuGroups.length - 1 ? '0' : '12px' }}>
        <div style={{ 
          fontSize: '11px', 
          fontWeight: '700', 
          color: 'var(--text-subtle)', 
          paddingLeft: '14px', 
          marginBottom: '6px',
          letterSpacing: '0.05em'
        }}>
          {group.label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {group.items.map((item) => {
            const Icon = item.icon;
            // Support matching root /admin as Dashboard
            const isDashboard = item.path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/');
            const isActive = location.pathname === item.path || isDashboard;
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={onItemClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
                className={isActive ? "" : "sidebar-nav-hover"}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-light)' }} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        padding: '24px 16px'
      }} className="desktop-sidebar-only">
        {/* Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '24px',
          paddingLeft: '8px'
        }}>
          <img 
            src={phintraLogo} 
            alt="Phintra Logo" 
            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain', background: 'transparent' }}
          />
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>Phintra</h1>
            <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: '600' }}>ADMIN CONSOLE</span>
          </div>
        </div>

        {/* Navigation Items (Grouped) */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {renderNavItems()}
        </nav>

        {/* Footer Actions */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}>

          
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--color-danger)',
              width: '100%',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent'
            }}
            className="sidebar-nav-logout-hover"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* 2. Responsive Mobile Drawer SideBar */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex'
        }}>
          <div style={{
            width: '270px',
            backgroundColor: 'var(--bg-sidebar)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingLeft: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img 
                  src={phintraLogo} 
                  alt="Phintra Logo" 
                  style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'contain', background: 'transparent' }}
                />
                <h1 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Phintra</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-light)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
              {renderNavItems(() => setMobileMenuOpen(false))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--color-danger)',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          </div>
          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

    </>
  );
};

export default AdminSidebar;
