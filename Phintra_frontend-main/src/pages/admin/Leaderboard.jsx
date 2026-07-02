import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Trophy, ShieldAlert, Award, Star, Zap, Building2, Flame } from 'lucide-react';

const AdminLeaderboard = () => {
  const { leaderboard } = useAppContext();

  // Hardcoded best departments ranking list
  const departmentRankings = [
    { rank: 1, name: 'Engineering', score: 92, status: 'Outstanding' },
    { rank: 2, name: 'Finance', score: 88, status: 'Good' },
    { rank: 3, name: 'Sales', score: 70, status: 'Fair' },
    { rank: 4, name: 'Operations', score: 62, status: 'Fair' },
    { rank: 5, name: 'HR', score: 58, status: 'Needs Improvement' },
    { rank: 6, name: 'Marketing', score: 45, status: 'At Risk' }
  ];

  // Map text badges to professional Lucide icons
  const renderBadgeIcon = (badgeName) => {
    switch (badgeName) {
      case 'Security Champion':
        return (
          <div key={badgeName} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-hover)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }} title="Scored 90%+ on all quizzes">
            <Award size={12} />
            Champion
          </div>
        );
      case 'Zero Click':
        return (
          <div key={badgeName} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-success-light)', color: '#065f46', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }} title="Passed last 3 simulations without a single click">
            <Star size={12} />
            Zero Click
          </div>
        );
      case 'Top Reporter':
        return (
          <div key={badgeName} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-teal-light)', color: 'var(--color-teal-hover)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }} title="Successfully flagged 3+ threats">
            <Zap size={12} />
            Reporter
          </div>
        );
      case 'Perfect Month':
        return (
          <div key={badgeName} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-warning-light)', color: '#92400e', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }} title="Perfect simulation record for 30 consecutive days">
            <Flame size={12} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
            Perfect
          </div>
        );
      default:
        return (
          <div key={badgeName} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}>
            {badgeName}
          </div>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Security Leaderboard</h1>
          <p>Recognize employee achievements, identify security champions, and audit department standings.</p>
        </div>
      </div>

      {/* Main Grid: Employee Rankings + Department Rankings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }} className="responsive-leaderboard-grid">
        
        {/* Column 1: Top 10 Employees */}
        <div className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Trophy size={20} style={{ color: 'var(--color-warning)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Individual Top 10 Employees</h3>
          </div>

          <div className="saas-table-container" style={{ margin: 0 }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Security Score</th>
                  <th>Earned Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 10).map((emp, idx) => {
                  const isTop3 = idx < 3;
                  const rankBgColor = idx === 0 ? 'var(--color-warning-light)' : idx === 1 ? 'var(--bg-sidebar)' : idx === 2 ? '#fff7ed' : 'transparent';
                  const rankTxtColor = idx === 0 ? '#b45309' : idx === 1 ? 'var(--text-muted)' : idx === 2 ? '#c2410c' : 'var(--text-light)';
                  
                  return (
                    <tr key={emp.name}>
                      <td>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: rankBgColor,
                          color: rankTxtColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '13px'
                        }}>
                          {idx + 1}
                        </div>
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{emp.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{emp.department}</td>
                      <td>
                        <strong style={{ color: emp.securityScore >= 90 ? 'var(--color-success)' : 'var(--color-warning)', fontSize: '15px' }}>
                          {emp.securityScore}
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {emp.badges && emp.badges.length > 0 ? (
                            emp.badges.map(badge => renderBadgeIcon(badge))
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Department-wise Ranking */}
        <div className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Building2 size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Department Standing</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {departmentRankings.map((dept, idx) => {
              const barColor = dept.score >= 80 ? 'var(--color-success)' : dept.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
              return (
                <div key={dept.name} style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-card)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-light)' }}>#{idx+1}</span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{dept.name}</strong>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: barColor }}>{dept.score}</span>
                  </div>

                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: `${dept.score}%`, height: '100%', backgroundColor: barColor }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: 'var(--text-subtle)' }}>Standing:</span>
                    <span style={{ fontWeight: '600', color: barColor }}>{dept.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 991px) {
          .responsive-leaderboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default AdminLeaderboard;
