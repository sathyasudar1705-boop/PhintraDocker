import React, { useState } from 'react';
import { Target, ShieldCheck, AlertCircle, RefreshCw, Star, Info, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const RED_FLAGS = [
  {
    id: 'sender',
    label: 'Suspicious Sender Email Address',
    description: 'The display name says "Internal Security Support" but the actual email domain is "@security-operations-portal-phintra.net", which is a look-alike domain, not the authentic "phintra.com".',
    coords: { top: '50px', left: '10px', width: '280px', height: '24px' }
  },
  {
    id: 'subject',
    label: 'Artificial Urgency in Subject',
    description: 'The phrase "URGENT: Action Required within 10 Minutes" creates anxiety to rush you into acting before checking the validity of the link.',
    coords: { top: '15px', left: '10px', width: '380px', height: '24px' }
  },
  {
    id: 'greeting',
    label: 'Generic Greeting',
    description: 'Addressing you as "Valued Staff Member" rather than your name is a common sign of bulk automated phishing templates.',
    coords: { top: '100px', left: '10px', width: '180px', height: '20px' }
  },
  {
    id: 'link',
    label: 'Deceptive Hyperlink Button',
    description: 'Hovering over the button reveals it links to an external unencrypted URL "http://update-phintra.com/verify-mfa/access-token" instead of an internal HTTPS directory.',
    coords: { top: '210px', left: '10px', width: '220px', height: '40px' }
  }
];

const RedFlagTraining = () => {
  const [clickedFlags, setClickedFlags] = useState({});
  const [activeExplain, setActiveExplain] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleFlagClick = (flag) => {
    if (!clickedFlags[flag.id]) {
      const newClicked = { ...clickedFlags, [flag.id]: true };
      setClickedFlags(newClicked);
      const newScore = score + 1;
      setScore(newScore);
      setActiveExplain(flag);

      if (newScore === RED_FLAGS.length) {
        setCompleted(true);
      }
    } else {
      setActiveExplain(flag);
    }
  };

  const handleReset = () => {
    setClickedFlags({});
    setActiveExplain(null);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Red Flag Spotter Game</h1>
          <p>Analyze this mock corporate email and click directly on the suspicious elements to uncover the phishing red flags.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* The interactive email workspace */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Click Hotspots ({score}/{RED_FLAGS.length} Found)</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
              <RefreshCw size={14} />
              Reset Game
            </button>
          </div>

          {/* Email mockup window */}
          <div style={{
            border: '1px solid var(--border-hover)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-card)',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            {/* Browser client header bar */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              borderBottom: '1px solid var(--border-color)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', marginLeft: '10px' }}>Inbound Message</span>
            </div>

            {/* Rendered Email Area (Coordinate System Space) */}
            <div style={{ padding: '20px', position: 'relative', minHeight: '340px' }}>
              
              {/* Hotspot overlays */}
              {RED_FLAGS.map((flag) => {
                const isFound = clickedFlags[flag.id];
                return (
                  <div
                    key={flag.id}
                    onClick={() => handleFlagClick(flag)}
                    style={{
                      position: 'absolute',
                      top: flag.coords.top,
                      left: flag.coords.left,
                      width: flag.coords.width,
                      height: flag.coords.height,
                      border: isFound ? '2px solid var(--color-danger)' : '1px dashed transparent',
                      backgroundColor: isFound ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.02)',
                      borderRadius: '4px',
                      cursor: 'help',
                      zIndex: 10,
                      transition: 'all 0.15s ease'
                    }}
                    className={isFound ? '' : 'search-input-hover'}
                  >
                    {isFound && (
                      <div style={{
                        position: 'absolute', right: '-8px', top: '-8px',
                        backgroundColor: 'var(--color-danger)', color: '#fff',
                        width: '16px', height: '16px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', fontWeight: 'bold'
                      }}>
                        !
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Mock Subject */}
              <div style={{ borderBottom: '1px solid var(--bg-sidebar)', paddingBottom: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'block' }}>Subject</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                  URGENT: Action Required within 10 Minutes - Password Expiring!
                </span>
              </div>

              {/* Mock Sender details */}
              <div style={{ borderBottom: '1px solid var(--bg-sidebar)', paddingBottom: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'block' }}>From</span>
                <div style={{ fontSize: '13px' }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Internal Security Support</strong>{' '}
                  <span style={{ color: 'var(--text-light)' }}>&lt;auth-update@security-operations-portal-phintra.net&gt;</span>
                </div>
              </div>

              {/* Mock Email Message Body */}
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <p style={{ fontWeight: '500' }}>Dear Valued Staff Member,</p>
                <p style={{ marginTop: '10px' }}>
                  We are rolling out quarterly identity upgrades across our core application endpoints. To ensure database connectivity, you must update your authentication hash within the next ten minutes.
                </p>
                
                {/* Clickable button lure */}
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginTop: '20px',
                    backgroundColor: clickedFlags['link'] ? 'var(--color-danger-light)' : 'var(--color-primary)',
                    color: clickedFlags['link'] ? 'var(--color-danger)' : '#ffffff',
                    border: clickedFlags['link'] ? '1px solid var(--color-danger)' : 'none',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '12px',
                    pointerEvents: 'none'
                  }}
                >
                  UPGRADE IDENTITY HASH NOW
                </button>

                <p style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-subtle)' }}>
                  System Notification System ID: #782-9A4
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Dynamic Sidebar explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Default instructional console */}
          {!activeExplain && !completed && (
            <div className="saas-card">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <HelpCircle size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>How to Play</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Phishing emails contain subtle clues called <strong>Red Flags</strong>. Hover over and click on parts of the email layout in the preview client that you think look fake, misleading, or alarming.
              </p>
              <div style={{
                marginTop: '16px',
                border: '1px solid var(--border-color)',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-main)',
                fontSize: '12px',
                color: 'var(--text-light)'
              }}>
                <strong>Look closely at:</strong> the sender's address domain, general salutations, strict time-constraints, and where buttons look like they redirect.
              </div>
            </div>
          )}

          {/* Active explanation panel */}
          {activeExplain && (
            <div className="saas-card animate-fade-in" style={{ borderColor: 'var(--color-danger)', backgroundColor: '#fffdfd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-danger)' }}>
                <Star size={18} fill="var(--color-danger)" />
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Red Flag Revealed!</h3>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>{activeExplain.label}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {activeExplain.description}
              </p>
            </div>
          )}

          {/* Completed badge reward panel */}
          {completed && (
            <div className="saas-card animate-fade-in" style={{ borderColor: 'var(--color-success)', backgroundColor: '#f0fdf4', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ backgroundColor: '#d1fae5', color: 'var(--color-success)', padding: '16px', borderRadius: '50%' }}>
                  <ShieldCheck size={32} />
                </div>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#065f46', marginBottom: '6px' }}>Vigilance Training Complete!</h3>
              <p style={{ fontSize: '13px', color: '#047857', marginBottom: '16px', lineHeight: '1.5' }}>
                Excellent analysis skills! You found all {RED_FLAGS.length} phishing indicators in this email mockup. Keep applying these checks to your genuine inbox.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--color-success)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--color-success)'
              }}>
                🏆 Received: "Phish Finder" Badge (+50 XP)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedFlagTraining;
