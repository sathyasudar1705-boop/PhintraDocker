import React, { useState } from 'react';
import Button from '../../components/common/Button';
import {
  Brain, Download, ShieldAlert, TrendingDown, Users, BookOpen,
  AlertTriangle, CheckCircle2, ArrowRight, Eye, Info,
  Activity, BarChart3, X
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// -- Dummy Data --
const aiOverviewCards = [
  { title: 'Overall AI Risk Score', value: '34', unit: '/ 100', change: '-8% from last month', trend: 'positive', icon: Brain, color: 'var(--color-primary)', bgColor: 'var(--color-primary-light)' },
  { title: 'Predicted Failure Rate', value: '18.5', unit: '%', change: '+2.1% predicted next month', trend: 'negative', icon: TrendingDown, color: 'var(--color-danger)', bgColor: 'var(--color-danger-light)' },
  { title: 'High Risk Users', value: '12', unit: 'users', change: '3 new since last week', trend: 'negative', icon: Users, color: 'var(--color-warning)', bgColor: 'var(--color-warning-light)' },
  { title: 'Training Gap', value: '23', unit: '%', change: 'Down from 31% last quarter', trend: 'positive', icon: BookOpen, color: 'var(--color-success)', bgColor: 'var(--color-success-light)' }
];

const riskTrendData = [
  { month: 'Jan', actual: 42, predicted: 42 },
  { month: 'Feb', actual: 38, predicted: 39 },
  { month: 'Mar', actual: 45, predicted: 43 },
  { month: 'Apr', actual: 36, predicted: 37 },
  { month: 'May', actual: 34, predicted: 35 },
  { month: 'Jun', actual: null, predicted: 31 },
  { month: 'Jul', actual: null, predicted: 28 },
  { month: 'Aug', actual: null, predicted: 26 },
  { month: 'Sep', actual: null, predicted: 24 },
  { month: 'Oct', actual: null, predicted: 22 },
  { month: 'Nov', actual: null, predicted: 20 }
];

const departmentRiskData = [
  { department: 'Finance', risk: 62, color: 'var(--color-primary)' },
  { department: 'HR', risk: 54, color: 'var(--color-cyan)' },
  { department: 'Sales', risk: 47, color: 'var(--color-cyan)' },
  { department: 'IT', risk: 18, color: 'var(--color-teal)' },
  { department: 'Operations', risk: 39, color: 'var(--color-cyan)' }
];

const recommendations = [
  { id: 1, priority: 'High', title: 'Assign advanced phishing training to high-risk users', description: '12 users in Finance and HR departments show repeated simulation failures. Targeted BEC and spear phishing modules recommended.', icon: ShieldAlert, color: 'var(--color-danger)', bgColor: 'var(--color-danger-light)' },
  { id: 2, priority: 'High', title: 'Launch targeted simulation for Finance and HR', description: 'These departments show 62% and 54% AI risk scores respectively. A focused credential-harvesting simulation is recommended.', icon: Activity, color: 'var(--color-danger)', bgColor: 'var(--color-danger-light)' },
  { id: 3, priority: 'Medium', title: 'Review repeated failed simulation users', description: '8 employees have failed 3 or more simulations consecutively. Individual coaching sessions are recommended.', icon: Users, color: 'var(--color-warning)', bgColor: 'var(--color-warning-light)' },
  { id: 4, priority: 'Medium', title: 'Send awareness reminders to medium-risk users', description: '24 users in the medium-risk category have not completed assigned training modules within the deadline.', icon: AlertTriangle, color: 'var(--color-warning)', bgColor: 'var(--color-warning-light)' },
  { id: 5, priority: 'Low', title: 'Improve reporting practice for low-reporting departments', description: 'Sales and Operations departments have the lowest suspicious email reporting rates. Encourage use of the report button.', icon: BarChart3, color: 'var(--color-primary)', bgColor: 'var(--color-primary-light)' }
];

const highRiskUsers = [
  { id: 1, name: 'Maria Rodriguez', department: 'Marketing', riskScore: 82, lastResult: 'Failed', recommendedAction: 'Mandatory BEC training' },
  { id: 2, name: 'Tom Bradley', department: 'Operations', riskScore: 78, lastResult: 'Failed', recommendedAction: 'Phishing awareness refresher' },
  { id: 3, name: 'Amy Johnson', department: 'Marketing', riskScore: 74, lastResult: 'Failed', recommendedAction: 'Social engineering module' },
  { id: 4, name: 'David Kim', department: 'HR', riskScore: 68, lastResult: 'Clicked', recommendedAction: 'Credential theft training' },
  { id: 5, name: 'Nina Patel', department: 'HR', riskScore: 65, lastResult: 'Clicked', recommendedAction: 'Urgency tactics module' },
  { id: 6, name: 'Mark Davis', department: 'Sales', riskScore: 61, lastResult: 'Clicked', recommendedAction: 'Link verification training' }
];

const smartAlerts = [
  { id: 1, severity: 'High', title: 'Unusual click pattern detected in Finance department', description: 'AI detected a 34% increase in simulation link clicks from Finance users over the past 2 weeks, indicating declining awareness.', time: '2 hours ago', icon: AlertTriangle, color: 'var(--color-danger)', bgColor: 'var(--color-danger-light)' },
  { id: 2, severity: 'Medium', title: 'Low training completion detected in Sales department', description: 'Only 42% of Sales employees have completed their assigned Q2 training modules. Deadline is approaching in 5 days.', time: '6 hours ago', icon: BookOpen, color: 'var(--color-warning)', bgColor: 'var(--color-warning-light)' },
  { id: 3, severity: 'High', title: 'Repeated phishing failures found among selected users', description: '8 employees across 3 departments have failed 3 or more consecutive phishing simulations. Escalation recommended.', time: '1 day ago', icon: ShieldAlert, color: 'var(--color-danger)', bgColor: 'var(--color-danger-light)' },
  { id: 4, severity: 'Low', title: 'Sudden increase in suspicious email reports this month', description: 'Reported emails increased by 45% this month. AI analysis shows 78% were legitimate threats, indicating improved awareness.', time: '2 days ago', icon: CheckCircle2, color: 'var(--color-success)', bgColor: 'var(--color-success-light)' }
];

const aiSummary = "AI analysis indicates that Finance and HR departments currently show elevated phishing risk due to repeated simulation failures and incomplete training. The system recommends targeted training, campaign retesting, manager-level awareness alerts, and continuous monitoring for high-risk users. Overall organizational risk has decreased by 8% month-over-month, driven by improved Engineering and IT department performance. Continued focus on the 12 identified high-risk users and the two underperforming departments is essential to maintain this positive trajectory.";

// -- Component --
const AIAnalytics = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportReport = () => {
    setExportLoading(true);
    setTimeout(() => {
      setExportLoading(false);
      showToast('AI Security Report exported successfully. Check your downloads.', 'success');
    }, 1500);
  };

  const handleViewDetails = (user) => {
    setDetailModal(user);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  const getResultBadgeClass = (result) => {
    switch (result) {
      case 'Failed': return 'badge-high';
      case 'Clicked': return 'badge-medium';
      case 'Passed': return 'badge-low';
      case 'Reported': return 'badge-reported';
      default: return 'badge-medium';
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          backgroundColor: toast.type === 'success' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
          color: toast.type === 'success' ? 'var(--color-success-hover)' : 'var(--color-danger)',
          border: `1px solid ${toast.type === 'success' ? 'var(--color-success-light)' : 'var(--color-danger-light)'}`,
          padding: '14px 20px', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '14px', fontWeight: '550',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle2 size={18} />
          {toast.message}
        </div>
      )}

      {/* 1. Page Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>AI Security Intelligence</h1>
          <p>AI-powered analysis for phishing risk, user behavior, campaign performance, and training gaps.</p>
        </div>
        <Button
          variant="primary"
          icon={Download}
          loading={exportLoading}
          onClick={handleExportReport}
        >
          Export AI Report
        </Button>
      </div>

      {/* 2. AI Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }} className="responsive-ai-cards-grid">
        {aiOverviewCards.map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <div key={idx} className="saas-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  backgroundColor: card.bgColor, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <CardIcon size={22} style={{ color: card.color }} />
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  color: card.trend === 'positive' ? 'var(--color-success-hover)' : 'var(--color-danger)',
                  backgroundColor: card.trend === 'positive' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                  padding: '3px 8px', borderRadius: '9999px'
                }}>
                  {card.change}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.title}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1 }}>{card.value}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-subtle)', fontWeight: '500' }}>{card.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 & 4. Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }} className="responsive-ai-charts-grid">
        {/* AI Risk Prediction Trend */}
        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} style={{ color: 'var(--color-primary)' }} />
              AI Risk Prediction Trend
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-light)', backgroundColor: 'var(--bg-sidebar)', padding: '4px 10px', borderRadius: '9999px', fontWeight: '500' }}>
              Forecast: Next 6 months
            </span>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <YAxis domain={[0, 60]} tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" name="Actual Risk" dataKey="actual" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} />
                <Line type="monotone" name="AI Predicted" dataKey="predicted" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--bg-sidebar)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-light)' }}>
              <div style={{ width: '16px', height: '3px', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }} />
              Actual Risk Score
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-light)' }}>
              <div style={{ width: '16px', height: '3px', backgroundColor: 'var(--color-warning)', borderRadius: '2px', borderTop: '1px dashed var(--color-warning)' }} />
              AI Prediction
            </div>
          </div>
        </div>

        {/* Department Risk Analysis */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} />
            Department Risk Analysis
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentRiskData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="department" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <YAxis domain={[0, 80]} tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value) => [`${value}%`, 'AI Risk Score']}
                />
                <Bar dataKey="risk" name="AI Risk Score" radius={[6, 6, 0, 0]} barSize={40}>
                  {departmentRiskData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. AI Recommended Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />
          AI Recommended Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.map((rec) => {
            const RecIcon = rec.icon;
            return (
              <div key={rec.id} className="saas-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px',
                  backgroundColor: rec.bgColor, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <RecIcon size={20} style={{ color: rec.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{rec.title}</h4>
                    <span className={`badge ${getPriorityBadgeClass(rec.priority)}`} style={{ fontSize: '11px' }}>{rec.priority}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.5' }}>{rec.description}</p>
                </div>
                <Button variant="ghost" size="sm" icon={ArrowRight} style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. High Risk Users Table */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} style={{ color: 'var(--color-danger)' }} />
          High Risk Users
        </h3>
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>AI Risk Score</th>
                <th>Last Simulation</th>
                <th>Recommended Action</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskUsers.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{user.name}</td>
                  <td>{user.department}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '48px', height: '6px', backgroundColor: 'var(--bg-sidebar)',
                        borderRadius: '3px', overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${user.riskScore}%`, height: '100%',
                          backgroundColor: user.riskScore >= 70 ? 'var(--color-danger)' : user.riskScore >= 50 ? 'var(--color-warning)' : 'var(--color-success)',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: user.riskScore >= 70 ? 'var(--color-danger)' : 'var(--color-warning)' }}>{user.riskScore}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getResultBadgeClass(user.lastResult)}`}>{user.lastResult}</span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-light)' }}>{user.recommendedAction}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Button variant="outline" size="sm" icon={Eye} onClick={() => handleViewDetails(user)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Smart Alerts Panel */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
          Smart Alerts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="responsive-ai-alerts-grid">
          {smartAlerts.map((alert) => {
            const AlertIcon = alert.icon;
            return (
              <div key={alert.id} className="saas-card" style={{ padding: '18px 20px', borderLeft: `3px solid ${alert.color}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    backgroundColor: alert.bgColor, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <AlertIcon size={18} style={{ color: alert.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge ${getPriorityBadgeClass(alert.severity)}`} style={{ fontSize: '10px' }}>{alert.severity}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{alert.time}</span>
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px', lineHeight: '1.4' }}>{alert.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.5' }}>{alert.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. AI Generated Summary */}
      <div className="saas-card" style={{
        padding: '24px',
        borderLeft: '4px solid var(--color-primary)',
        background: 'linear-gradient(135deg, #ffffff 0%, var(--bg-main) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: 'var(--color-primary-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Brain size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>AI Generated Summary</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Generated at {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          {aiSummary}
        </p>
      </div>

      {/* User Detail Modal */}
      {detailModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>User Risk Profile</h2>
              <button onClick={() => setDetailModal(null)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  backgroundColor: 'var(--color-danger-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: '700', color: 'var(--color-danger)'
                }}>
                  {detailModal.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{detailModal.name}</h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>{detailModal.department} Department</span>
                </div>
              </div>

              <div className="modal-grid-2col" style={{ gap: '16px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '14px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600' }}>AI RISK SCORE</span>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-danger)', marginTop: '4px' }}>{detailModal.riskScore}</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '14px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600' }}>LAST RESULT</span>
                  <div style={{ marginTop: '8px' }}>
                    <span className={`badge ${getResultBadgeClass(detailModal.lastResult)}`}>{detailModal.lastResult}</span>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', padding: '16px', border: '1px solid #dbeafe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Info size={14} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--color-primary-hover)', fontWeight: '600' }}>RECOMMENDED ACTION</span>
                </div>
                <p style={{ fontSize: '14px', color: '#1e3a5f', lineHeight: '1.5' }}>{detailModal.recommendedAction}</p>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setDetailModal(null)}>Close</Button>
              <Button variant="primary" icon={ArrowRight}>Assign Training</Button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 991px) {
          .responsive-ai-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .responsive-ai-charts-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-ai-alerts-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 576px) {
          .responsive-ai-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AIAnalytics;
