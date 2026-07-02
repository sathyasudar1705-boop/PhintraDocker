import React from 'react';
import { useToast } from '../../hooks/useToast';
import { ShieldCheck, Target, TrendingUp, AlertOctagon, Download, BrainCircuit, ShieldAlert, ArrowUpRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const ExecutiveDashboard = () => {
  const toast = useToast();
  const riskOverview = [
    { name: 'Low Risk', value: 45, color: 'var(--color-teal)' },
    { name: 'Medium Risk', value: 35, color: 'var(--color-cyan)' },
    { name: 'High Risk', value: 20, color: 'var(--color-primary)' }
  ];

  const deptComparison = [
    { name: 'Engineering', score: 92 },
    { name: 'Finance', score: 85 },
    { name: 'HR', score: 78 },
    { name: 'Marketing', score: 64 },
    { name: 'Sales', score: 55 }
  ];

  const trendData = [
    { month: 'Jan', maturity: 45, incidents: 12 },
    { month: 'Feb', maturity: 52, incidents: 9 },
    { month: 'Mar', maturity: 58, incidents: 10 },
    { month: 'Apr', maturity: 67, incidents: 6 },
    { month: 'May', maturity: 78, incidents: 3 }
  ];

  const handleExport = () => {
    // In a real app, this would generate a PDF or CSV
    toast.info('Exporting Executive Report...');
  };

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Executive Dashboard</h1>
          <p>High-level organizational security posture and strategic metrics.</p>
        </div>
        <div>
          <Button variant="primary" icon={Download} onClick={handleExport}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Top Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: '600' }}>Overall Security Posture</span>
            <div style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', padding: '10px', borderRadius: '10px' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-main)' }}>A-</h2>
            <span style={{ fontSize: '13px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500', marginTop: '4px' }}>
              <ArrowUpRight size={16} /> Improved from B+ last quarter
            </span>
          </div>
        </div>

        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: '600' }}>AI Executive Summary</span>
            <div style={{ backgroundColor: '#f3e8ff', color: '#8b5cf6', padding: '10px', borderRadius: '10px' }}>
              <BrainCircuit size={20} />
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <p><strong>Status:</strong> Stable.</p>
            <p style={{ marginTop: '8px' }}>Sales and Marketing departments require immediate phishing remediation. Technical departments show strong resilience.</p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }} className="responsive-chart-grid">

        {/* Risk Distribution */}
        <div className="saas-card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Risk Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskOverview}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskOverview.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Comparison */}
        <div className="saas-card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Department Security Scores</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptComparison} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--bg-sidebar)" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="score" fill="var(--color-primary)" radius={[0, 4, 4, 0]}>
                  {deptComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score < 70 ? 'var(--color-primary)' : entry.score < 85 ? 'var(--color-cyan)' : 'var(--color-teal)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Trend */}
      <div className="saas-card">
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Maturity vs Incidents Trend</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
              <XAxis dataKey="month" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="left" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="right" orientation="right" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend iconType="circle" />
              <Line yAxisId="left" type="monotone" name="Maturity Score" dataKey="maturity" stroke="var(--color-teal)" strokeWidth={3} />
              <Line yAxisId="right" type="monotone" name="Security Incidents" dataKey="incidents" stroke="var(--color-cyan)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
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

export default ExecutiveDashboard;
