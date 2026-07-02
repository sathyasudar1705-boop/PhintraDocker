import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const AuthLayout = () => {
  const location = useLocation();

  // All auth pages render as full-page layouts (no wrapper card)
  const isFullPageAuth =
    location.pathname === '/admin/login' ||
    location.pathname === '/user/login' ||
    location.pathname === '/login' ||
    location.pathname === '/employee-login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password';

  if (isFullPageAuth) {
    return <Outlet />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      padding: '24px',
      fontFamily: 'var(--font-family)'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Brand Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <img 
            src="https://i.pinimg.com/1200x/5c/07/7c/5c077c6c718fb0216266ccf723d011d3.jpg" 
            alt="Phintra Logo" 
            style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1'
            }}>Phintra</h1>
            <p style={{
              fontSize: '12px',
              color: 'var(--text-light)',
              fontWeight: '500',
              marginTop: '4px'
            }}>Learning Platform</p>
          </div>
        </div>

        {/* Content Card */}
        <div className="saas-card" style={{
          padding: '36px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <Outlet />
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-subtle)'
        }}>
          &copy; {new Date().getFullYear()} Phintra Inc. Enterprise Cybersecurity Training.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
