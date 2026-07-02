import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Calendar, Download, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import Button from '../../components/common/Button';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [showExportToast, setShowExportToast] = useState(false);

  // Simulated metrics datasets
  const campaignSuccessRate = [
    { name: 'Campaign 1', rate: 74 },
    { name: 'Campaign 2', rate: 82 },
    { name: 'Campaign 3', rate: 85 },
    { name: 'Campaign 4', rate: 90 },
    { name: 'Campaign 5', rate: 92 }
  ];

  const departmentRisk = [
    { dept: 'Marketing', risk: 64, benchmark: 20 },
    { dept: 'HR', risk: 48, benchmark: 20 },
    { dept: 'Sales', risk: 45, benchmark: 20 },
    { dept: 'Operations', risk: 39, benchmark: 20 },
    { dept: 'Finance', risk: 18, benchmark: 20 },
    { dept: 'Engineering', risk: 12, benchmark: 20 }
  ];

  const monthlyTrainingProgress = [
    { month: 'Jan', completed: 45, enrolled: 80 },
    { month: 'Feb', completed: 60, enrolled: 95 },
    { month: 'Mar', completed: 78, enrolled: 110 },
    { month: 'Apr', completed: 92, enrolled: 125 },
    { month: 'May', completed: 115, enrolled: 140 }
  ];

  const departmentCompletion = [
    { name: 'Finance', value: 88 },
    { name: 'Engineering', value: 92 },
    { name: 'Marketing', value: 45 },
    { name: 'HR', value: 58 },
    { name: 'Operations', value: 62 },
    { name: 'Sales', value: 70 }
  ];

  const handleExport = () => {
    setShowExportToast(true);
    setTimeout(() => {
      setShowExportToast(false);
    }, 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Analytics & Reports</h1>
          <p>Examine comprehensive organizational performance metrics, drill down by department risk, and export compliance logs.</p>
        </div>

        {/* Date Selector and Export */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px' }}>
            <Calendar size={14} style={{ color: 'var(--text-light)' }} />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '500' }}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <Button onClick={handleExport} variant="primary" size="sm" icon={Download}>
            Export CSV Log
          </Button>
        </div>
      </div>

      {/* Export Toast Notification */}
      {showExportToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--text-main)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Compliance Report CSV downloaded successfully!</span>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }} className="responsive-analytics-grid">
        
        {/* Chart 1: Campaign Success Rate */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
            Campaign Success Rates (Click Avoidance %)
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={campaignSuccessRate} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="name" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <YAxis domain={[0, 100]} unit="%" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <Tooltip />
                <Line type="monotone" name="Success Rate" dataKey="rate" stroke="var(--color-teal)" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Dept risk comparison */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} style={{ color: 'var(--color-danger)' }} />
            Department Risk Indices vs Compliance Target
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentRisk} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="dept" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <YAxis unit="/100" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <Tooltip />
                <Legend iconType="circle" style={{ fontSize: '11px' }} />
                <Bar name="Active Risk Index" dataKey="risk" fill="var(--color-cyan)" radius={[4, 4, 0, 0]} />
                <Bar name="Compliance Threshold" dataKey="benchmark" fill="var(--border-hover)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly training progress */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
            Cumulative Training Engagement
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrainingProgress} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <YAxis tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <Tooltip />
                <Legend iconType="circle" style={{ fontSize: '11px' }} />
                <Area type="monotone" name="Completed Courses" dataKey="completed" stroke="var(--color-primary)" fillOpacity={0.1} fill="var(--color-primary)" />
                <Area type="monotone" name="Total Enrolls" dataKey="enrolled" stroke="var(--text-subtle)" fillOpacity={0.03} fill="var(--text-subtle)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Overall completion by dept */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
            Core Training Completion Rate by Department (%)
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentCompletion} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="name" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <YAxis unit="%" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <Tooltip />
                <Bar name="Completion Rate" dataKey="value" fill="var(--color-teal)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .responsive-analytics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAnalytics;
