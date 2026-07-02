import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ShieldAlert, CheckCircle2, TrendingUp, HelpCircle, ArrowRight, ShieldCheck, Flame, Zap } from 'lucide-react';
import Button from '../../components/common/Button';
import { securityMaturityData } from '../../data/dummyData';

const SecurityMaturity = () => {
  const [roadmapTasks, setRoadmapTasks] = useState(securityMaturityData.roadmap);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleCompleteTask = (id, title) => {
    setRoadmapTasks(prev => prev.filter(t => t.id !== id));
    triggerToast(`Acknowledged priority roadmap task: "${title}".`);
  };

  // Score levels logic
  const getScoreLevel = (score) => {
    if (score >= 90) return { name: "Advanced / Optimized", color: "var(--color-success)", desc: "Highest preparedness status. Continuous refinement and proactive remediation." };
    if (score >= 70) return { name: "Established / Mature", color: "var(--color-primary)", desc: "Consistent cybersecurity drills, baseline policies active, some localized training gaps." };
    return { name: "Developing / Susceptible", color: "var(--color-warning)", desc: "Initial policy stage. High phishing click rates and poor MFA compliance parameters." };
  };

  const activeLevel = getScoreLevel(securityMaturityData.maturityScore);

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
          <h1>Security Maturity Index</h1>
          <p>Assess administrative compliance benchmarks, evaluate department risk factors, and escalate scores.</p>
        </div>
      </div>

      {/* Grid of Key Info Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
            <TrendingUp size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>OVERALL RATING</span>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>{securityMaturityData.maturityScore}%</h3>
          </div>
        </div>

        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--color-success-hover)', flexShrink: 0 }}>
            <ShieldCheck size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>MATURITY STATUS</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>{securityMaturityData.maturityLevel}</h3>
          </div>
        </div>

        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--color-warning)', flexShrink: 0 }}>
            <ShieldAlert size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>PRIORITY REMEDIES</span>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>{roadmapTasks.length} Pending</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Score Dial & Bar Comparison */}
      <div className="modal-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px', marginBottom: '24px', alignItems: 'start' }}>
        
        {/* Left Card: Concentric progress dial */}
        <div className="saas-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Current Maturity Dial</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {/* SVG Ring Progress */}
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  fill="none" 
                  stroke={activeLevel.color} 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - securityMaturityData.maturityScore / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>{securityMaturityData.maturityScore}%</span>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase' }}>Index Score</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: activeLevel.color }}>{activeLevel.name}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px', lineHeight: '1.5', maxWidth: '280px' }}>
                {activeLevel.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Department Comparison Bar Chart */}
        <div className="saas-card" style={{ padding: '24px', height: '100%', minHeight: '380px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Department Susceptibility Benchmarks</h3>
          
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={securityMaturityData.departmentScores}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--bg-sidebar)" />
                <XAxis type="number" domain={[0, 100]} unit="%" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <YAxis type="category" dataKey="name" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-main)', fontWeight: '600' }} />
                <Tooltip />
                <Legend iconType="circle" style={{ fontSize: '11px' }} />
                <Bar name="Actual Maturity" dataKey="score" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar name="Target Benchmark" dataKey="benchmark" fill="var(--border-hover)" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Roadmap Checklist Section */}
      <div className="saas-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: 'var(--color-warning)' }} />
          Escalation Action Roadmap Checklist
        </h3>

        {roadmapTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-light)' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--color-success)', marginBottom: '12px' }} />
            <h4>Maturity tasks cleared!</h4>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>All priority checkpoints are currently active and compliant.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {roadmapTasks.map(task => (
              <div 
                key={task.id} 
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                    <span style={{
                      backgroundColor: task.priority === 'Critical' ? 'var(--color-danger-light)' : 'var(--color-warning-light)',
                      color: task.priority === 'Critical' ? 'var(--color-danger)' : '#b45309',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}>
                      {task.priority} Priority
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '500' }}>
                      Effort: <strong style={{ color: 'var(--text-main)' }}>{task.effort}</strong>
                    </span>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>{task.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>{task.details}</p>
                </div>

                <button
                  onClick={() => handleCompleteTask(task.id, task.title)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--color-primary)',
                    fontWeight: '600',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="maturity-remedy-btn"
                >
                  <CheckCircle2 size={14} />
                  Mark Checkpoint Complete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Button styling overrides */}
      <style>{`
        .maturity-remedy-btn:hover {
          background-color: var(--color-primary-light) !important;
          border-color: #bfdbfe !important;
        }
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SecurityMaturity;
