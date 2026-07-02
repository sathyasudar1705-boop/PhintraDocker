import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Users, Award, BookOpen, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Button from '../../components/common/Button';
import api from '../../services/api';

const DEPT_PERFORMANCE = [
  { name: 'Engineering', completion: 95, score: 91 },
  { name: 'Finance', completion: 89, score: 85 },
  { name: 'HR', completion: 92, score: 87 },
  { name: 'Marketing', completion: 74, score: 71 },
  { name: 'Sales', completion: 61, score: 64 }
];

const LURE_DISTRIBUTION = [
  { name: 'Credential Harvesting', value: 45, color: 'var(--color-primary)' },
  { name: 'Urgent Attachments', value: 30, color: 'var(--color-cyan)' },
  { name: 'Authority Impersonation', value: 25, color: 'var(--color-teal)' }
];

const TRENDS = [
  { month: 'Jan', clicks: 42, reports: 15 },
  { month: 'Feb', clicks: 35, reports: 19 },
  { month: 'Mar', clicks: 28, reports: 24 },
  { month: 'Apr', clicks: 20, reports: 31 },
  { month: 'May', clicks: 12, reports: 38 }
];

const HIGH_RISK_DEPT = [
  { name: 'Sales Operations', risk: 'High', clicks: 19, advice: 'Assign urgent micro-learning templates focusing on authority fraud.' },
  { name: 'Marketing & Events', risk: 'Medium', clicks: 11, advice: 'Schedule landing-page identification quizzes.' },
  { name: 'Finance Administration', risk: 'Low', clicks: 3, advice: 'Routine refresh training for general ledger workflows.' }
];

const AwarenessInsights = () => {
  const toast = useToast();
  const [insights, setInsights] = useState({
    overallCompletion: '82.2%',
    avgQuizRating: '85.4/100',
    phishClickRate: '14.8%',
    empoweredEmployees: '946 / 1.1k',
    deptPerformance: DEPT_PERFORMANCE,
    lureDistribution: LURE_DISTRIBUTION,
    trends: TRENDS,
    highRiskDept: HIGH_RISK_DEPT
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/insights');
        if (active && res.data) {
          setInsights(res.data);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
        toast.error('Failed to load real-time analytics. Showing cached data.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchInsights();
    return () => {
      active = false;
    };
  }, []);

  const handleExport = () => {
    toast.info('Generating Educational PDF Report...');
  };

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Awareness Insights</h1>
          <p>Analyze organization-wide educational simulation success metrics, quizzes, and risk mitigation trends.</p>
        </div>
        <div>
          <Button variant="primary" icon={Download} onClick={handleExport}>
            Export Insights
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Overall Course Completion</span>
            <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '8px', borderRadius: '8px' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800' }}>{insights.overallCompletion}</h2>
            <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '500', marginTop: '4px' }}>
              <ArrowUpRight size={14} /> +4.1% this month
            </span>
          </div>
        </div>

        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Average Quiz Rating</span>
            <div style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', padding: '8px', borderRadius: '8px' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800' }}>{insights.avgQuizRating}</h2>
            <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '500', marginTop: '4px' }}>
              <ArrowUpRight size={14} /> +2.5 pts compared to Q1
            </span>
          </div>
        </div>

        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Simulated Phish Click Rate</span>
            <div style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '8px', borderRadius: '8px' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800' }}>{insights.phishClickRate}</h2>
            <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '500', marginTop: '4px' }}>
              &darr; 3.2% decline in clicks (Good)
            </span>
          </div>
        </div>

        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Empowered Employees</span>
            <div style={{ backgroundColor: 'var(--color-teal-light)', color: 'var(--color-teal)', padding: '8px', borderRadius: '8px' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800' }}>{insights.empoweredEmployees}</h2>
            <span style={{ fontSize: '12px', color: 'var(--color-teal)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '500', marginTop: '4px' }}>
              Completed basic training
            </span>
          </div>
        </div>
      </div>

      {/* Chart Grids */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }} className="responsive-chart-grid">
        
        {/* completion by dept bar chart */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Completion Rate vs Quiz Score by Dept</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.deptPerformance} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="name" style={{ fontSize: '11px' }} />
                <YAxis style={{ fontSize: '11px' }} />
                <Tooltip />
                <Legend iconType="circle" style={{ fontSize: '12px' }} />
                <Bar dataKey="completion" fill="var(--color-primary)" name="Completion Rate %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="score" fill="var(--color-teal)" name="Avg Quiz Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trends lines chart */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Clicks vs Reported Email Trends (Monthly)</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights.trends} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="month" style={{ fontSize: '11px' }} />
                <YAxis style={{ fontSize: '11px' }} />
                <Tooltip />
                <Legend iconType="circle" style={{ fontSize: '12px' }} />
                <Line type="monotone" name="Clicked Lures" dataKey="clicks" stroke="var(--color-danger)" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" name="Reported Emails" dataKey="reports" stroke="var(--color-success)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lure Category Pie and Risk list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }} className="responsive-chart-grid">
        
        {/* Lure types Distribution Pie Chart */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Phishing Category Lure Click Distribution</h3>
          <div style={{ height: '240px', flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insights.lureDistribution}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {insights.lureDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" style={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Risk Departments Recommendation Table */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Targeted Educational Recommendations</h3>
          <div className="saas-table-container" style={{ margin: 0, border: 'none', boxShadow: 'none', flex: 1 }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Risk Tier</th>
                  <th style={{ textAlign: 'center' }}>Clicks</th>
                  <th>Remediation Advice</th>
                </tr>
              </thead>
              <tbody>
                {insights.highRiskDept.map((dept, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600' }}>{dept.name}</td>
                    <td>
                      <span className={`badge ${
                        dept.risk === 'High' ? 'badge-failed' : dept.risk === 'Medium' ? 'badge-warning' : 'badge-passed'
                      }`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {dept.risk} Risk
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{dept.clicks}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-light)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dept.advice}
                    </td>
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

export default AwarenessInsights;
