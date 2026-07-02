import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { BrainCircuit, Play, CheckCircle2, AlertTriangle, RefreshCw, Award, Shield, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { learningScenarios } from '../../data/dummyData';

const ScenarioTraining = () => {
  const { currentUser, updateProfile } = useAppContext();

  // Quiz game state: 'START', 'PLAYING', 'COMPLETED'
  const [gameState, setGameState] = useState('START');
  
  // Game metrics
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState(null);
  const [score, setScore] = useState(0);
  
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleStartGame = () => {
    setScore(0);
    setCurrentIdx(0);
    setSelectedChoiceIdx(null);
    setGameState('PLAYING');
  };

  const handleSelectChoice = (choiceIdx, isCorrect) => {
    if (selectedChoiceIdx !== null) return; // Prevent double selecting
    setSelectedChoiceIdx(choiceIdx);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedChoiceIdx(null);
    if (currentIdx + 1 < learningScenarios.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Completed!
      setGameState('COMPLETED');
      
      // If perfect score, upgrade user stats
      if (score + (selectedChoiceIdx !== null && learningScenarios[currentIdx].decisions[selectedChoiceIdx].isCorrect ? 1 : 0) === 3) {
        updateProfile({
          securityScore: Math.min(currentUser.securityScore + 4, 100),
          trainingCompletion: Math.min(currentUser.trainingCompletion + 10, 100)
        });
        triggerToast('Perfect Score! Security credentials upgraded by +4 points.');
      }
    }
  };

  const currentScenario = learningScenarios[currentIdx];
  const totalScenarios = learningScenarios.length;

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
          <Award size={18} style={{ color: 'var(--color-warning)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Scenario Roleplay Training</h1>
          <p>Test your decisions in real-life cyber-attack scenarios and see if you can protect corporate parameters.</p>
        </div>
      </div>

      {/* Game State Render */}
      {gameState === 'START' && (
        <div className="saas-card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-teal-light)',
            color: 'var(--color-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <BrainCircuit size={40} />
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px' }}>
            Interactive Scenario Simulator
          </h2>
          
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
            Enter a simulated roleplay sequence where you encounter complex spear-phishing attacks, MFA deceptions, and compromised workspace tools. Can you identify the telltale clues and make the correct choices?
          </p>

          <Button 
            onClick={handleStartGame} 
            variant="primary" 
            size="lg" 
            icon={Play}
            style={{ padding: '12px 32px' }}
          >
            Start Simulator
          </Button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          
          {/* Progress bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-light)' }}>
              Scenario {currentIdx + 1} of {totalScenarios}
            </span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-teal)' }}>
              Current Score: {score} Correct
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ 
              width: `${((currentIdx) / totalScenarios) * 100}%`, 
              height: '100%', 
              backgroundColor: 'var(--color-teal)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Scenario Details Box */}
          <div className="saas-card" style={{ padding: '32px', marginBottom: '24px', backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--color-teal)' }} />
              {currentScenario.title}
            </h3>
            
            <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: '24px' }}>
              {currentScenario.situation}
            </p>

            {/* Decisions choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentScenario.decisions.map((dec, index) => {
                const isSelected = selectedChoiceIdx === index;
                const isRevealed = selectedChoiceIdx !== null;
                
                let cardStyle = {
                  border: '1px solid var(--border-hover)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)'
                };
                if (isRevealed) {
                  if (dec.isCorrect) {
                    cardStyle = {
                      border: '2px solid var(--color-success)',
                      backgroundColor: 'var(--color-success-light)',
                      color: '#065f46'
                    };
                  } else if (isSelected) {
                    cardStyle = {
                      border: '2px solid var(--color-danger)',
                      backgroundColor: 'var(--color-danger-light)',
                      color: '#991b1b'
                    };
                  } else {
                    cardStyle = {
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-subtle)',
                      opacity: '0.7'
                    };
                  }
                }

                return (
                  <div 
                    key={index}
                    onClick={() => handleSelectChoice(index, dec.isCorrect)}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      cursor: isRevealed ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      fontWeight: '550',
                      fontSize: '13.5px',
                      ...cardStyle
                    }}
                    className={isRevealed ? "" : "scenario-choice-card"}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                      <span style={{ 
                        width: '22px', 
                        height: '22px', 
                        borderRadius: '50%', 
                        border: isRevealed ? 'none' : '1px solid var(--border-hover)',
                        backgroundColor: isRevealed && dec.isCorrect ? 'var(--color-success)' : isRevealed && isSelected ? 'var(--color-danger)' : 'var(--bg-main)',
                        color: isRevealed ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        flexShrink: 0
                      }}>
                        {isRevealed && dec.isCorrect ? '✓' : isRevealed && isSelected ? '✗' : String.fromCharCode(65 + index)}
                      </span>
                      <span>{dec.text}</span>
                    </div>

                    {/* Explanations shown only on reveal */}
                    {isRevealed && (isSelected || dec.isCorrect) && (
                      <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '10px', 
                        borderTop: '1px solid rgba(0,0,0,0.06)', 
                        fontSize: '12.5px', 
                        lineHeight: '1.5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {dec.isCorrect ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        <span>{dec.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Proceed to next button */}
            {selectedChoiceIdx !== null && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--bg-sidebar)', paddingTop: '16px' }}>
                <Button 
                  onClick={handleNext}
                  variant="teal"
                  icon={ArrowRight}
                >
                  {currentIdx + 1 === totalScenarios ? 'Show Results Score' : 'Next Scenario'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'COMPLETED' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          
          <div className="saas-card" style={{ padding: '36px', textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '850', color: 'var(--text-main)', marginBottom: '6px' }}>Simulator Summary Scoreboard</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Review details of your decision metrics below.</p>
            
            {/* Score display */}
            <div style={{ margin: '24px 0' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>YOUR FINAL SCORE</div>
              <div style={{ fontSize: '54px', fontWeight: '900', color: score === 3 ? 'var(--color-teal)' : '#eab308' }}>
                {score} / 3
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', fontWeight: '700' }}>
                {score === 3 ? '100% SECURE PREPAREDNESS' : 'AREAS OF SUSCEPTIBILITY ENCOUNTERED'}
              </div>
            </div>

            {/* Certificate of achievement render */}
            {score === 3 ? (
              <div style={{
                border: '4px double var(--color-warning)',
                borderRadius: '8px',
                padding: '24px',
                backgroundColor: '#fffbeb',
                marginBottom: '28px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background watermark badge */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--color-warning-light)', transform: 'rotate(15deg)', zIndex: 1 }}>
                  <Award size={96} />
                </div>
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#b45309', display: 'block', marginBottom: '8px' }}>
                    Phintra Awareness Credentials Office
                  </span>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                    CERTIFICATE OF ACHIEVEMENT
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginBottom: '14px' }}>
                    This is securely awarded to
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-success)', display: 'block', borderBottom: '1.5px solid #b45309', width: 'fit-content', margin: '0 auto 12px', padding: '0 12px 4px' }}>
                    {currentUser.name}
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', maxWidth: '380px', margin: '0 auto' }}>
                    For registering a perfect decision score on the Phintra interactive simulation drills. Verified as an authorized cyber-aware corporate node.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-hover)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: '1.6',
                marginBottom: '28px'
              }}>
                To earn the completion certificate and bolster your security status, retry the simulator training and answer all 3 scenarios correctly.
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setGameState('START')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-hover)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13.5px'
                }}
              >
                Back to Start Screen
              </button>
              
              <Button
                onClick={handleStartGame}
                variant="primary"
                icon={RefreshCw}
              >
                Retry Simulator Run
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Style settings */}
      <style>{`
        .scenario-choice-card:hover {
          border-color: var(--text-subtle) !important;
          background-color: var(--bg-main) !important;
        }
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ScenarioTraining;
