import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ShieldCheck, Search, Filter, ShieldAlert, Eye, CheckCircle2, RefreshCw, Mail, Clock, AlertTriangle, Building2, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const AdminReportedEmails = () => {
  const { reportedEmails, resolveReportedEmail } = useAppContext();

  // Calculate metrics for cards
  const totalReports = reportedEmails.length;
  const pendingReports = reportedEmails.filter(r => r.status === 'Pending' || r.status === 'New').length;
  const resolvedReports = reportedEmails.filter(r => r.status === 'Resolved' || r.status === 'Safe').length;
  const highRiskReports = reportedEmails.filter(r => r.riskLevel === 'High' || r.riskLevel === 'Critical' || (r.riskScore || 0) > 70).length;
  const uniqueDeptsCount = new Set(reportedEmails.map(r => r.departmentId).filter(Boolean)).size;
  const latestReportSubject = reportedEmails[0] ? reportedEmails[0].subject : 'No reports';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // Modal State
  const [selectedReport, setSelectedReport] = useState(null);

  // Filtered Reports
  const filteredReports = reportedEmails.filter((rep) => {
    const employeeName = rep.employeeName || "Unknown Employee";
    const senderEmail = rep.senderEmail || "unknown@sender.com";
    const subject = rep.subject || "No Subject";
    const campaignName = rep.campaignName || "External Gmail Report";
    const id = rep.id || "";

    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          senderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          id.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesStatus = statusFilter === 'All' || 
                          rep.status === statusFilter || 
                          (statusFilter === 'New' && (rep.status === 'Pending' || rep.status === 'New')) || 
                          (statusFilter === 'Resolved' && (rep.status === 'Resolved' || rep.status === 'Safe'));
                          
    const matchesRisk = riskFilter === 'All' || rep.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleUpdateStatus = (id, newStatus) => {
    resolveReportedEmail(id, newStatus);
    
    // Auto sync modal display if open
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Reported Threats Console</h1>
          <p>Inspect emails flagged by corporate employees, review security parameters, and resolve investigations.</p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total Reports */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>Total Reports</span>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px', color: 'var(--color-primary)' }}>{totalReports}</h3>
          </div>
          <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '8px', borderRadius: '8px' }}>
            <Mail size={20} />
          </div>
        </div>

        {/* Pending Reports */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>Pending Reports</span>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px', color: 'var(--color-warning)' }}>{pendingReports}</h3>
          </div>
          <div style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)', padding: '8px', borderRadius: '8px' }}>
            <Clock size={20} />
          </div>
        </div>

        {/* Resolved Reports */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>Resolved Reports</span>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px', color: 'var(--color-success)' }}>{resolvedReports}</h3>
          </div>
          <div style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', padding: '8px', borderRadius: '8px' }}>
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* High Risk Reports */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>High Risk</span>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px', color: 'var(--color-danger)' }}>{highRiskReports}</h3>
          </div>
          <div style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '8px', borderRadius: '8px' }}>
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* Department Reports */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>Reporting Depts</span>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px', color: 'var(--color-teal)' }}>{uniqueDeptsCount}</h3>
          </div>
          <div style={{ backgroundColor: 'var(--color-teal-light)', color: 'var(--color-teal)', padding: '8px', borderRadius: '8px' }}>
            <Building2 size={20} />
          </div>
        </div>

        {/* Latest Reported Email */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', gridColumn: 'span 2' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>Latest Incident</span>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {latestReportSubject}
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-muted)', padding: '8px', borderRadius: '8px', marginLeft: '12px', flexShrink: 0 }}>
            <HelpCircle size={20} />
          </div>
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Keyword Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search reports by reporter, sender, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
              <Search size={16} />
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-light)' }} />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '150px', padding: '8px 12px' }}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} style={{ color: 'var(--text-light)' }} />
            <select
              className="form-control"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              style={{ minWidth: '140px', padding: '8px 12px' }}
            >
              <option value="All">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

        </div>
      </div>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <ShieldCheck size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>Threat database clean</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>No reported emails match your filter parameters.</p>
        </div>
      ) : (
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Subject</th>
                <th>Sender</th>
                <th>Employee</th>
                <th>Campaign</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{report.id ? report.id.substring(0, 8) : 'N/A'}</td>
                  <td style={{ fontWeight: '500' }}>{report.subject}</td>
                  <td style={{ color: 'var(--text-light)' }}>{report.senderEmail}</td>
                  <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{report.employeeName || "Unknown Employee"}</td>
                  <td style={{ color: 'var(--text-light)' }}>{report.campaignName || "External Gmail Report"}</td>
                  <td>
                    <span className={`badge badge-${(report.riskScore || 0) > 70 ? 'high' : (report.riskScore || 0) > 35 ? 'medium' : 'low'}`}>
                      {report.riskScore || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${report.status.toLowerCase()}`}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-light)' }}>
                    {report.createdAt ? report.createdAt.split('T')[0] : report.reportedDate}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button 
                        onClick={() => setSelectedReport(report)}
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        style={{ padding: '6px' }}
                        title="Triage threat details"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Threat Triage Details Modal */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2>Threat Forensic Analysis</h2>
              <button onClick={() => setSelectedReport(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Header metrics */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Report by {selectedReport.employeeName || "Unknown Employee"}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: 'var(--text-light)', gap: '2px', marginTop: '4px' }}>
                    <span>Flagged on: {selectedReport.createdAt ? selectedReport.createdAt.split('T')[0] : selectedReport.reportedDate}</span>
                    <span>Campaign: {selectedReport.campaignName || "External Gmail Report"}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`badge badge-${(selectedReport.riskLevel || 'low').toLowerCase()}`}>
                    {selectedReport.riskLevel} Risk ({selectedReport.riskScore || 0} Score)
                  </span>
                  <span className={`badge badge-${selectedReport.status.toLowerCase()}`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Fake Email client mock box */}
              <div style={{
                border: '1px solid var(--border-hover)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: 'var(--bg-sidebar)',
                  borderBottom: '1px solid var(--border-hover)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-subtle)' }}>From:</span> {selectedReport.senderEmail}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-subtle)' }}>Subject:</span> <strong style={{ color: 'var(--text-main)' }}>{selectedReport.subject}</strong>
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                  minHeight: '140px',
                  fontFamily: 'monospace'
                }}>
                  {selectedReport.body || "No email body extract available for this mock threat report."}
                </div>
              </div>

              {/* Employee Messages / Comments */}
              {selectedReport.messages && selectedReport.messages.length > 0 && (
                <div style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-sidebar)',
                  marginTop: '8px'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '10px' }}>
                    Employee Comments & Notes
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedReport.messages.map((msg) => (
                      <div key={msg.id} style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: '600', color: 'var(--text-main)' }}>
                          <span>{msg.sender_name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{msg.message_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Triage action board */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Administrative Triage Options</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Button 
                    onClick={() => handleUpdateStatus(selectedReport.id, 'Investigating')}
                    variant="secondary"
                    size="sm"
                    icon={RefreshCw}
                    disabled={selectedReport.status === 'Investigating'}
                  >
                    Mark as Investigating
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus(selectedReport.id, 'Resolved')}
                    variant="teal"
                    size="sm"
                    icon={CheckCircle2}
                    disabled={selectedReport.status === 'Resolved'}
                  >
                    Resolve Threat (Safe / Simulation completed)
                  </Button>
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <Button onClick={() => setSelectedReport(null)} variant="primary">Close Triage</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReportedEmails;
