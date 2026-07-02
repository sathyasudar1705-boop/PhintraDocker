import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Shield, Save, Fingerprint, Lock, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';

const RolesPermissions = () => {
  const { rolePermissions, savePermissions } = useAppContext();

  // Local state for permissions matrix to support edit draft cycles before saving
  const [localMatrix, setLocalMatrix] = useState(() => {
    return JSON.parse(JSON.stringify(rolePermissions));
  });

  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleToggle = (roleIndex, permissionKey) => {
    const updated = [...localMatrix];
    updated[roleIndex][permissionKey] = !updated[roleIndex][permissionKey];
    setLocalMatrix(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    savePermissions(localMatrix);
    triggerToast('Access Control Matrix saved and synchronized across all user sessions.');
  };

  // Human-readable labels for the permissions columns
  const permissionKeys = [
    { key: 'createCampaign', label: 'Create Campaign' },
    { key: 'viewReports', label: 'View Analytics & Reports' },
    { key: 'manageUsers', label: 'Manage Users & Employees' },
    { key: 'exportData', label: 'Export System Logs' }
  ];

  return (
    <div>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--text-main)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease-out',
          fontSize: '14px'
        }}>
          <ShieldCheck size={18} style={{ color: 'var(--color-success)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Role-Based Access Control (RBAC)</h1>
          <p>Define administrative access parameters and security capabilities for each user group classification.</p>
        </div>
      </div>

      <div className="saas-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <Fingerprint size={22} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Permissions Configuration Grid</h2>
        </div>

        <form onSubmit={handleSave}>
          {/* Responsive custom table matrix */}
          <div className="saas-table-container">
            <table className="saas-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)' }}>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>ROLE TYPE</th>
                  {permissionKeys.map(col => (
                    <th key={col.key} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontWeight: '700', fontSize: '13px' }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {localMatrix.map((row, rIdx) => (
                  <tr key={row.role} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    
                    {/* Role title column */}
                    <td style={{ padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>
                        {row.role === 'Admin' ? 'Security Administrator' : 
                         row.role === 'Manager' ? 'Department Manager' : 
                         row.role === 'Analyst' ? 'Security Analyst' : 'General Employee'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '500' }}>
                        Scope: {row.role === 'Admin' ? 'Full System Configuration' : 
                                row.role === 'Manager' ? 'Team Performance Oversight' : 
                                row.role === 'Analyst' ? 'Threat Database Auditing' : 'Read-only Training Portal'}
                      </span>
                    </td>

                    {/* Permissions check matrix */}
                    {permissionKeys.map(col => {
                      const val = row[col.key];
                      return (
                        <td key={col.key} style={{ padding: '16px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ display: 'inline-flex', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleToggle(rIdx, col.key)}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                outline: 'none'
                              }}
                            >
                              {/* Sliding Toggle design */}
                              <div style={{
                                width: '42px',
                                height: '24px',
                                borderRadius: '12px',
                                backgroundColor: val ? 'var(--color-success)' : 'var(--border-hover)',
                                position: 'relative',
                                transition: 'background-color 0.2s',
                                border: val ? '1.5px solid var(--color-success-hover)' : '1.5px solid var(--text-subtle)'
                              }}>
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--bg-card)',
                                  position: 'absolute',
                                  top: '2.5px',
                                  left: val ? '20px' : '3px',
                                  transition: 'left 0.2s ease',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }} />
                              </div>
                            </button>
                          </div>
                        </td>
                      );
                    })}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button
              type="button"
              onClick={() => setLocalMatrix(JSON.parse(JSON.stringify(rolePermissions)))}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-hover)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Reset to Defaults
            </button>
            <Button
              type="submit"
              variant="primary"
              icon={Save}
            >
              Save Control Matrix
            </Button>
          </div>
        </form>

      </div>

      {/* Security alert card */}
      <div style={{
        display: 'flex',
        alignItems: 'start',
        gap: '16px',
        backgroundColor: 'var(--color-primary-light)',
        border: '1px solid #bfdbfe',
        borderRadius: '10px',
        padding: '20px'
      }}>
        <Lock size={20} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e3a8a', marginBottom: '4px' }}>System Security Handshake</h4>
          <p style={{ fontSize: '13px', color: 'var(--color-primary-hover)', lineHeight: '1.6' }}>
            Changes to the Access Control Matrix are logged instantly in the system audit registry. Employees toggled to administrative scopes must perform multi-factor validation at next login.
          </p>
        </div>
      </div>

      {/* CSS style keyframes */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default RolesPermissions;
