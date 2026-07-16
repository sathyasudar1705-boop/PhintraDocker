import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  ShieldCheck, Trophy, Zap, BookOpen, Mail,
  Star, Target, Award, Clock, ArrowRight, Play,
  ChevronRight, Sparkles, Flame, CheckCircle, ShieldAlert,
  Search, Bell, Settings, LogOut, Heart, Lock
} from 'lucide-react';

import celebrationImg from '../../assets/celebration.png';
import shieldLowImg from '../../assets/shield_low.png';
import shieldMidImg from '../../assets/shield_mid.png';
import shieldHighImg from '../../assets/shield_high.png';
import securityScoreIcon from '../../assets/security_score_icon.png';
import rewardXpIcon from '../../assets/reward_xp_icon.png';
import leaderboardIcon from '../../assets/leaderboard_icon.png';
import trainingModulesIcon from '../../assets/training_modules_icon.png';

import badgeLeaf from '../../assets/badge_leaf.png';
import badgeWood from '../../assets/badge_wood.png';
import badgeStone from '../../assets/badge_stone.png';
import badgeSilver from '../../assets/badge_silver.png';
import badgePlatinum from '../../assets/badge_platinum.png';
import badgeCyberShield from '../../assets/badge_cybershield.png';
import badgeDefender from '../../assets/badge_defender.png';
import badgeFirewall from '../../assets/badge_firewall.png';
import badgeBronze from '../../assets/badge_bronze.png';
import badgeGold from '../../assets/badge_gold.png';
import badgeDiamond from '../../assets/badge_diamond.png';
import badgePhishingHunter from '../../assets/badge_phishing_hunter.png';
import badgeThreatGuardian from '../../assets/badge_threat_guardian.png';
import badgeEliteProtector from '../../assets/badge_elite_protector.png';
import badgeCyberChampion from '../../assets/badge_cyber_champion.png';
import badgeLocked from '../../assets/badge_locked.png';
import trophy3d from '../../assets/3d_trophy.png';
import firstReporterBg from '../../assets/first_reporter_bg.jpg';
import trainingStarterBg from '../../assets/training_starter_bg.jpg';
import quizSolverBg from '../../assets/quiz_solver_bg.jpg';
import humanFirewallBg from '../../assets/human_firewall_bg.jpg';
import securityDefenderBg from '../../assets/security_defender_bg.jpg';
const BADGES = [
  { level: 1, name: 'Leaf Badge', color: '#22c55e', desc: 'Starting your green journey.', img: badgeLeaf },
  { level: 2, name: 'Wood Badge', color: '#854d0e', desc: 'Building solid foundations.', img: badgeWood },
  { level: 3, name: 'Stone Badge', color: '#64748b', desc: 'Unshakable resilience.', img: badgeStone },
  { level: 4, name: 'Bronze Badge', color: '#b45309', desc: 'First metal rank unlocked.', img: badgeBronze },
  { level: 5, name: 'Silver Badge', color: '#cbd5e1', desc: 'A shining shield of awareness.', img: badgeSilver },
  { level: 6, name: 'Gold Badge', color: '#eab308', desc: 'Gold standard security behavior.', img: badgeGold },
  { level: 7, name: 'Platinum Badge', color: '#94a3b8', desc: 'Elite resilience level.', img: badgePlatinum },
  { level: 8, name: 'Diamond Badge', color: '#06b6d4', desc: 'Brilliant awareness under pressure.', img: badgeDiamond },
  { level: 9, name: 'Cyber Shield Badge', color: '#0d9488', desc: 'Your shield is digital and hardened.', img: badgeCyberShield },
  { level: 10, name: 'Phishing Hunter Badge', color: '#ef4444', desc: 'Expert in catching phishing lures.', img: badgePhishingHunter },
  { level: 11, name: 'Security Defender Badge', color: '#2563eb', desc: 'Defender of the digital perimeter.', img: badgeDefender },
  { level: 12, name: 'Threat Guardian Badge', color: '#7c3aed', desc: 'Guardian against emerging exploits.', img: badgeThreatGuardian },
  { level: 13, name: 'Human Firewall Badge', color: '#0f766e', desc: 'An impenetrable line of defense.', img: badgeFirewall },
  { level: 14, name: 'Elite Protector Badge', color: '#f59e0b', desc: 'Protector of the entire workforce.', img: badgeEliteProtector },
  { level: 15, name: 'Cyber Champion Badge', color: '#eab308', desc: 'Supreme master of security awareness.', img: badgeCyberChampion }
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: Sparkles },
  { id: 'phishing', label: 'Phishing', icon: Mail },
  { id: 'social', label: 'Social Eng.', icon: Target },
  { id: 'passwords', label: 'Passwords', icon: ShieldCheck },
  { id: 'defense', label: 'Defense', icon: Trophy }
];

