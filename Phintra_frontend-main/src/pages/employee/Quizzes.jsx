import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, HelpCircle, CheckCircle2, XCircle, Play, 
  RefreshCw, ChevronRight, Zap, Check, X, ShieldAlert, Megaphone,
  Volume2, VolumeX
} from 'lucide-react';
import api from '../../services/api';

// Mascot imports for the result screens
import shieldLowImg from '../../assets/shield_low.png';
import shieldMidImg from '../../assets/shield_mid.png';
import shieldHighImg from '../../assets/shield_high.png';

// Web Audio API Sound Synthesizer for high-fidelity gamified feedback
const playSynthesizedSound = (type, isMuted) => {
  if (isMuted) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'select') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'correct') {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.08);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.08);
      osc2.frequency.setValueAtTime(1046.50, now + 0.16);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
      gain.gain.linearRampToValueAtTime(0, now + 0.35);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'incorrect') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.25);
    } else if (type === 'success') {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        gain.gain.setValueAtTime(0.12, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0, now + index * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.3);
      });
    }
  } catch (err) {
    console.error("Audio error:", err);
  }
};

const EmployeeQuizzes = () => {
  const { currentUser, quizzes, setCurrentUser, addAuditLog } = useAppContext();
  
  // Game states: 'LIST', 'PLAYING', 'RESULT'
  const [viewState, setViewState] = useState('LIST');
  const [activeQuiz, setActiveQuiz] = useState(null);
  
  // Quiz taking state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionIdx -> selectedOptionIndex
  const [quizScore, setQuizScore] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Gamification & Web Audio States
  const [soundMuted, setSoundMuted] = useState(false);
  const [questionState, setQuestionState] = useState('answering'); // 'answering' | 'checked'
  const [streakCount, setStreakCount] = useState(0);

  // Check if user has already passed this quiz
  const hasPassedQuiz = (quizName) => {
    if (!currentUser?.quiz_results) return false;
    return currentUser.quiz_results.some(
      r => (r.module_title === quizName || r.quiz_name === quizName) && (r.passed || r.score >= 80)
    );
  };

  // Get highest attempt score
  const getQuizHighestScore = (quizName) => {
    if (!currentUser?.quiz_results) return null;
    const attempts = currentUser.quiz_results.filter(
      r => r.module_title === quizName || r.quiz_name === quizName
    );
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.score));
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizScore(null);
    setQuizPassed(false);
    setError('');
    setViewState('PLAYING');

    // Gamification state resets
    setQuestionState('answering');
    setStreakCount(0);
  };

  const handleSelectOption = (optionIdx) => {
    if (questionState === 'checked') return;
    playSynthesizedSound('select', soundMuted);
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: optionIdx
    }));
  };

  const handleCheckAnswer = () => {
    const q = activeQuiz.questions[currentQuestionIdx];
    const userAns = selectedAnswers[currentQuestionIdx];
    const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
    
    const isCorrect = userAns === correctIdx;
    
    if (isCorrect) {
      setStreakCount(prev => prev + 1);
      playSynthesizedSound('correct', soundMuted);
    } else {
      setStreakCount(0);
      playSynthesizedSound('incorrect', soundMuted);
    }
    
    setQuestionState('checked');
  };

  const handleContinueQuestion = () => {
    setQuestionState('answering');
    
    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  // Lifeline/Power-up features removed per request

  const getCircleColor = (idx) => {
    const isSelected = selectedAnswers[currentQuestionIdx] === idx;
    const q = activeQuiz.questions[currentQuestionIdx];
    const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
    
    if (questionState === 'checked') {
      if (idx === correctIdx) return '#10B981';
      if (isSelected) return '#EF4444';
      return '#94A3B8';
    }
    return isSelected ? '#2563EB' : '#10B981';
  };

  const getCircleShadowColor = (idx) => {
    const isSelected = selectedAnswers[currentQuestionIdx] === idx;
    const q = activeQuiz.questions[currentQuestionIdx];
    const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
    
    if (questionState === 'checked') {
      if (idx === correctIdx) return '#059669';
      if (isSelected) return '#B91C1C';
      return '#64748B';
    }
    return isSelected ? '#1E40AF' : '#059669';
  };

  const getPillColor = (idx) => {
    const isSelected = selectedAnswers[currentQuestionIdx] === idx;
    const q = activeQuiz.questions[currentQuestionIdx];
    const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
    
    if (questionState === 'checked') {
      if (idx === correctIdx) return '#F0FDF4';
      if (isSelected) return '#FEF2F2';
      return '#F8FAFC';
    }
    return isSelected ? '#EFF6FF' : '#FFFFFF';
  };

  const getPillShadow = (idx) => {
    const isSelected = selectedAnswers[currentQuestionIdx] === idx;
    const q = activeQuiz.questions[currentQuestionIdx];
    const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
    
    if (questionState === 'checked') {
      if (idx === correctIdx) return '0 4px 0 #86EFAC';
      if (isSelected) return '0 4px 0 #FCA5A5';
      return '0 4px 0 #CBD5E1';
    }
    return isSelected ? '0 2px 0 #BFDBFE' : '0 4px 0 #CBD5E1';
  };

  const getPillBorder = (idx) => {
    const isSelected = selectedAnswers[currentQuestionIdx] === idx;
    const q = activeQuiz.questions[currentQuestionIdx];
    const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
    
    if (questionState === 'checked') {
      if (idx === correctIdx) return '2.5px solid #10B981';
      if (isSelected) return '2.5px solid #EF4444';
      return '2px solid #E2E8F0';
    }
    return isSelected ? '2.5px solid #2563EB' : '2px solid #CBD5E1';
  };

  const getPillTextColor = (idx) => {
    const isSelected = selectedAnswers[currentQuestionIdx] === idx;
    const q = activeQuiz.questions[currentQuestionIdx];
    const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
    
    if (questionState === 'checked') {
      if (idx === correctIdx) return '#15803D';
      if (isSelected) return '#991B1B';
      return '#94A3B8';
    }
    return isSelected ? '#1E40AF' : '#334155';
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setError('');
    try {
      const questions = activeQuiz.questions;
      let correctCount = 0;
      
      questions.forEach((q, idx) => {
        const userAns = selectedAnswers[idx];
        const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
        if (userAns === correctIdx) {
          correctCount++;
        }
      });

      const scorePct = Math.round((correctCount / questions.length) * 100);
      const passed = scorePct >= (activeQuiz.passingScore || activeQuiz.passing_score || 80);
      
      setQuizScore(scorePct);
      setQuizPassed(passed);

      if (passed) {
        playSynthesizedSound('success', soundMuted);
      } else {
        playSynthesizedSound('incorrect', soundMuted);
      }

      const isDatabaseQuiz = typeof activeQuiz.id === 'string' && activeQuiz.id.includes('-');

      if (isDatabaseQuiz) {
        const answersList = questions.map((_, idx) => selectedAnswers[idx] || 0);
        await api.post(`/quizzes/${activeQuiz.id}/attempt`, {
          employee_id: currentUser.employee_id || currentUser.id,
          answers: answersList
        });
      } else {
        const newResult = {
          id: `quiz-attempt-${Date.now()}`,
          quiz_name: activeQuiz.quizName,
          module_title: activeQuiz.quizName,
          score: scorePct,
          passed: passed,
          date: new Date().toISOString().split('T')[0]
        };

        setCurrentUser(prev => {
          const currentResults = prev.quiz_results || [];
          const alreadyPassed = currentResults.some(r => r.module_title === activeQuiz.quizName && r.passed);
          
          let xpReward = 0;
          let scoreReward = 0;
          
          if (passed && !alreadyPassed) {
            xpReward = 100;
            scoreReward = 5;
          }

          return {
            ...prev,
            rewards_balance: (prev.rewards_balance || 0) + xpReward,
            securityScore: Math.min((prev.securityScore || 80) + scoreReward, 100),
            quiz_results: [newResult, ...currentResults]
          };
        });

        addAuditLog("Quiz Attempt", `Completed evaluation '${activeQuiz.quizName}' with score ${scorePct}%`);
      }

      setViewState('RESULT');
    } catch (err) {
      console.error("Failed to submit quiz attempt:", err);
      setError("Failed to record quiz results. Please check your internet connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Outfit', sans-serif", maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Title Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
          Quizzes
        </h1>
      </div>

      <AnimatePresence mode="wait">
        
        {/* State 1: QUIZ SELECTION LIST */}
        {viewState === 'LIST' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}
          >
            {quizzes.map((quiz) => {
              const passed = hasPassedQuiz(quiz.quizName);
              const highestScore = getQuizHighestScore(quiz.quizName);
              const qCount = quiz.questionsCount || quiz.questions?.length || 0;
              const passing = quiz.passingScore || quiz.passing_score || 80;

              return (
                <motion.div
                  key={quiz.id}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
                  style={{
                    background: '#fff',
                    border: passed ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.25s ease',
                    boxShadow: passed ? '0 8px 20px rgba(16,185,129,0.04)' : 'none'
                  }}
                >
                  {/* Banner Line */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                    borderRadius: '20px 20px 0 0',
                    background: passed ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #4f46e5)'
                  }} />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', marginTop: '6px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: passed ? '#ecfdf5' : '#eef2ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Award size={20} color={passed ? '#10b981' : '#6366f1'} />
                      </div>

                      {passed ? (
                        <span style={{
                          fontSize: '10px', fontWeight: '800', color: '#10b981',
                          background: '#ecfdf5', padding: '3px 10px', borderRadius: '99px',
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          Passed
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '10px', fontWeight: '800', color: '#64748b',
                          background: '#f1f5f9', padding: '3px 10px', borderRadius: '99px',
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          Available
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
                      {quiz.quizName}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '24px' }}>
                      <span>{qCount} Questions</span>
                      <span>•</span>
                      <span>Passing Score: {passing}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                      {highestScore !== null ? `Highest Score: ${highestScore}%` : 'No attempts recorded'}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStartQuiz(quiz)}
                      style={{
                        background: passed ? '#fff' : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                        color: passed ? '#2563eb' : '#fff',
                        border: passed ? '1px solid #2563eb' : 'none',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '750',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {passed ? <RefreshCw size={12} /> : <Play size={12} fill="#fff" />}
                      {passed ? 'Retake Quiz' : 'Start Quiz'}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}        {/* State 2: QUIZ INTERACTIVE PLAYER */}
        {viewState === 'PLAYING' && activeQuiz && (
          <div style={{
            position: 'relative',
            width: '100%',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 0',
            marginTop: '12px'
          }}>
            <style>{`
              @media (max-width: 900px) {
                .mascot-container {
                  display: none !important;
                }
              }
            `}</style>
            
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#FFFDF9',
                borderRadius: '40px',
                padding: '40px',
                position: 'relative',
                width: '100%',
                maxWidth: '680px',
                boxShadow: '0 16px 0 rgba(15, 23, 42, 0.05), 0 20px 40px rgba(15, 23, 42, 0.08)',
                border: '4px solid #FFFFFF',
                boxSizing: 'border-box',
                overflow: 'visible',
                fontFamily: "'Fredoka', 'Outfit', sans-serif"
              }}
            >
              {/* Speech Bubble Tail */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderTop: '20px solid #FFFDF9',
                filter: 'drop-shadow(0 4px 0 rgba(15,23,42,0.04))',
                zIndex: 1
              }} />

              {/* Floating Megaphone (Top Left) */}
              <div style={{
                position: 'absolute',
                top: '-32px',
                left: '-24px',
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-25deg)',
                boxShadow: '0 8px 0 #3730A3, 0 12px 24px rgba(99,102,241,0.3)',
                zIndex: 10
              }}>
                <Megaphone size={28} color="#fff" />
                <svg style={{ position: 'absolute', top: '-15px', right: '-15px', width: '30px', height: '30px' }} viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg style={{ position: 'absolute', bottom: '-15px', left: '-15px', width: '24px', height: '24px', transform: 'rotate(-45deg)' }} viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Floating Question Bubble Marks (Top Right) */}
              <div style={{
                position: 'absolute',
                top: '-28px',
                right: '-20px',
                display: 'flex',
                gap: '8px',
                transform: 'rotate(12deg)',
                zIndex: 10
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '900',
                  fontSize: '20px',
                  fontFamily: "'Lilita One', sans-serif",
                  boxShadow: '0 6px 0 #5B21B6, 0 10px 20px rgba(124,58,237,0.25)',
                  position: 'relative'
                }}>
                  ?
                  <div style={{ position: 'absolute', bottom: '-4px', left: '10px', width: '8px', height: '8px', background: '#7C3AED', transform: 'rotate(45deg)' }} />
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #EC4899, #DB2777)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '900',
                  fontSize: '15px',
                  fontFamily: "'Lilita One', sans-serif",
                  boxShadow: '0 5px 0 #9D174D, 0 8px 16px rgba(236,72,153,0.25)',
                  marginTop: '12px',
                  position: 'relative'
                }}>
                  ?
                  <div style={{ position: 'absolute', bottom: '-4px', left: '8px', width: '6px', height: '6px', background: '#DB2777', transform: 'rotate(45deg)' }} />
                </div>
              </div>

              {/* Interactive Mascot (Floating on the Right) */}
              <div className="mascot-container" style={{
                position: 'absolute',
                right: '-110px',
                bottom: '20px',
                width: '120px',
                height: '140px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 5,
                pointerEvents: 'none'
              }}>
                <motion.img
                  src={
                    questionState === 'checked'
                      ? selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index)
                        ? shieldHighImg
                        : shieldLowImg
                      : streakCount >= 2
                      ? shieldHighImg
                      : shieldMidImg
                  }
                  alt="Security Mascot"
                  animate={
                    questionState === 'checked'
                      ? selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index)
                        ? { y: [0, -15, 0], scale: [1, 1.05, 1] }
                        : { x: [-5, 5, -5, 5, 0] }
                      : { y: [0, -5, 0] }
                  }
                  transition={
                    questionState === 'checked'
                      ? { duration: 0.5 }
                      : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
                  }
                  style={{
                    maxHeight: '100px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.15))'
                  }}
                />
                <div style={{
                  background: '#334155',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: '800',
                  marginTop: '8px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {
                    questionState === 'checked'
                      ? selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index)
                        ? 'Awesome! 🎉'
                        : 'Watch out! ⚠️'
                      : streakCount >= 2
                      ? 'On Fire! 🔥'
                      : 'Do your best!'
                  }
                </div>
              </div>

              {/* Header: Title & Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '950', color: '#10B981', letterSpacing: '0.02em', margin: 0, textTransform: 'uppercase', fontFamily: "'Lilita One', sans-serif" }}>
                  Quiz Unlocked
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Sound Toggle */}
                  <button
                    onClick={() => setSoundMuted(!soundMuted)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    title={soundMuted ? 'Unmute Sounds' : 'Mute Sounds'}
                  >
                    {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <button 
                    onClick={() => setViewState('LIST')}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Progress Tracker Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Fredoka', sans-serif" }}>
                    Progress
                  </span>
                  {streakCount >= 2 && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                        padding: '2px 8px',
                        borderRadius: '99px',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: '800',
                        boxShadow: '0 4px 10px rgba(239,68,68,0.25)'
                      }}
                    >
                      <Zap size={10} fill="#fff" />
                      <span>{streakCount} Combo Streak! 🔥</span>
                    </motion.div>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-primary)', fontFamily: "'Fredoka', sans-serif" }}>
                  Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                </span>
              </div>

              {/* Quiz Progress Bar */}
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-cyan))',
                  width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Question Text */}
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', lineHeight: 1.4, marginBottom: '20px', fontFamily: "'Fredoka', sans-serif" }}>
                {activeQuiz.questions[currentQuestionIdx].questionText || activeQuiz.questions[currentQuestionIdx].question_text}
              </h2>



              {/* Options List - Gamified pills style */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {activeQuiz.questions[currentQuestionIdx].options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                  const letter = String.fromCharCode(97 + idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        cursor: questionState === 'checked' ? 'default' : 'pointer',
                        width: '100%',
                        height: '56px'
                      }}
                    >
                      {/* Left circular letter tag */}
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: getCircleColor(idx),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '18px',
                        fontFamily: "'Fredoka', sans-serif",
                        zIndex: 3,
                        border: '3px solid #fff',
                        boxShadow: `0 3px 0 ${getCircleShadowColor(idx)}, 0 4px 10px rgba(0,0,0,0.1)`,
                        transform: isSelected && questionState === 'answering' ? 'translateY(2px)' : 'none',
                        transition: 'background-color 0.2s, box-shadow 0.2s, transform 0.1s'
                      }}>
                        {letter}
                      </div>

                      {/* Right capsule/pill */}
                      <motion.div
                        whileHover={questionState === 'answering' ? { scale: 1.015, y: -1 } : {}}
                        whileTap={questionState === 'answering' ? { scale: 0.985, y: 2 } : {}}
                        style={{
                          flex: 1,
                          height: '48px',
                          marginLeft: '20px',
                          backgroundColor: getPillColor(idx),
                          borderRadius: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '36px',
                          paddingRight: '20px',
                          zIndex: 2,
                          border: getPillBorder(idx),
                          boxShadow: getPillShadow(idx),
                          transition: 'background-color 0.2s, box-shadow 0.2s, border 0.2s'
                        }}
                      >
                        <span style={{ color: getPillTextColor(idx), fontSize: '15px', fontWeight: '750', fontFamily: "'Fredoka', sans-serif" }}>
                          {option}
                        </span>
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Immediate feedback slide-up panel */}
              {questionState === 'checked' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index) ? '#F0FDF4' : '#FEF2F2',
                    border: `3px solid ${selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index) ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: '24px',
                    padding: '20px',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index) ? (
                      <CheckCircle2 size={24} color="#10B981" style={{ strokeWidth: 3 }} />
                    ) : (
                      <XCircle size={24} color="#EF4444" style={{ strokeWidth: 3 }} />
                    )}
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index) ? '#15803D' : '#991B1B',
                      fontFamily: "'Fredoka', sans-serif"
                    }}>
                      {selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index) ? 'Awesome! Correct Answer' : 'Incorrect Answer'}
                    </span>
                  </div>
                  
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index) ? '#166534' : '#7F1D1D',
                    lineHeight: 1.4,
                    margin: 0
                  }}>
                    {activeQuiz.questions[currentQuestionIdx].explanation || (selectedAnswers[currentQuestionIdx] === (activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index)
                      ? "Great job identifying the correct cybersecurity procedure!" 
                      : `The correct option was: "${activeQuiz.questions[currentQuestionIdx].options[activeQuiz.questions[currentQuestionIdx].correctIndex !== undefined ? activeQuiz.questions[currentQuestionIdx].correctIndex : activeQuiz.questions[currentQuestionIdx].correct_option_index]}". Make sure to review security guidelines.`)
                    }
                  </p>
                </motion.div>
              )}

              {/* Action Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                {questionState === 'answering' ? (
                  <button
                    disabled={selectedAnswers[currentQuestionIdx] === undefined}
                    onClick={handleCheckAnswer}
                    style={{
                      background: selectedAnswers[currentQuestionIdx] === undefined 
                        ? '#F1F5F9' 
                        : 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: selectedAnswers[currentQuestionIdx] === undefined ? '#94A3B8' : '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '12px 48px',
                      fontSize: '16px',
                      fontWeight: '800',
                      cursor: selectedAnswers[currentQuestionIdx] === undefined ? 'not-allowed' : 'pointer',
                      boxShadow: selectedAnswers[currentQuestionIdx] === undefined ? 'none' : '0 4px 0 #92400E',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                      fontFamily: "'Fredoka', sans-serif"
                    }}
                  >
                    <span>Check Answer</span>
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    disabled={submitting}
                    onClick={handleContinueQuestion}
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary), #1D4ED8)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '12px 48px',
                      fontSize: '16px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 0 #172554',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                      fontFamily: "'Fredoka', sans-serif"
                    }}
                  >
                    <span>{currentQuestionIdx + 1 < activeQuiz.questions.length ? 'Continue' : submitting ? 'Submitting...' : 'Finish & Submit'}</span>
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* State 3: QUIZ ATTEMPT RESULTS SCREEN */}
        {viewState === 'RESULT' && activeQuiz && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            style={{
              background: '#FFFDF9',
              border: '4px solid #ffffff',
              borderRadius: '40px',
              padding: '40px',
              maxWidth: '680px',
              margin: '0 auto',
              boxShadow: '0 16px 0 rgba(15, 23, 42, 0.05), 0 20px 40px rgba(15, 23, 42, 0.08)',
              position: 'relative',
              overflow: 'visible',
              fontFamily: "'Fredoka', 'Outfit', sans-serif"
            }}
          >
            {/* Header border status color */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
              borderRadius: '40px 40px 0 0',
              background: quizPassed ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)'
            }} />

            {/* Split layout: text + mascot */}
            <div style={{ display: 'flex', gap: '28px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap-reverse' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  {quizPassed ? (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', background: '#ecfdf5', padding: '3px 12px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      SUCCESS
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', background: '#fef2f2', padding: '3px 12px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      FAILED
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', lineHeight: 1.2, margin: 0, fontFamily: "'Lilita One', sans-serif" }}>
                  {quizPassed ? 'Congratulations! 🎉' : 'Keep Learning! 💪'}
                </h2>
                
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginTop: '8px', fontWeight: '600' }}>
                  {quizPassed 
                    ? `You passed the '${activeQuiz.quizName}' evaluation, demonstrating excellent security awareness.`
                    : `You didn't reach the required ${activeQuiz.passingScore || activeQuiz.passing_score || 80}% passing score this time. Review the questions below and try again!`
                  }
                </p>

                {quizPassed && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '6px 16px', marginTop: '12px', boxShadow: '0 3px 0 #FDE68A' }}>
                    <Zap size={14} color="#f59e0b" fill="#f59e0b" />
                    <span className="gamified-metric xp-amount" style={{ fontSize: '12px', fontWeight: '800', color: '#78350f' }}>+100 XP & +5 Standing Points Awarded</span>
                  </div>
                )}
              </div>

              {/* Character mascot showing outcome */}
              <div style={{
                width: '125px', height: '145px',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                margin: '0 auto', flexShrink: 0
              }}>
                <img
                  src={quizPassed ? (quizScore === 100 ? shieldHighImg : shieldMidImg) : shieldLowImg}
                  alt="Mascot status"
                  style={{
                    maxHeight: '100%', maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.12))'
                  }}
                />
              </div>
            </div>

            {/* Score Ring Display */}
            <div style={{
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
              boxShadow: '0 4px 0 #E2E8F0'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Score</span>
                <div style={{ fontSize: '36px', fontWeight: '950', color: quizPassed ? '#10b981' : '#ef4444', lineHeight: 1 }}>
                  {quizScore}%
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Required Score</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#475569', marginTop: '4px' }}>
                  {activeQuiz.passingScore || activeQuiz.passing_score || 80}% Passing
                </div>
              </div>
            </div>

            {/* Questions Review Table */}
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>
              Evaluation Review
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', maxHeight: '240px', overflowY: 'auto', paddingRight: '8px' }}>
              {activeQuiz.questions.map((q, idx) => {
                const userAnsIdx = selectedAnswers[idx];
                const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correct_option_index;
                const isCorrect = userAnsIdx === correctIdx;

                return (
                  <div 
                    key={idx} 
                    style={{
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      background: isCorrect ? '#F0FDF4' : '#FEF2F2',
                      borderColor: isCorrect ? '#bbf7d0' : '#fecaca',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      boxShadow: '0 4px 0 rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {isCorrect ? (
                        <CheckCircle2 size={18} color="#10b981" style={{ strokeWidth: 3 }} />
                      ) : (
                        <XCircle size={18} color="#ef4444" style={{ strokeWidth: 3 }} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '750', color: '#334155', margin: 0, lineHeight: 1.3 }}>
                        {q.questionText || q.question_text}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', margin: 0, fontWeight: '600' }}>
                        Your answer: <span style={{ color: isCorrect ? '#10b981' : '#ef4444', fontWeight: '800' }}>{q.options[userAnsIdx] || 'None'}</span>
                      </p>
                      {!isCorrect && (
                        <p style={{ fontSize: '12px', color: '#10b981', marginTop: '3px', margin: 0, fontWeight: '800' }}>
                          Correct answer: {q.options[correctIdx]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {!quizPassed && (
                <button
                  onClick={() => handleStartQuiz(activeQuiz)}
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 0 #172554',
                    fontFamily: "'Fredoka', sans-serif"
                  }}
                >
                  <RefreshCw size={12} />
                  Retry Evaluation
                </button>
              )}
              
              <button
                onClick={() => setViewState('LIST')}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #cbd5e1',
                  fontFamily: "'Fredoka', sans-serif"
                }}
              >
                Back to Quizzes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EmployeeQuizzes;
