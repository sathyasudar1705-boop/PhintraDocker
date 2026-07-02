import React, { useState, useEffect } from 'react';
import { Award, Star, Shield, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';

const SCENARIOS = [
  {
    id: 1,
    title: 'The Urgent Invoice Attachment',
    description: 'You receive an email from "accounts-payable@vendormanagement-portal.net" stating your company has an overdue invoice of $4,500 that must be paid via ACH today to avoid legal actions.',
    options: [
      { text: 'Download the attachment and verify the invoices list immediately.', correct: false, explanation: 'Downloading unverified attachments from suspicious look-alike domains bypasses email scanners and risk running macro malware on your workstation.' },
      { text: 'Forward the message to the IT Security team using the "Report Email" console button.', correct: true, explanation: 'Excellent! Reporting the email allows security analysts to block the domain organization-wide and confirms it was a simulated attack or active campaign.' },
      { text: 'Reply to the sender asking them to verify their company registration details.', correct: false, explanation: 'Replying validates your email address to attackers, signaling that your mailbox is active and inviting further targeted social engineering.' }
    ],
    xp: 50,
    solvedKey: 'challenge_1_solved'
  },
  {
    id: 2,
    title: 'Slack Verification Request',
    description: 'A Slack message from an account with the display name "Sathya Sudar (CEO)" asks you to privately message them your personal cellular phone number for a confidential corporate project validation.',
    options: [
      { text: 'Provide your number immediately since it is the CEO.', correct: false, explanation: 'Always verify identity before providing personal contact information, especially if the request is sudden and out-of-channel.' },
      { text: 'Check the Slack user profile details to verify their employee email and directory ID.', correct: true, explanation: 'Correct! Spoofed profiles can have similar names, but authentic profiles contain full organization mapping and email verification.' },
      { text: 'Ignore the message entirely and do not mention it to anyone.', correct: false, explanation: 'Ignoring it prevents active compromise but fails to inform administrators that a spoofed profile is targeting staff.' }
    ],
    xp: 60,
    solvedKey: 'challenge_2_solved'
  }
];

const Challenges = () => {
  const [totalXp, setTotalXp] = useState(() => {
    return Number(localStorage.getItem('user_xp_accumulated')) || 120;
  });
  const [solvedStates, setSolvedStates] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState({});

  useEffect(() => {
    const states = {};
    SCENARIOS.forEach(s => {
      states[s.id] = localStorage.getItem(s.solvedKey) === 'true';
    });
    setSolvedStates(states);
  }, []);

  const handleSelectOption = (scenarioId, idx) => {
    setSelectedAnswers({ ...selectedAnswers, [scenarioId]: idx });
    setShowResult({ ...showResult, [scenarioId]: null });
  };

  const handleAnswerSubmit = (scenario) => {
    const selectedIdx = selectedAnswers[scenario.id];
    if (selectedIdx === undefined) return;

    const opt = scenario.options[selectedIdx];
    if (opt.correct) {
      // Award XP
      localStorage.setItem(scenario.solvedKey, 'true');
      setSolvedStates(prev => ({ ...prev, [scenario.id]: true }));
      
      const newXp = totalXp + scenario.xp;
      setTotalXp(newXp);
      localStorage.setItem('user_xp_accumulated', String(newXp));
      
      setShowResult({ ...showResult, [scenario.id]: { success: true, explanation: opt.explanation } });
    } else {
      setShowResult({ ...showResult, [scenario.id]: { success: false, explanation: opt.explanation } });
    }
  };

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Weekly Security Challenges</h1>
          <p>Solve interactive scenarios to prove your vulnerability assessment skills and level up your XP.</p>
        </div>
      </div>

      {/* XP Status Ribbon */}
      <div className="saas-card" style={{
        background: 'linear-gradient(135deg, var(--color-teal) 0%, var(--color-teal-hover) 100%)',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        padding: '20px 24px',
        border: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
            <Award size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Security Cadet Tier</h2>
            <span style={{ fontSize: '13px', color: '#ccfbf1', marginTop: '2px', display: 'block' }}>
              Level up to "Guardian Specialist" at 500 XP
            </span>
          </div>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: '#ccfbf1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accumulated XP</span>
          <h2 className="gamified-metric xp-amount" style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', margin: 0 }}>{totalXp} XP</h2>
        </div>
      </div>

      {/* Scenarios Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {SCENARIOS.map((scen) => {
          const isSolved = solvedStates[scen.id];
          const activeSelect = selectedAnswers[scen.id];
          const result = showResult[scen.id];

          return (
            <div key={scen.id} className="saas-card" style={{
              borderColor: isSolved ? 'var(--color-success)' : 'var(--border-color)',
              backgroundColor: isSolved ? '#f0fdf4' : '#ffffff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <span className="badge badge-reported" style={{ fontSize: '10px', marginBottom: '6px' }}>Scenario {scen.id}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{scen.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="gamified-metric badge badge-medium" style={{ fontSize: '11px', fontWeight: '700' }}>+{scen.xp} XP</span>
                  {isSolved && (
                    <span className="badge badge-passed" style={{ fontSize: '11px' }}>
                      Solved
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                {scen.description}
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {scen.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    onClick={() => !isSolved && handleSelectOption(scen.id, oIdx)}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      cursor: isSolved ? 'default' : 'pointer',
                      backgroundColor: activeSelect === oIdx ? 'var(--color-primary-light)' : '#ffffff',
                      borderColor: activeSelect === oIdx ? 'var(--color-primary)' : 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      transition: 'all 0.15s ease'
                    }}
                    className={isSolved ? '' : 'search-input-hover'}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: activeSelect === oIdx ? '5px solid var(--color-primary)' : '2px solid var(--border-hover)',
                      flexShrink: 0
                    }} />
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>

              {/* Submit / Results footer */}
              {!isSolved && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    icon={ArrowRight}
                    onClick={() => handleAnswerSubmit(scen)}
                    disabled={activeSelect === undefined}
                  >
                    Submit Answer
                  </Button>
                </div>
              )}

              {/* Result alerts */}
              {result && (
                <div className="animate-fade-in" style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${result.success ? 'var(--color-success)' : 'var(--color-danger)'}`,
                  backgroundColor: result.success ? 'var(--color-success-light)' : '#fff5f5',
                  color: result.success ? '#065f46' : '#991b1b',
                  fontSize: '13px',
                  lineHeight: '1.6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '6px' }}>
                    {result.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {result.success ? 'Correct Answer!' : 'Incorrect Choice'}
                  </div>
                  <p>{result.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Challenges;