const UserHome = () => {
  const { currentUser, trainingModules, simulations, certificates } = useAppContext();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollerRef = useRef(null);

  const getLevelDetails = (totalXp) => {
    const xpVal = Number(totalXp) || 0;
    if (xpVal < 100) {
      return { level: 1, xpInLevel: xpVal, xpMax: 100, xpNeeded: 100 - xpVal, xpPct: Math.round((xpVal / 100) * 100) };
    } else if (xpVal < 250) {
      const inLvl = xpVal - 100;
      return { level: 2, xpInLevel: inLvl, xpMax: 150, xpNeeded: 150 - inLvl, xpPct: Math.round((inLvl / 150) * 100) };
    } else if (xpVal < 500) {
      const inLvl = xpVal - 250;
      return { level: 3, xpInLevel: inLvl, xpMax: 250, xpNeeded: 250 - inLvl, xpPct: Math.round((inLvl / 250) * 100) };
    } else if (xpVal < 800) {
      const inLvl = xpVal - 500;
      return { level: 4, xpInLevel: inLvl, xpMax: 300, xpNeeded: 300 - inLvl, xpPct: Math.round((inLvl / 300) * 100) };
    } else if (xpVal < 1200) {
      const inLvl = xpVal - 800;
      return { level: 5, xpInLevel: inLvl, xpMax: 400, xpNeeded: 400 - inLvl, xpPct: Math.round((inLvl / 400) * 100) };
    } else {
      const base = xpVal - 1200;
      const extraLevels = Math.floor(base / 500);
      const lvl = 6 + extraLevels;
      const inLvl = base % 500;
      return { level: lvl, xpInLevel: inLvl, xpMax: 500, xpNeeded: 500 - inLvl, xpPct: Math.round((inLvl / 500) * 100) };
    }
  };

  const xp = currentUser?.xp ?? currentUser?.rewards_balance ?? 0;
  const levelDetails = getLevelDetails(xp);
  const level = levelDetails.level;
  const xpInLevel = levelDetails.xpInLevel;
  const xpMax = levelDetails.xpMax;
  const xpNeeded = levelDetails.xpNeeded;
  const xpPct = levelDetails.xpPct;
  const securityScore = currentUser?.security_score ?? currentUser?.securityScore ?? 0;
  const rank = currentUser?.leaderboard_rank ?? 'Not Ranked';

  const completedCount = (trainingModules || []).filter(m => m.isCompleted).length;
  const totalCount = (trainingModules || []).length || 1;
  const completionPct = Math.round((completedCount / totalCount) * 100);

  const pendingModules = (trainingModules || []).filter(m => !m.isCompleted);
  const nextCourse = pendingModules[0] || null;

  const recentReports = (simulations || []).filter(s => s.result === 'Reported' || s.interaction_status === 'Reported');
  const recentCerts = (certificates || []).slice(0, 2);

  const firstName = currentUser?.name?.split(' ')[0] || 'Agent';
  const currentBadgeIndex = Math.min(level - 1, 14);
  const currentBadge = BADGES[currentBadgeIndex];

  const milestoneList = [
    { name: "First Reporter", desc: "Spotted first suspicious email", icon: Mail, color: "#3b82f6" },
    { name: "Training Starter", desc: "Completed first training module", icon: BookOpen, color: "#10b981" },
    { name: "Quiz Solver", desc: "Passed first training quiz", icon: Award, color: "#f59e0b" },
    { name: "Human Firewall", desc: "Spotted 5 phishing simulations", icon: ShieldCheck, color: "#7c3aed" },
    { name: "Security Defender", desc: "Reached 1,000 total XP", icon: Trophy, color: "#ec4899" }
  ];
  const dynamicUnlockedBadges = [];
  if ((currentUser?.reported_emails?.length || 0) + (currentUser?.campaigns_reported || 0) >= 1) {
    dynamicUnlockedBadges.push("First Reporter");
  }
  if (completedCount >= 1) {
    dynamicUnlockedBadges.push("Training Starter");
  }
  if ((currentUser?.quiz_results || []).filter(q => q.passed).length >= 1) {
    dynamicUnlockedBadges.push("Quiz Solver");
  }
  if ((currentUser?.campaigns_reported || 0) >= 5) {
    dynamicUnlockedBadges.push("Human Firewall");
  }
  if (xp >= 1000) {
    dynamicUnlockedBadges.push("Security Defender");
  }
  const isUnlocked = (badgeName) => dynamicUnlockedBadges.includes(badgeName);

  // Auto scroll to current badge card on load
  useEffect(() => {
    if (scrollerRef.current) {
      const idx = BADGES.findIndex(b => level === b.level);
      if (idx !== -1) {
        setTimeout(() => {
          if (scrollerRef.current) {
            const containerWidth = scrollerRef.current.clientWidth;
            scrollerRef.current.scrollLeft = idx * containerWidth;
          }
        }, 150);
      }
    }
  }, [level]);

  // Map dummy icons or images to modules
  const getModuleMascot = (modId) => {
    if (modId === 1) return shieldHighImg;
    if (modId === 2) return shieldMidImg;
    return shieldLowImg;
  };

  const getModuleColor = (difficulty) => {
    if (difficulty === 'Easy') return 'rgba(34, 197, 94, 0.1)';
    if (difficulty === 'Medium') return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  };

  const getModuleCategory = (modName) => {
    const name = modName.toLowerCase();
    if (name.includes('phish')) return 'phishing';
    if (name.includes('social') || name.includes('bec')) return 'social';
    if (name.includes('password') || name.includes('credential')) return 'passwords';
    return 'defense';
  };

  // Filter modules
  const filteredModules = (trainingModules || []).filter(m => {
    const matchesCategory = selectedCategory === 'all' || getModuleCategory(m.name) === selectedCategory;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Set default selected module
  useEffect(() => {
    if (filteredModules.length > 0 && !selectedModule) {
      setSelectedModule(filteredModules[0]);
    }
  }, [filteredModules, selectedModule]);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      color: '#1e293b',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
      zIndex: 1,
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto',
      padding: '0 24px 24px 24px',
      boxSizing: 'border-box'
    }}>
      {/* Dynamic Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .hero-mascot-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes badgeGaming {
          0% { transform: translateY(0px) scale(1); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15)); }
          50% { transform: translateY(-8px) scale(1.08); filter: drop-shadow(0 12px 24px rgba(6, 182, 212, 0.6)) drop-shadow(0 8px 12px rgba(37, 99, 235, 0.3)); }
          100% { transform: translateY(0px) scale(1); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15)); }
        }
        .gaming-badge-anim {
          animation: badgeGaming 4s ease-in-out infinite;
        }
        @keyframes badgeTextGlow {
          0% {
            color: #00f2fe;
            text-shadow: 0 0 8px rgba(0, 242, 254, 0.8), 0 0 15px rgba(0, 242, 254, 0.4);
            transform: scale(1);
          }
          50% {
            color: #f43f5e;
            text-shadow: 0 0 12px rgba(244, 63, 94, 0.9), 0 0 25px rgba(244, 63, 94, 0.5);
            transform: scale(1.08);
          }
          100% {
            color: #00f2fe;
            text-shadow: 0 0 8px rgba(0, 242, 254, 0.8), 0 0 15px rgba(0, 242, 254, 0.4);
            transform: scale(1);
          }
        }
        .current-badge-name-glow {
          font-family: 'Finovasi', 'Orbitron', 'Rajdhani', 'Oxanium', sans-serif !important;
          font-size: 15px !important;
          font-weight: 900 !important;
          letter-spacing: 1.5px;
          display: inline-block;
          text-transform: uppercase;
          animation: badgeTextGlow 3.5s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />

      {/* ── Main Layout Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '12px'
      }} className="emp-dashboard-grid-main">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Hero Banner Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            borderRadius: '28px',
            padding: '24px 28px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(30, 41, 59, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '150px'
          }}>
            {/* Background design elements */}
            <div style={{ position: 'absolute', right: '15%', top: '-20%', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)', filter: 'blur(30px)' }} />
            <div style={{ position: 'absolute', left: '10%', bottom: '-30%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)', filter: 'blur(25px)' }} />

            <div style={{ position: 'relative', zIndex: 5, maxWidth: '60%' }}>
              <span style={{
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '900',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '4px 12px',
                borderRadius: '99px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontFamily: "'Fredoka', sans-serif"
              }}>
                Simulation Active
              </span>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '950',
                color: '#ffffff',
                lineHeight: '1.2',
                marginTop: '10px',
                marginBottom: '8px',
                fontFamily: "'Fredoka', sans-serif",
                textShadow: '0 2px 0 rgba(0,0,0,0.3)'
              }}>
                Ready for Your Next Security Challenge?
              </h2>
              <p style={{ color: '#dbeafe', fontSize: '13px', lineHeight: '1.5', marginBottom: '14px', fontWeight: '500', fontFamily: "'Inter', sans-serif" }}>
                Complete simulations, improve your score, and become a stronger human firewall.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/user/report')}
                style={{
                  background: '#ffffff',
                  color: '#1e3a8a',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  borderBottom: '4px solid #b0bec5',
                  borderRadius: '16px',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: '900',
                  fontFamily: "'Fredoka', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.4)'
                }}
              >
                <Play size={14} fill="#1e3a8a" color="#1e3a8a" />
                Play Now
              </motion.button>
            </div>

            {/* Mascot Image */}
            <div className="hero-mascot-float" style={{
              position: 'relative',
              width: '240px',
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}>
              <img
                src={celebrationImg}
                alt="Celebration Mascot"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
              />
            </div>
          </div>

          {/* Quick Action Buttons Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            width: '100%',
            marginTop: '8px',
            marginBottom: '8px'
          }}>
            {[
              { label: 'Start Training', path: '/user/training', icon: BookOpen, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.15)' },
              { label: 'Report Email', path: '/user/report', icon: Mail, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.15)' },
              { label: 'Take Quiz', path: '/user/quizzes', icon: ShieldCheck, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.15)' },
              { label: 'Leaderboard', path: '/user/leaderboard', icon: Trophy, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' }
            ].map((btn, idx) => (
              <motion.button
                key={idx}
                whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(btn.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px',
                  background: '#ffffff',
                  border: `1px solid ${btn.border}`,
                  borderBottom: `4px solid ${btn.color}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: btn.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: btn.color
                }}>
                  <btn.icon size={16} />
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '850',
                  color: '#1e293b',
                  fontFamily: "'Fredoka', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {btn.label}
                </span>
              </motion.button>
            ))}
          </div>



          {/* Current Progress bar ("Last Download") */}
          {nextCourse && (
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              boxShadow: '0 4px 18px rgba(0,0,0,0.02)',
              border: '1px solid rgba(0, 0, 0, 0.01)',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1'
                }}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px 0' }}>
                    {nextCourse.name}
                  </h4>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#a855f7',
                    background: 'rgba(168, 85, 247, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {nextCourse.difficulty}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${nextCourse.progress || 10}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                    borderRadius: '99px'
                  }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {nextCourse.progress || 0}% Complete
                </span>
              </div>

              {/* CTA button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/user/training')}
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  color: '#6366f1',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Resume
                <ChevronRight size={14} />
              </motion.button>
            </div>
          )}

        </div>
      {/* ── Badge Roadmap Card (Restructured) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.3)',
        width: '350px',
        maxWidth: '100%',
        height: 'fit-content',
        color: '#ffffff'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
            <Award size={18} color="#06b6d4" /> Badge Status
          </h3>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#06b6d4', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', padding: '3px 10px', borderRadius: '20px', fontFamily: "'Fredoka', sans-serif" }}>
            LVL {level}
          </span>
        </div>

        {/* Current Badge Slot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <img 
            src={currentBadge?.img || badgeLeaf} 
            alt="Current Badge" 
            style={{ width: '48px', height: '48px', objectFit: 'contain', filter: `drop-shadow(0 0 8px ${currentBadge?.color || '#06b6d4'})` }} 
          />
          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>Current Badge</div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', fontFamily: "'Fredoka', sans-serif" }}>{currentBadge?.name || 'Leaf Badge'}</div>
          </div>
        </div>

        {/* Next Badge Slot */}
        {level < 15 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.01)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
            <img 
              src={BADGES[level]?.img || badgeLocked} 
              alt="Next Badge" 
              style={{ width: '48px', height: '48px', objectFit: 'contain', opacity: 0.6 }} 
            />
            <div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>Next Badge</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#cbd5e1', fontFamily: "'Fredoka', sans-serif" }}>{BADGES[level]?.name || 'Wood Badge'}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.01)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', fontFamily: "'Fredoka', sans-serif" }}>★ Cyber Champion Max Level ★</div>
          </div>
        )}

        {/* XP Gap Indicator */}
        {level < 15 && (
          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>
              <span style={{ color: '#94a3b8' }}>{xp} XP</span>
              <span style={{ color: '#06b6d4' }}>{xp + (100 - xpInLevel)} XP</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${xpInLevel}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: '99px' }} />
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', marginTop: '6px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
              <span style={{ color: '#06b6d4', fontWeight: '800' }}>{100 - xpInLevel} XP</span> needed to unlock next badge
            </div>
          </div>
        )}
      </div>
      
      </div>

      {/* Row of 4 Separate Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        width: '100%',
        marginTop: '12px'
      }}>
        {/* Card 1: Security Score */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(16, 185, 129, 0.12)' }}
          style={{
            background: '#f0fdf4',
            borderRadius: '24px',
            padding: '24px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#d1fae5',
            borderTopWidth: '4px',
            borderTopColor: '#10b981',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '170px'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>Security Health</span>
            <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#065f46', margin: '4px 0 0 0', textTransform: 'uppercase', fontFamily: "'Fredoka', sans-serif" }}>Security Score</h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: `conic-gradient(#10b981 ${securityScore}%, #ffffff 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%', background: '#f0fdf4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '900', color: '#065f46', fontFamily: "'Fredoka', sans-serif"
              }}>{securityScore}%</div>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '900', color: '#10b981', fontFamily: "'Fredoka', sans-serif" }}>
                {securityScore >= 90 ? 'Excellent' : securityScore >= 70 ? 'Good' : 'Needs Review'}
              </div>
              <span style={{ fontSize: '11px', color: '#047857', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>Overall rate</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: XP & Level */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(99, 102, 241, 0.12)' }}
          style={{
            background: '#eef2ff',
            borderRadius: '24px',
            padding: '24px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#e0e7ff',
            borderTopWidth: '4px',
            borderTopColor: '#6366f1',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '170px'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>Rewards & Level</span>
            <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#3730a3', margin: '4px 0 0 0', textTransform: 'uppercase', fontFamily: "'Fredoka', sans-serif" }}>XP & Level</h4>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#6366f1', fontFamily: "'Fredoka', sans-serif" }}>Lvl {level}</span>
              <span style={{ fontSize: '12px', fontWeight: '900', color: '#4f46e5', fontFamily: "'Fredoka', sans-serif" }}>{xp} XP</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#ffffff', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${xpPct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '99px' }} />
            </div>
            <span style={{ display: 'block', marginTop: '6px', fontSize: '10px', color: '#4338ca', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>
              {xpNeeded} XP to Lvl {level + 1}
            </span>
          </div>
        </motion.div>

        {/* Card 3: Leaderboard Rank */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(168, 85, 247, 0.12)' }}
          style={{
            background: '#faf5ff',
            borderRadius: '24px',
            padding: '24px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#f3e8ff',
            borderTopWidth: '4px',
            borderTopColor: '#a855f7',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '170px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>Leaderboard</span>
            <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#6b21a8', margin: '4px 0 0 0', textTransform: 'uppercase', fontFamily: "'Fredoka', sans-serif" }}>Leaderboard Rank</h4>
            <div style={{ fontSize: '20px', fontWeight: '950', color: '#a855f7', marginTop: '12px', fontFamily: "'Fredoka', sans-serif" }}>Rank #{rank}</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Number(rank) === 1 ? (
              <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DotLottieReact
                  src="https://lottie.host/b49f4904-5049-45bf-ab9a-f42f52c58c87/znBfNFo73e.lottie"
                  loop={false}
                  autoplay
                  speed={0.3}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <div style={{
                width: '56px', height: '56px', borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#a855f7',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}>
                <Trophy size={28} fill="#a855f7" color="#a855f7" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Card 4: Training Progress */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(245, 158, 11, 0.12)' }}
          style={{
            background: '#fffbeb',
            borderRadius: '24px',
            padding: '24px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#fef3c7',
            borderTopWidth: '4px',
            borderTopColor: '#f59e0b',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '170px',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>Modules</span>
              <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#92400e', margin: '4px 0 0 0', textTransform: 'uppercase', fontFamily: "'Fredoka', sans-serif" }}>Training Progress</h4>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: '#92400e', fontWeight: '900', fontFamily: "'Fredoka', sans-serif" }}>
                <span>{completedCount} of {totalCount} Modules Completed</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#ffffff', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${completionPct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #eab308)', borderRadius: '99px' }} />
              </div>
              <span style={{ display: 'block', marginTop: '6px', fontSize: '10px', color: '#b45309', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>
                {completedCount === 0 ? 'Start your first training' : `${completionPct}% completion`}
              </span>
            </div>
          </div>
          
          <div style={{ width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '8px' }}>
            <DotLottieReact
              src="https://lottie.host/826122de-86e9-43aa-9f44-a05b63a50def/N2nSWcs2ov.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%', transform: 'scale(1.25)', transformOrigin: 'center' }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Milestone Achievements ── */}
      <div style={{ width: '100%', marginTop: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>Milestone Badges</span>
          <h2 style={{ fontSize: '22px', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Fredoka', sans-serif" }}>Earned Achievements</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '500', fontFamily: "'Inter', sans-serif" }}>Track your progression and unlock badges through real activities</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', width: '100%' }}>
          {milestoneList.map((badge, idx) => {
            const isFirstReporter = badge.name === "First Reporter";
            const isTrainingStarter = badge.name === "Training Starter";
            const isQuizSolver = badge.name === "Quiz Solver";
            const isHumanFirewall = badge.name === "Human Firewall";
            const isSecurityDefender = badge.name === "Security Defender";
            const unlocked = isUnlocked(badge.name);
            const IconComponent = badge.icon;
            const hexToRgb = (hex) => {
              const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
              const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
              return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
            };
            const isCustomBg = (isFirstReporter || isTrainingStarter || isQuizSolver || isHumanFirewall || isSecurityDefender) && unlocked;
            const cardBgImage = !unlocked
              ? 'none'
              : (isFirstReporter
                ? `linear-gradient(rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.75)), url(${firstReporterBg})`
                : (isTrainingStarter
                  ? `linear-gradient(rgba(15, 23, 42, 0.15), rgba(15, 23, 42, 0.78)), url(${trainingStarterBg})`
                  : (isQuizSolver
                    ? `linear-gradient(rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.72)), url(${quizSolverBg})`
                    : (isHumanFirewall
                      ? `linear-gradient(rgba(15, 23, 42, 0.22), rgba(15, 23, 42, 0.76)), url(${humanFirewallBg})`
                      : (isSecurityDefender
                        ? `linear-gradient(rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.74)), url(${securityDefenderBg})`
                        : 'none')))));
            const cardBgColor = '#ffffff';
            return (
              <motion.div
                key={idx}
                whileHover={unlocked ? { y: -5, scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' } : {}}
                style={{
                  backgroundImage: cardBgImage,
                  backgroundColor: cardBgColor,
                  backgroundSize: isCustomBg ? 'cover' : 'auto',
                  backgroundPosition: isCustomBg ? 'center' : 'initial',
                  border: unlocked
                    ? (isFirstReporter ? '2px solid #eab308' : (isTrainingStarter ? '2px solid #10b981' : (isQuizSolver ? '2px solid #f59e0b' : (isHumanFirewall ? '2px solid #7c3aed' : '2px solid #3b82f6'))))
                    : '1.5px dashed #cbd5e1',
                  borderRadius: '24px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '8px',
                  position: 'relative',
                  opacity: unlocked ? 1 : 0.55,
                  filter: unlocked ? 'none' : 'grayscale(0.8)',
                  transition: 'border 0.3s, opacity 0.3s',
                  boxShadow: unlocked
                    ? (isFirstReporter ? '0 10px 20px rgba(234, 179, 8, 0.2)' : (isTrainingStarter ? '0 10px 20px rgba(16, 185, 129, 0.2)' : (isQuizSolver ? '0 10px 20px rgba(245, 158, 11, 0.2)' : (isHumanFirewall ? '0 10px 20px rgba(124, 58, 237, 0.2)' : '0 10px 20px rgba(59, 130, 246, 0.2)'))))
                    : 'none'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: isCustomBg ? 'rgba(255, 255, 255, 0.2)' : (unlocked ? `rgba(${hexToRgb(badge.color)}, 0.1)` : '#f1f5f9'),
                  color: isCustomBg ? '#ffffff' : (unlocked ? badge.color : '#94a3b8'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                  boxShadow: isCustomBg ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none'
                }}>
                  <IconComponent size={24} />
                </div>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '950', 
                  color: isCustomBg ? '#ffffff' : '#0f172a', 
                  margin: 0, 
                  fontFamily: "'Fredoka', sans-serif",
                  textShadow: isCustomBg ? '0 1px 3px rgba(0,0,0,0.5)' : 'none'
                }}>
                  {badge.name}
                </h4>
                <p style={{ 
                  fontSize: '11px', 
                  color: isCustomBg ? '#f8fafc' : '#64748b', 
                  margin: 0, 
                  lineHeight: '1.3', 
                  fontWeight: '800', 
                  fontFamily: "'Inter', sans-serif",
                  textShadow: isCustomBg ? '0 1px 3px rgba(0,0,0,0.5)' : 'none'
                }}>
                  {badge.desc}
                </p>
                {!unlocked && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    color: '#94a3b8'
                  }}>
                    <Lock size={14} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Full-Width Badge Journey Roadmap ── */}
      <div style={{ width:'100%', marginTop:'12px', borderRadius:'28px', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.03)', border:'1px solid #e2e8f0' }}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', borderBottom: '1px solid #e2e8f0', padding:'24px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:'8%', top:'-40%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', filter:'blur(30px)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', right:'12%', bottom:'-40%', width:'180px', height:'180px', borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)', filter:'blur(25px)', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
              <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px rgba(16, 185, 129, 0.4)' }} />
              <span style={{ fontSize:'11px', fontWeight:'800', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.12em', fontFamily: "'Inter', sans-serif" }}>Security Badge Journey</span>
            </div>
            <h2 style={{ fontSize:'22px', fontWeight:'950', color:'#0f172a', margin:0, letterSpacing:'-0.02em', fontFamily: "'Fredoka', sans-serif" }}>Your Path to Cyber Mastery</h2>
            <p style={{ fontSize:'13px', color:'#64748b', margin:'4px 0 0 0', fontWeight:'500', fontFamily: "'Inter', sans-serif" }}>Complete trainings and reports to unlock every badge tier</p>
          </div>
          <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'32px', fontWeight:'950', color:'#0f172a', lineHeight:1, fontFamily:"'Fredoka', sans-serif" }}>Lvl {level}</div>
              <div style={{ fontSize:'11px', color:'#64748b', fontWeight:'700', marginTop:'2px', fontFamily: "'Inter', sans-serif" }}>Current Level</div>
            </div>
            <div style={{ width:'1px', height:'40px', background:'#e2e8f0' }} />
            <div style={{ minWidth:'180px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <span style={{ fontSize:'12px', fontWeight:'800', color:'#4f46e5', fontFamily: "'Fredoka', sans-serif" }}>{xp} XP</span>
                <span style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', fontFamily: "'Inter', sans-serif" }}>Next: {xp + xpNeeded} XP</span>
              </div>
              <div style={{ width:'100%', height:'8px', background:'#e2e8f0', borderRadius:'99px', overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${xpPct}%` }} transition={{ duration:1.2, ease:'easeOut', delay:0.3 }} style={{ height:'100%', background:'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius:'99px' }} />
              </div>
              <div style={{ fontSize:'10px', color:'#64748b', fontWeight:'600', marginTop:'4px', fontFamily: "'Inter', sans-serif" }}>{xpNeeded} XP to Level {level + 1}</div>
            </div>
            <div style={{ width:'1px', height:'40px', background:'#e2e8f0' }} />
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'32px', fontWeight:'950', color:'#06b6d4', lineHeight:1, fontFamily:"'Fredoka', sans-serif" }}>{completionPct}%</div>
              <div style={{ fontSize:'11px', color:'#64748b', fontWeight:'700', marginTop:'2px', fontFamily: "'Inter', sans-serif" }}>Trained</div>
            </div>
          </div>
        </div>

        {/* Badge Track */}
        <div style={{ background:'#ffffff', padding:'36px 32px 28px 32px', overflowX:'auto' }} className="custom-scrollbar">
          <div style={{ display:'flex', alignItems:'flex-start', minWidth:'max-content' }}>
            {BADGES.map((b, idx) => {
              const isUnlocked = level >= b.level;
              const isCurrent = level === b.level;
              const isNext = level + 1 === b.level;
              const isLast = idx === BADGES.length - 1;
              return (
                <div key={b.level} style={{ display:'flex', alignItems:'center' }}>
                  <motion.div whileHover={{ y:-8, scale:1.06 }} transition={{ type:'spring', stiffness:280, damping:18 }} style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'108px', position:'relative', cursor: isUnlocked ? 'pointer' : 'default' }}>
                    <div style={{ fontSize:'9px', fontWeight:'900', letterSpacing:'0.08em', color: isCurrent ? '#06b6d4' : isUnlocked ? '#64748b' : '#94a3b8', background: isCurrent ? 'rgba(6,182,212,0.08)' : '#f8fafc', border:`1px solid ${isCurrent ? 'rgba(6,182,212,0.3)' : '#e2e8f0'}`, padding:'2px 8px', borderRadius:'99px', marginBottom:'10px', fontFamily: "'Fredoka', sans-serif" }}>LVL {b.level}</div>
                    {isUnlocked && <div style={{ position:'absolute', top:'22px', width:'80px', height:'80px', borderRadius:'50%', background:`radial-gradient(circle, ${b.color}20 0%, transparent 70%)`, filter:'blur(8px)', pointerEvents:'none' }} />}
                    {isCurrent && (
                      <motion.div animate={{ scale:[1,1.25,1], opacity:[0.8,0.1,0.8] }} transition={{ duration:2.2, repeat:Infinity, ease:'easeInOut' }} style={{ position:'absolute', top:'22px', width:'86px', height:'86px', borderRadius:'50%', border:`2px solid ${b.color}`, pointerEvents:'none' }} />
                    )}
                    <img src={isUnlocked ? b.img : badgeLocked} alt={b.name} className={isCurrent ? 'gaming-badge-anim' : ''} style={{ width: isCurrent ? '78px' : isUnlocked ? '64px' : '52px', height: isCurrent ? '78px' : isUnlocked ? '64px' : '52px', objectFit:'contain', opacity: isUnlocked ? 1 : 0.25, filter: isCurrent ? `drop-shadow(0 0 14px ${b.color}) drop-shadow(0 0 6px ${b.color})` : isUnlocked ? `drop-shadow(0 4px 10px ${b.color}50)` : 'grayscale(1)', position:'relative', zIndex:1, transition:'all 0.3s ease', marginBottom:'10px' }} />
                    {isUnlocked && (
                      <span style={{ fontSize: isCurrent ? '11px' : '9px', fontWeight:'800', color: isCurrent ? '#0f172a' : '#64748b', textAlign:'center', lineHeight:1.3, maxWidth:'90px', fontFamily: "'Fredoka', sans-serif" }}>{b.name.replace(' Badge','')}</span>
                    )}
                    {isCurrent && <motion.div animate={{ y:[0,-3,0] }} transition={{ duration:1.4, repeat:Infinity, ease:'easeInOut' }} style={{ marginTop:'6px', fontSize:'8px', fontWeight:'900', color:'#ffffff', background:'#06b6d4', padding:'2px 8px', borderRadius:'99px', letterSpacing:'0.08em', whiteSpace:'nowrap', fontFamily: "'Fredoka', sans-serif" }}>▼ YOU ARE HERE</motion.div>}
                    {isNext && <div style={{ marginTop:'6px', fontSize:'8px', fontWeight:'800', color:'#f59e0b', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', padding:'2px 7px', borderRadius:'99px', whiteSpace:'nowrap', fontFamily: "'Fredoka', sans-serif" }}>NEXT UP</div>}
                  </motion.div>
                  {!isLast && (
                    <div style={{ width:'28px', height:'3px', flexShrink:0, marginBottom:'52px', borderRadius:'99px', background: level > b.level ? `linear-gradient(90deg, ${b.color}, ${BADGES[idx+1].color})` : isCurrent ? `linear-gradient(90deg, ${b.color}80, #e2e8f0)` : '#e2e8f0', position:'relative' }}>
                      {level > b.level && <div style={{ position:'absolute', right:'-4px', top:'50%', transform:'translateY(-50%)', width:'8px', height:'8px', borderRadius:'50%', background:BADGES[idx+1].color, boxShadow:`0 0 8px ${BADGES[idx+1].color}` }} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile responsive overrides */}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          .emp-dashboard-grid-main {
            grid-template-columns: 1fr !important;
          }
        }
      ` }} />
    </div>
  );
};

export default UserHome;
