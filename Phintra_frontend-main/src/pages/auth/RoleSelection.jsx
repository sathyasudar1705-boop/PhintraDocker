import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

const RoleSelection = () => {
  const { selectRole, currentUser } = useAppContext();
  const navigate = useNavigate();

  const handleRoleSelect = (role, path) => {
    selectRole(role);
    navigate(path);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>Select Workspace Role</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
          Welcome, <strong style={{ color: 'var(--text-main)' }}>{currentUser.name || 'Alex'}</strong>. Please choose your portal path:
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Card 1: Admin */}
        <div 
          onClick={() => handleRoleSelect('Security Administrator', '/admin')}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            backgroundColor: 'var(--bg-card)'
          }}
          className="role-selection-card blue-hover"
        >
          <div style={{
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: '12px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>Security Admin</h3>
              <ArrowRight size={14} className="role-arrow" style={{ color: 'var(--text-subtle)', transition: 'transform 0.2s' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', lineHeight: '1.5' }}>
              Manage active simulation campaigns, customize email templates, review reported threats, and inspect organization-wide risk analytics.
            </p>
          </div>
        </div>

        {/* Card 2: User / Employee */}
        <div 
          onClick={() => handleRoleSelect('Employee', '/user')}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            backgroundColor: 'var(--bg-card)'
          }}
          className="role-selection-card teal-hover"
        >
          <div style={{
            backgroundColor: 'var(--color-teal-light)',
            color: 'var(--color-teal)',
            padding: '12px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <UserCheck size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>Employee Portal</h3>
              <ArrowRight size={14} className="role-arrow" style={{ color: 'var(--text-subtle)', transition: 'transform 0.2s' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', lineHeight: '1.5' }}>
              Access pending cybersecurity training courses, test yourself with past simulation results, report suspicious emails, and claim completion certificates.
            </p>
          </div>
        </div>

      </div>

      {/* Embedded visual interactions styling */}
      <style>{`
        .role-selection-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        .blue-hover:hover {
          border-color: var(--color-primary) !important;
        }
        .blue-hover:hover .role-arrow {
          transform: translateX(4px);
          color: var(--color-primary) !important;
        }
        .teal-hover:hover {
          border-color: var(--color-teal) !important;
        }
        .teal-hover:hover .role-arrow {
          transform: translateX(4px);
          color: var(--color-teal) !important;
        }
      `}</style>
    </div>
  );
};

export default RoleSelection;
