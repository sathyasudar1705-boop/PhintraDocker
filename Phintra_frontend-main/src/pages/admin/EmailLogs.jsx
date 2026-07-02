import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Mail, Eye, ArrowDownToLine, ShieldAlert, Filter, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/emails/logs');
      setLogs(res.data);
    } catch (e) {
      console.error("Failed to fetch email logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleExportCSV = () => {
    // Basic CSV compiler
    if (logs.length === 0) {
      triggerToast('No logs available to export.');
      return;
    }
    
    const headers = ['Sent At', 'Recipient Email', 'Subject', 'Status', 'Error Message'];
    const rows = logs.map(log => [
      log.sent_at,
      log.recipient_email,
      log.subject.replace(/"/g, '""'),
      log.status,
      (log.error_message || '').replace(/"/g, '""')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `phintra_email_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('CSV report compiled. Initiating secure file download...');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.recipient_email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (log.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.error_message || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch(e) {
      return dateStr;
    }
  };

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
          <h1>SMTP Campaign Email Logs</h1>
          <p>Supervise dispatch history, receipt statuses, delivery attempts, and diagnostic errors for awareness programs.</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          variant="outline"
          icon={ArrowDownToLine}
        >
          Export CSV Logs
        </Button>
      </div>

      {/* Filter card */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
              <input
                type="text"
                placeholder="Search logs by recipient, subject, or error description..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control"
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)', fontSize: '13px' }}
              >
                <option value="All">All Delivery Statuses</option>
                <option value="Sent">Sent (Success)</option>
                <option value="Test Sent">Test Sent (Admin)</option>
                <option value="Failed">Failed (SMTP Error)</option>
              </select>
            </div>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>
            Showing {filteredLogs.length} attempts
          </span>

        </div>
      </div>

      {/* Logs Table */}
      <div className="saas-table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
            <Mail size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
            <h3>Synchronizing SMTP audit trace...</h3>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
            <Mail size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
            <h3>No email logs matched your query</h3>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Try sending a test email or launch a campaign to generate trace outputs.</p>
          </div>
        ) : (
          <table className="saas-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>RECIPIENT EMAIL</th>
                <th>SUBJECT HEADER</th>
                <th>DELIVERY STATE</th>
                <th>DIAGNOSTIC NOTES</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const isFailed = log.status === 'Failed';
                const isTest = log.status === 'Test Sent';
                return (
                  <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(log)}>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{formatDate(log.sent_at)}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{log.recipient_email}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.subject}
                    </td>
                    <td>
                      <span style={{ 
                        backgroundColor: isFailed ? 'var(--color-danger-light)' : isTest ? 'var(--color-warning-light)' : 'var(--color-success-light)', 
                        color: isFailed ? '#b91c1c' : isTest ? 'var(--color-warning)' : '#047857', 
                        padding: '3px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: isFailed ? 'var(--color-danger)' : 'var(--text-light)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.error_message || (isTest ? 'Verification loop success' : 'SMTP relay confirmed')}
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
                        Inspect Log
                      </button>
                    </td>
                  </tr>
                );
              })}
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
            maxWidth: '580px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>SMTP Delivery Envelope</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--text-light)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Trace metadata details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              <div>
                <strong>Recipient address:</strong> <code style={{ backgroundColor: 'var(--bg-sidebar)', padding: '2px 6px', borderRadius: '4px' }}>{selectedLog.recipient_email}</code>
              </div>
              <div>
                <strong>Subject header:</strong> <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{selectedLog.subject}</span>
              </div>
              <div>
                <strong>Dispatch timestamp:</strong> <span>{formatDate(selectedLog.sent_at)}</span>
              </div>
              <div>
                <strong>Status code:</strong> 
                <span style={{ 
                  marginLeft: '8px',
                  backgroundColor: selectedLog.status === 'Failed' ? 'var(--color-danger-light)' : selectedLog.status === 'Test Sent' ? 'var(--color-warning-light)' : 'var(--color-success-light)', 
                  color: selectedLog.status === 'Failed' ? '#b91c1c' : selectedLog.status === 'Test Sent' ? 'var(--color-warning)' : '#047857', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {selectedLog.status}
                </span>
              </div>

              {selectedLog.error_message && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030', padding: '12px', borderRadius: '6px', marginTop: '8px' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '2px' }}>SMTP Relay Error:</strong>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedLog.error_message}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                Dismiss Details
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

export default EmailLogs;
