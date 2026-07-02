import React from 'react';
import { ShieldCheck, Target, TrendingUp, AlertOctagon, Mail, ShieldAlert, AlertTriangle } from 'lucide-react';
import { 
   LineChart, Line, BarChart, Bar, XAxis, YAxis, 
   CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ManagerDashboard = () => {
  const securityTrend = [
    { week: 'W1', score: 72 },
    { week: 'W2', score: 75 },
    { week: 'W3', score: 78 },
    { week: 'W4', score: 84 }
  ];

  const threatAlerts = [
    { title: 'Credential Spoofing Lure', priority: 'High', detected: '2 hrs ago', count: 12 },
    { title: 'Suspicious Invoice Attachment', priority: 'Medium', detected: '5 hrs ago', count: 4 },
    { title: 'Urgent Password Verification Notice', priority: 'High', detected: 'Yesterday', count: 18 }
  ];

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Security Manager Console</h1>
          <p>Read-only audit summaries, vulnerability reports, and campaign analytics monitoring.</p>
        </div>
      </div>

      {/* Role Notice */}
      <div className="saas-card" style={{
        backgroundColor: 'var(--color-primary-light)',
        borderColor: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px',
        padding: '16px 20px'
      }}>
        <ShieldCheck color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
          <strong>Manager Role Active:</strong> You have viewing permissions for security dashboards and active reported threats. System configuration modifications (Settings, User Management, and Roles Permissions) require <strong>Security Administrator</strong> level access.
        </div>
      </div>

      {/* Highlights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Overall Department Risk</span>
            <div style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)', padding: '8px', borderRadius: '8px' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-main)' }}>Moderate (38/100)</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
            Calculated from active simulations
          </span>
        </div>

        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Training Compliance Score</span>
            <div style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', padding: '8px', borderRadius: '8px' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-main)' }}>84.8% Completed</h2>
          <span style={{ fontSize: '11px', color: 'var(--color-success)', display: 'block', marginTop: '4px' }}>
            +2.3% improvement from Q1
          </span>
        </div>

        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Reported Phishing Emails</span>
            <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '8px', borderRadius: '8px' }}>
              <Mail size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-main)' }}>34 Alerts Logged</h2>
          <span style={{ fontSize: '11px', color: 'var(--color-primary)', display: 'block', marginTop: '4px' }}>
            12 flagged simulations this month
          </span>
        </div>
      </div>

      {/* Main Charts & Alert Table */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }} className="responsive-chart-grid">
        
        {/* Compliance Trend Chart */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Security Rating Weekly Trend</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={securityTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="week" style={{ fontSize: '11px' }} />
                <YAxis domain={[50, 100]} style={{ fontSize: '11px' }} />
                <Tooltip />
                <Line type="monotone" name="Security Score" dataKey="score" stroke="var(--color-teal)" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Alerts Table */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Threat Logs Summary</h3>
          <div className="saas-table-container" style={{ margin: 0, border: 'none', boxShadow: 'none', flex: 1 }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Vulnerability Source</th>
                  <th>Level</th>
                  <th>Spotted</th>
                  <th style={{ textAlign: 'center' }}>Hits</th>
                </tr>
              </thead>
              <tbody>
                {threatAlerts.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600' }}>{log.title}</td>
                    <td>
                      <span className={`badge ${log.priority === 'High' ? 'badge-failed' : 'badge-warning'}`}>
                        {log.priority}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-light)' }}>{log.detected}</td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{log.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 991px) {
          .responsive-chart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ManagerDashboard;
