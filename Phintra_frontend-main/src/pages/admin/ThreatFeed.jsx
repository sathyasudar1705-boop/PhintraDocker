import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Search, Filter, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

const ThreatFeed = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedThreat, setSelectedThreat] = useState(null);

  // Mock threat intelligence data
  const threats = [
    {
      id: 'TR-1042',
      title: 'New Credential Harvesting Campaign Targeting O365',
      category: 'Phishing',
      severity: 'Critical',
      date: 'Today, 10:42 AM',
      description: 'A massive wave of emails impersonating Microsoft 365 support is attempting to harvest user credentials using a reverse proxy to bypass MFA.',
      indicators: ['o365-support-update.com', '192.168.1.105', 'MD5: 8f14e45fceea167a5a36dedd4bea2543']
    },
    {
      id: 'TR-1041',
      title: 'Emotet Malware Resurgence in Finance Sector',
      category: 'Malware',
      severity: 'High',
      date: 'Yesterday, 02:15 PM',
      description: 'Emotet has been observed in new email campaigns utilizing password-protected ZIP attachments to evade email gateways.',
      indicators: ['invoice_8829.zip', 'IP: 45.33.22.11']
    },
    {
      id: 'TR-1040',
      title: 'Suspicious Login Attempts from Unknown Geolocation',
      category: 'Account Compromise',
      severity: 'Medium',
      date: 'May 12, 09:30 AM',
      description: 'Multiple failed login attempts detected across 5 user accounts originating from a known Tor exit node.',
      indicators: ['IP: 185.220.101.4']
    },
    {
      id: 'TR-1039',
      title: 'New BEC Strategy: HR Impersonation',
      category: 'Social Engineering',
      severity: 'High',
      date: 'May 10, 11:20 AM',
      description: 'Business Email Compromise (BEC) actors are impersonating HR directors asking employees to update their direct deposit information via a fake portal.',
      indicators: ['hr-update-portal.net', 'sender: hr.director@company-update.com']
    },
    {
      id: 'TR-1038',
      title: 'Outdated Plugin Vulnerability (CVE-2024-1234)',
      category: 'Vulnerability',
      severity: 'Low',
      date: 'May 08, 04:45 PM',
      description: 'A minor vulnerability was disclosed for a widely used WordPress plugin. Patch is available.',
      indicators: ['CVE-2024-1234']
    }
  ];

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical': return <ShieldAlert size={18} color="var(--color-danger)" />;
      case 'High': return <AlertTriangle size={18} color="#f97316" />;
      case 'Medium': return <AlertCircle size={18} color="var(--color-warning)" />;
      case 'Low': return <Info size={18} color="var(--color-primary)" />;
      default: return <Info size={18} />;
    }
  };

  const getSeverityBadge = (severity) => {
    let bg = '';
    let color = '';
    switch (severity) {
      case 'Critical': bg = 'var(--color-danger-light)'; color = 'var(--color-danger)'; break;
      case 'High': bg = '#ffedd5'; color = '#f97316'; break;
      case 'Medium': bg = 'var(--color-warning-light)'; color = 'var(--color-warning)'; break;
      case 'Low': bg = 'var(--color-primary-light)'; color = 'var(--color-primary)'; break;
      default: bg = 'var(--bg-sidebar)'; color = 'var(--text-light)'; break;
    }
    return (
      <span style={{ 
        backgroundColor: bg, color, 
        padding: '4px 10px', borderRadius: '9999px', 
        fontSize: '12px', fontWeight: '600', 
        display: 'inline-flex', alignItems: 'center', gap: '6px'
      }}>
        {getSeverityIcon(severity)} {severity}
      </span>
    );
  };

  const filteredThreats = threats.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || t.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Threat Intelligence Feed</h1>
          <p>Real-time updates on active global cyber threats and vulnerabilities.</p>
        </div>
      </div>

      <div className="saas-card" style={{ marginBottom: '24px' }}>
        <div className="table-toolbar">
          <div className="table-filters" style={{ flex: 1, maxWidth: '400px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-light)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search threats, indicators..." 
                style={{ paddingLeft: '38px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              className="form-control" 
              style={{ width: '150px' }}
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <Button variant="outline" icon={Filter}>Filter</Button>
          </div>
        </div>

        {filteredThreats.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredThreats.map(threat => (
              <div 
                key={threat.id} 
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                className="threat-card-hover"
                onClick={() => setSelectedThreat(threat)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    {getSeverityBadge(threat.severity)}
                    <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '500' }}>{threat.category}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>•</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>{threat.date}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{threat.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '800px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {threat.description}
                  </p>
                </div>
                <div style={{ paddingLeft: '16px' }}>
                  <Button variant="ghost" icon={ArrowRight} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><ShieldAlert size={32} /></div>
            <h3>No Threats Found</h3>
            <p>No threat intelligence matches your current search or filters.</p>
          </div>
        )}
      </div>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Threat Intelligence Report</h2>
              <button onClick={() => setSelectedThreat(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {getSeverityBadge(selectedThreat.severity)}
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-light)' }}>ID: {selectedThreat.id}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>•</span>
                <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>{selectedThreat.date}</span>
              </div>
              
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>
                {selectedThreat.title}
              </h3>
              
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>Description</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{selectedThreat.description}</p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>Indicators of Compromise (IoCs)</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedThreat.indicators.map((ioc, idx) => (
                    <span key={idx} style={{ 
                      backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-muted)', 
                      padding: '6px 12px', borderRadius: '6px', 
                      fontSize: '13px', fontFamily: 'monospace' 
                    }}>
                      {ioc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setSelectedThreat(null)}>Close</Button>
              <Button variant="primary">Create Campaign from Threat</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .threat-card-hover:hover {
          border-color: var(--border-hover) !important;
          background-color: var(--bg-main) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default ThreatFeed;
