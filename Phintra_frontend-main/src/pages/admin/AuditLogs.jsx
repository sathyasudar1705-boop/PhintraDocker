import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, History, Eye, ArrowDownToLine, ShieldAlert, Filter, Database } from 'lucide-react';
import Button from '../../components/common/Button';

const AuditLogs = () => {
  const { auditLogs } = useAppContext();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  
  // Selected log for detailed popup modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleExportCSV = () => {
    triggerToast('CSV report compiled. Initiating secure file download...');
  };

  // Get list of unique action types for filter dropdown
  const uniqueActions = ['All', ...new Set(auditLogs.map(log => log.action))];

  // Filtering logic
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

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
          <ShieldAlert size={18} style={{ color: 'var(--color-success)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>System Administrative Audit Logs</h1>
          <p>Trace, review, and export all critical backend configuration activities and simulation records.</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          variant="outline"
          icon={ArrowDownToLine}
        >
          Export CSV Logs
        </Button>
      </div>

      {/* Filter toolbar card */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
              <input
                type="text"
                placeholder="Search logs by operator or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '6px', border: '1px solid var(--border-hover)', fontSize: '13px' }}
              />
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
                <Search size={16} />
              </div>
            </div>

            {/* Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
              <Filter size={15} style={{ color: 'var(--text-light)' }} />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="form-control"
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)', fontSize: '13px' }}
              >
                {uniqueActions.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>
            Showing {filteredLogs.length} registry entries
          </span>

        </div>
      </div>

      {/* Logs Table Grid */}
      <div className="saas-table-container">
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
            <History size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
            <h3>No audit records match your filters</h3>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Try resetting the search terms or look under all category scopes.</p>
          </div>
        ) : (
          <table className="saas-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>OPERATOR</th>
                <th>ACTION TYPE</th>
                <th>DETAILS SUMMARY</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(log)}>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{log.user}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: 'var(--color-primary-light)', 
                      color: 'var(--color-primary-hover)', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.details}
                  </td>
                  <td>
                    <span style={{ 
                      backgroundColor: 'var(--color-success-light)', 
                      color: '#047857', 
                      padding: '2px 8px', 
                      borderRadius: '9999px', 
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--color-primary)', 
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      <Eye size={14} />
                      Inspect payload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Inspect Log Modal */}
      {selectedLog && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div className="modal-content animate-fade-in" style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '560px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Audit Entry Metadata Payload</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--text-light)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* JSON Styled details */}
            <div style={{
              backgroundColor: 'var(--text-main)',
              color: '#38bdf8',
              borderRadius: '8px',
              padding: '20px',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              overflowX: 'auto',
              marginBottom: '20px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <span style={{ color: 'var(--border-color)' }}>{`{`}</span>
              <div style={{ paddingLeft: '20px' }}>
                <div><span style={{ color: '#f43f5e' }}>"transaction_id"</span>: <span style={{ color: 'var(--color-warning)' }}>{selectedLog.id}</span>,</div>
                <div><span style={{ color: '#f43f5e' }}>"timestamp"</span>: <span style={{ color: 'var(--color-success)' }}>"{selectedLog.timestamp}"</span>,</div>
                <div><span style={{ color: '#f43f5e' }}>"operator_node"</span>: <span style={{ color: 'var(--color-success)' }}>"{selectedLog.user}"</span>,</div>
                <div><span style={{ color: '#f43f5e' }}>"authorization_role"</span>: <span style={{ color: 'var(--color-success)' }}>"Security Administrator"</span>,</div>
                <div><span style={{ color: '#f43f5e' }}>"action_trigger"</span>: <span style={{ color: 'var(--color-success)' }}>"{selectedLog.action}"</span>,</div>
                <div><span style={{ color: '#f43f5e' }}>"details"</span>: <span style={{ color: 'var(--color-success)' }}>"{selectedLog.details}"</span>,</div>
                <div><span style={{ color: '#f43f5e' }}>"verification_status"</span>: <span style={{ color: 'var(--color-success)' }}>"{selectedLog.status}"</span>,</div>
                <div><span style={{ color: '#f43f5e' }}>"system_handshake"</span>: <span style={{ color: 'var(--color-warning)' }}>true</span></div>
              </div>
              <span style={{ color: 'var(--border-color)' }}>{`}`}</span>
            </div>

            <div style={{ display: 'flex', justifySelf: 'end' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--text-main)',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AuditLogs;
