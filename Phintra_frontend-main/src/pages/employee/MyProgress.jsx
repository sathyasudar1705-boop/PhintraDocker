import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Award, ThumbsUp, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

const UserProgress = () => {
  const { currentUser, trainingModules, certificates } = useAppContext();

  // Personal simulated historical data
  const scoreTrend = [
    { month: 'Jan', score: 68 },
    { month: 'Feb', score: 72 },
    { month: 'Mar', score: 80 },
    { month: 'Apr', score: 84 },
    { month: 'May', score: currentUser.securityScore || 80 }
  ];

  // Quiz attempts history from database
  const quizHistory = currentUser.quiz_results || [];

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>My Security Progress</h1>
          <p>Inspect your personal security compliance metrics, quiz attempt summaries, and safety rating developments.</p>
        </div>
      </div>

      {/* Top Section: Score Ring + Course Completion Tracker */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '24px',
        marginBottom: '32px'
      }} className="responsive-progress-top">
        
        {/* Visual score gauge */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 24px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600', marginBottom: '16px' }}>Current Security Rating</span>
          
          <div style={{
            position: 'relative',
            width: '130px',
            height: '130px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="65" cy="65" r="54" stroke="var(--border-color)" strokeWidth="8" fill="transparent" />
              <circle cx="65" cy="65" r="54" stroke="var(--color-teal)" strokeWidth="8" fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - currentUser.securityScore/100)}`}
              />
            </svg>
            <div style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span className="gamified-metric score-number" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>{currentUser.securityScore}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px', fontWeight: '600' }}>Grade A</span>
            </div>
          </div>

          <span className="badge badge-reported" style={{ fontSize: '12px', fontWeight: '600' }}>
            Top 15% Rank
          </span>
        </div>

        {/* Completion Progress widget */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px' }}>Training & Certifications Audit</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Stat 1: Core completion */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px' }}>
                  <span>Required Course completion</span>
                  <strong style={{ color: 'var(--text-main)' }}>{currentUser.trainingCompletion}% Completed</strong>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${currentUser.trainingCompletion}%`, height: '100%', backgroundColor: 'var(--color-teal)' }} />
                </div>
              </div>

              {/* Stat 2: Certifications earned */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Certificates Earned</span>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} style={{ color: 'var(--color-warning)' }} />
                    {certificates.length} Certs
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Assigned Courses Remaining</span>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />
                    {trainingModules.filter(m=>!m.isCompleted).length} Modules
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Section: Progress Chart + Quiz history */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '24px',
        alignItems: 'start',
        marginBottom: '32px'
      }} className="responsive-progress-middle">
        
        {/* Trend Area Chart */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
            Security Score Monthly Development
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreTrend} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <YAxis domain={[0, 100]} tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <Tooltip />
                <Area type="monotone" name="Security Score" dataKey="score" stroke="var(--color-primary)" fillOpacity={0.1} fill="var(--color-primary)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz attempts history */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Quiz History Logs</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quizHistory.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-light)', textAlign: 'center', padding: '16px 0' }}>No quiz attempts recorded yet.</p>
            ) : (
              quizHistory.map((q) => (
                <div 
                  key={q.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justify_content: 'space-between', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{q.module_title} Quiz</strong>
                    <span className="gamified-metric score-number" style={{ fontSize: '13px', fontWeight: '700', color: q.passed ? 'var(--color-success)' : 'var(--color-danger)' }}>{q.score}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)' }}>
                    <span>{q.attempted_at ? q.attempted_at.split('T')[0] : 'N/A'}</span>
                    <span style={{ color: q.passed ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: '600' }}>
                      {q.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Bottom Section: Strengths and Improvement areas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px'
      }} className="responsive-progress-bottom">
        
        {/* Card 1: Strengths */}
        <div className="saas-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThumbsUp size={16} style={{ color: 'var(--color-success)' }} />
            Security Strengths
          </h3>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.5' }}>
            <li><strong>Excellent Email Verification:</strong> Zero click rate on Credential Theft simulations.</li>
            <li><strong>Active Reporter Status:</strong> Successfully identified and reported 3 critical threats.</li>
            <li><strong>High Compliance Turnout:</strong> Completed 100% of required micro-training lessons on time.</li>
          </ul>
        </div>

        {/* Card 2: Improvement areas */}
        <div className="saas-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
            Focus Areas for Improvement
          </h3>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.5' }}>
            <li><strong>Urgency Cues Mitigation:</strong> High failure rates inside emotional pressure spear lures.</li>
            <li><strong>Hyperlink Checking:</strong> Ensure you hover over hyperlinks inside unsolicited emails to verify the redirect target domain.</li>
            <li><strong>Social Engineering 101:</strong> Recommended to complete the remaining authority trap modules.</li>
          </ul>
        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .responsive-progress-top, 
          .responsive-progress-middle, 
          .responsive-progress-bottom {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default UserProgress;
