import React, { useState, useEffect } from 'react';
import { Award, Shield, Star, CheckCircle, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const BADGES = [
  {
    id: 'phish_finder',
    name: 'Phish Finder',
    requirement: 'Identify all hotspots in Red Flag Spotter.',
    icon: Star,
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-light)'
  },
  {
    id: 'credential_guardian',
    name: 'MFA Shield',
    requirement: 'Acknowledge the Login Intercept awareness guidelines.',
    icon: Shield,
    color: 'var(--color-teal)',
    bg: 'var(--color-teal-light)'
  },
  {
    id: 'weekly_warrior',
    name: 'Challenge Solver',
    requirement: 'Solve your first weekly scenarios challenge question.',
    icon: Zap,
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-light)'
  },
  {
    id: 'zero_clicks',
    name: 'Zero Click Club',
    requirement: 'Acknowledge all 4 courses in the Learning Center.',
    icon: ShieldAlert,
    color: '#ec4899',
    bg: '#fdf2f8'
  }
];

const SecurityJourney = () => {
  const [xp, setXp] = useState(120);
  const [badgesEarned, setBadgesEarned] = useState({});

  useEffect(() => {
    // Dynamic stats check based on local storage states
    const solved1 = localStorage.getItem('challenge_1_solved') === 'true';
    const solved2 = localStorage.getItem('challenge_2_solved') === 'true';
    const challengeXP = (solved1 ? 50 : 0) + (solved2 ? 60 : 0);
    
    // Total XP base
    const baseXP = 120 + challengeXP;
    setXp(baseXP);

    // Badges check
    setBadgesEarned({
      phish_finder: true, // Awarded by default or by playing red flag spotter
      credential_guardian: true,
      weekly_warrior: solved1 || solved2,
      zero_clicks: solved1 && solved2
    });
  }, []);

  const currentLevel = Math.floor(xp / 100);
  const xpInCurrentLevel = xp % 100;

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>My Security Journey</h1>
          <p>Track your compliance score, earned security badges, and recommended learning curriculum.</p>
        </div>
      </div>

      {/* Level Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Progress level indicators */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase' }}>Current Rating Tier</span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Level {currentLevel} Specialist</h2>
            </div>
            <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '12px', borderRadius: '50%' }}>
              <Award size={24} />
            </div>
          </div>

          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ width: `${xpInCurrentLevel}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-light)' }}>
            <span>{xpInCurrentLevel}/100 XP to Level {currentLevel + 1}</span>
            <span>Total: {xp} XP</span>
          </div>
        </div>

        {/* Level Stats highlights */}
        <div className="saas-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--color-teal-light)', color: 'var(--color-teal)', padding: '16px', borderRadius: '50%', flexShrink: 0 }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Vigilance Standing</h3>
            <p style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-teal)', margin: '4px 0 0 0' }}>94%</p>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Safest 10% in company engineering</span>
          </div>
        </div>
      </div>

      {/* Badge Cabinet */}
      <div className="saas-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Badge Cabinet</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            const isEarned = badgesEarned[badge.id];

            return (
              <div 
                key={badge.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '20px 16px',
                  textAlign: 'center',
                  backgroundColor: isEarned ? '#ffffff' : 'var(--bg-main)',
                  opacity: isEarned ? 1 : 0.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                className={isEarned ? 'search-input-hover' : ''}
              >
                <div style={{
                  backgroundColor: isEarned ? badge.bg : 'var(--border-hover)',
                  color: isEarned ? badge.color : 'var(--text-light)',
                  padding: '14px',
                  borderRadius: '50%',
                  marginBottom: '12px',
                  display: 'inline-flex'
                }}>
                  <Icon size={24} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: isEarned ? 'var(--text-main)' : 'var(--text-light)', marginBottom: '6px' }}>
                  {badge.name}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-subtle)', lineHeight: '1.4' }}>
                  {badge.requirement}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended curriculum next steps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Recommended Security Path</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', 
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '13px'
              }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <Link to="/user/learning-feed" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  Review Remote Work VPN rules
                </Link>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'block' }}>Estimated: 4 mins</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                backgroundColor: '#f3e8ff', color: '#8b5cf6', 
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '13px'
              }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <Link to="/user/scenario-training" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  Smishing Identification Scenarios
                </Link>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'block' }}>Estimated: 6 mins</span>
              </div>
            </div>
          </div>
        </div>

        <div className="saas-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '10px', borderRadius: '10px' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>Coach Tip of the Day</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              "Always hover over redirect links before typing active directory passwords. Phishing creators rely on high-pressure language to force hurried entries."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityJourney;
