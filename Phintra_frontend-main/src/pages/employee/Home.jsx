import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Trophy, Zap, Flame, BookOpen, Mail, TrendingUp,
  CheckCircle, AlertTriangle, Play, ChevronRight, Star, Target,
  Award, Clock, ArrowRight, Users, Lock, Shield
} from 'lucide-react';
import celebrationImg from '../../assets/celebration.png';
import shieldLowImg from '../../assets/shield_low.png';
import shieldMidImg from '../../assets/shield_mid.png';
import shieldHighImg from '../../assets/shield_high.png';
import securityScoreIcon from '../../assets/security_score_icon.png';
import rewardXpIcon from '../../assets/reward_xp_icon.png';
import leaderboardIcon from '../../assets/leaderboard_icon.png';
import trainingModulesIcon from '../../assets/training_modules_icon.png';

/* ─── tiny animated counter ─── */
const Counter = ({ value, suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) { setDisplay(value); return; }
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
};

const StatCard = ({ icon: Icon, imgSrc, imgSize, label, value, suffix, sub, cardBg, cardBorder, textColor, iconColor, iconBg, delay = 0 }) => {
  const finalSize = imgSize || '100px';
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
      style={{
        background: cardBg || '#fff',
        border: `1px solid ${cardBorder || '#e2e8f0'}`,
        borderRadius: '20px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        cursor: 'default',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{
            fontSize: '10px',
            color: textColor || '#10b981',
            fontWeight: '800',
            background: 'rgba(255, 255, 255, 0.45)',
            padding: '2px 8px',
            borderRadius: '99px',
            border: `1px solid ${cardBorder || 'rgba(0,0,0,0.05)'}`,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            ↑ Live
          </span>
        </div>
        <div style={{ fontSize: '32px', fontWeight: '900', color: textColor || '#0f172a', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
          <Counter value={value} suffix={suffix} />
        </div>
        <div style={{ fontSize: '13px', fontWeight: '800', color: textColor || '#0f172a', marginTop: '2px' }}>{label}</div>
        <div style={{ fontSize: '12px', color: textColor ? `${textColor}ba` : '#94a3b8', marginTop: '1px', fontWeight: '600' }}>{sub}</div>
      </div>

      <div style={{
        width: imgSrc ? finalSize : '46px',
        height: imgSrc ? finalSize : '46px',
        borderRadius: '14px',
        background: imgSrc ? 'transparent' : iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {imgSrc ? (
          <img src={imgSrc} alt={label} style={{ width: finalSize, height: finalSize, objectFit: 'contain' }} />
        ) : (
          <Icon size={22} color={iconColor || '#fff'} />
        )}
      </div>
    </motion.div>
  );
};

/* ─── streak ring ─── */
const StreakRing = ({ streak }) => {
  const size = 80;
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(streak / 30, 1);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#f59e0b" strokeWidth="6"
          strokeDasharray={`${circ * pct} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <Flame size={16} color="#f59e0b" fill="#f59e0b" />
        <span style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', lineHeight: 1 }}>{streak}</span>
      </div>
    </div>
  );
};

/* ─── badge progression levels ─── */
const BADGES = [
  { level: 1, name: 'Leaf Badge', icon: Award, color: '#22c55e', desc: 'Starting your green journey.' },
  { level: 2, name: 'Wood Badge', icon: Award, color: '#854d0e', desc: 'Building solid foundations.' },
  { level: 3, name: 'Stone Badge', icon: Award, color: '#64748b', desc: 'Unshakable resilience.' },
  { level: 4, name: 'Bronze Badge', icon: Shield, color: '#b45309', desc: 'First metal rank unlocked.' },
  { level: 5, name: 'Silver Badge', icon: Shield, color: '#cbd5e1', desc: 'A shining shield of awareness.' },
  { level: 6, name: 'Gold Badge', icon: Shield, color: '#eab308', desc: 'Gold standard security behavior.' },
  { level: 7, name: 'Platinum Badge', icon: ShieldCheck, color: '#94a3b8', desc: 'Elite resilience level.' },
  { level: 8, name: 'Diamond Badge', icon: Zap, color: '#06b6d4', desc: 'Brilliant awareness under pressure.' },
  { level: 9, name: 'Cyber Shield Badge', icon: ShieldCheck, color: '#0d9488', desc: 'Your shield is digital and hardened.' },
  { level: 10, name: 'Phishing Hunter Badge', icon: Target, color: '#ef4444', desc: 'Expert in catching phishing lures.' },
  { level: 11, name: 'Security Defender Badge', icon: Lock, color: '#2563eb', desc: 'Defender of the digital perimeter.' },
  { level: 12, name: 'Threat Guardian Badge', icon: ShieldCheck, color: '#7c3aed', desc: 'Guardian against emerging exploits.' },
  { level: 13, name: 'Human Firewall Badge', icon: Users, color: '#0f766e', desc: 'An impenetrable line of defense.' },
  { level: 14, name: 'Elite Protector Badge', icon: Star, color: '#f59e0b', desc: 'Protector of the entire workforce.' },
  { level: 15, name: 'Cyber Champion Badge', icon: Trophy, color: '#eab308', desc: 'Supreme master of security awareness.' }
];

/* ─── main component ─── */
const UserHome = () => {
  const { currentUser, trainingModules, simulations, certificates } = useAppContext();
  const navigate = useNavigate();

  const xp = currentUser?.rewards_balance || 1010;
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const securityScore = currentUser?.securityScore || 80;
  const rank = currentUser?.leaderboard_rank || 1;
  const streak = currentUser?.streakDays || 4;
  const completedCount = (trainingModules || []).filter(m => m.isCompleted).length;
  const totalCount = (trainingModules || []).length || 1;
  const completionPct = Math.round((completedCount / totalCount) * 100);

  const pendingModules = (trainingModules || []).filter(m => !m.isCompleted);
  const nextCourse = pendingModules[0] || null;

  const recentReports = (simulations || []).filter(s => s.result === 'Reported' || s.interaction_status === 'Reported');
  const recentCerts = (certificates || []).slice(0, 2);

  const firstName = currentUser?.name?.split(' ')[0] || 'Agent';

  const currentBadgeIndex = Math.min(level - 1, 14);
  const currentBadgeName = BADGES[currentBadgeIndex].name;
  const nextBadgeName = level < 15 ? BADGES[Math.min(level, 14)].name : 'Max Tier Achieved';
  const xpNeeded = level < 15 ? (level * 100) - xp : 0;

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const targetScroll = Math.max(0, 1200 - 450 - ((level - 1) / 14) * (1200 - 450));
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = targetScroll;
        }
      }, 100);
    }
  }, [level]);

  const points = BADGES.map((b, idx) => {
    const t = idx / 14;
    const y = 92 - t * 84;
    const x = 50 + Math.sin(t * Math.PI * 3) * 25;
    return { ...b, x, y };
  });

  /* greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const isLow = securityScore < 34;
  const scoreColor = securityScore >= 68 ? '#10b981' : securityScore >= 34 ? '#f59e0b' : '#ef4444';
  const textColor = '#0f172a';
  const cardBg = securityScore >= 68 
    ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' 
    : securityScore >= 34 
      ? 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)' 
      : 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)';
  const cardBorder = securityScore >= 68 ? '#bbf7d0' : securityScore >= 34 ? '#fed7aa' : '#fecdd3';
  const statusLabel = securityScore >= 68 ? 'HIGH' : securityScore >= 34 ? 'MEDIUM' : 'LOW';

  const standingImg = securityScore < 34 
    ? shieldLowImg 
    : securityScore < 68 
      ? shieldMidImg 
      : shieldHighImg;

  return (
    <div style={{ fontFamily: "'Inter', 'Outfit', sans-serif", maxWidth: '1200px', margin: '0 auto' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shieldFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        .shield-standing-mascot-wrapper {
          position: absolute;
          right: -24px;
          bottom: -30px;
          width: 210px;
          height: 240px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
          animation: shieldFloat 3.2s infinite ease-in-out;
        }
        @media (max-width: 768px) {
          .shield-standing-mascot-wrapper {
            width: 160px;
            height: 185px;
            right: -15px;
            bottom: -20px;
          }
        }
        @media (max-width: 480px) {
          .shield-standing-mascot-wrapper {
            display: none !important;
          }
        }

        /* Badge Roadmap Styles */
        @keyframes badgePulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); transform: scale(1); }
          70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); transform: scale(1.03); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); transform: scale(1); }
        }
        .badge-current-pulse {
          animation: badgePulse 2s infinite ease-in-out;
        }
        .roadmap-badge-node {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .roadmap-badge-node:hover {
          transform: translateY(-2px) scale(1.05);
        }
        .emp-roadmap-scroll-container::-webkit-scrollbar {
          width: 5px;
        }
        .emp-roadmap-scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .emp-roadmap-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .emp-roadmap-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      ` }} />

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #090e1a 0%, #0f172a 60%, #1e3a8a 100%)',
          borderRadius: '24px',
          padding: '36px 40px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'visible',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 20px 40px -15px rgba(37,99,235,0.35)',
        }}
      >
        {/* inner glow blobs clipped */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '23px', overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', left: '35%', bottom: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        {/* Celebration Pop-out Graphic */}
        <div className="emp-hero-celebration-wrapper" style={{
          position: 'absolute',
          right: '40px',
          bottom: '-12px',
          height: '240px',
          width: '240px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 3
        }}>
          <img
            src={celebrationImg}
            alt="Celebration"
            style={{
              maxHeight: '105%',
              maxWidth: '105%',
              objectFit: 'contain',
              transform: 'scale(1.15)',
              transformOrigin: 'bottom center',
              filter: 'drop-shadow(0 15px 30px rgba(37,99,235,0.3)) drop-shadow(0 4px 10px rgba(0,0,0,0.2))'
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Text */}
          <div style={{ flex: 1, minWidth: '260px', maxWidth: '520px' }} className="emp-hero-text-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa', fontSize: '11px', fontWeight: '800', padding: '3px 12px', borderRadius: '99px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Level {level} Agent
              </span>
              <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '99px' }}>
                ✦ Active
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>
              {greeting}, {firstName}! 👋
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.6, fontWeight: '500', maxWidth: '480px' }}>
              You're on a <strong style={{ color: '#fbbf24' }}>{streak}-day streak</strong>. Complete trainings, report phishing emails, and protect your organization.
            </p>

            {/* XP Bar */}
            <div style={{ marginTop: '20px', maxWidth: '380px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={11} color="#f59e0b" /> XP to Level {level + 1}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{xpInLevel} / 100 XP</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, xpInLevel)}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #2563EB, #06B6D4)', borderRadius: '99px' }}
                />
              </div>
            </div>
          </div>

          {/* Streak Ring & CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 4 }} className="emp-hero-right-container">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <StreakRing streak={streak} />
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Day Streak</span>
            </div>

            {/* Quick CTA */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(37,99,235,0.45)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/user/report')}
              style={{
                background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                flexShrink: 0
              }}
            >
              <Mail size={16} /> Report Threat
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats & Shield Standing Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        marginBottom: '28px'
      }} className="emp-stats-shield-grid">
        {/* Left: 2x2 grid of StatCards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <StatCard
            imgSrc={securityScoreIcon}
            label="Security Score"
            value={securityScore}
            suffix="/100"
            sub="Overall safety rating"
            cardBg="linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
            cardBorder="#bbf7d0"
            textColor="#14532d"
            iconBg="linear-gradient(135deg, #10b981, #059669)"
            iconColor="#ffffff"
            delay={0.05}
          />
          <StatCard
            imgSrc={rewardXpIcon}
            imgSize="135px"
            label="Total XP"
            value={xp}
            suffix=" XP"
            sub="Accumulated rewards"
            cardBg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
            cardBorder="#fde68a"
            textColor="#78350f"
            iconBg="linear-gradient(135deg, #f59e0b, #d97706)"
            iconColor="#ffffff"
            delay={0.1}
          />
          <StatCard
            imgSrc={leaderboardIcon}
            label="Leaderboard Rank"
            value={`#${rank}`}
            suffix=""
            sub="Company standings"
            cardBg="linear-gradient(135deg, #F5F3FF 0%, #E0E7FF 100%)"
            cardBorder="#c7d2fe"
            textColor="#4338ca"
            iconBg="linear-gradient(135deg, #6366f1, #4f46e5)"
            iconColor="#ffffff"
            delay={0.15}
          />
          <StatCard
            imgSrc={trainingModulesIcon}
            label="Training Done"
            value={completionPct}
            suffix="%"
            sub={`${completedCount} of ${totalCount} modules`}
            cardBg="linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)"
            cardBorder="#bae6fd"
            textColor="#0369a1"
            iconBg="linear-gradient(135deg, #0284c7, #0369a1)"
            iconColor="#ffffff"
            delay={0.2}
          />
        </div>

        {/* Right: Shield Standing Card */}
        <div style={{ display: 'flex', width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            whileHover={{ scale: 1.02, y: -4, boxShadow: `0 20px 40px -10px ${scoreColor}30, 0 8px 24px rgba(0,0,0,0.05)` }}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '24px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '14px',
              position: 'relative',
              overflow: 'visible',
              boxShadow: `0 15px 35px -10px ${scoreColor}15, 0 4px 20px rgba(0,0,0,0.02)`,
              transition: 'all 0.3s ease',
              width: '100%',
              maxWidth: '100%',
              alignSelf: 'stretch',
              zIndex: 5
            }}
          >
            {/* Cyber decorative grid (subtle light grid) */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              opacity: 0.8,
              pointerEvents: 'none',
              borderRadius: '24px'
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: `linear-gradient(90deg, transparent, ${scoreColor}, transparent)`
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', zIndex: 2, paddingRight: '80px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '900', color: textColor, opacity: 0.8, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                Shield Standing
              </h3>
              <span style={{
                fontSize: '9px', fontWeight: '800', color: scoreColor,
                background: '#fff',
                border: `1px solid ${cardBorder}`,
                padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                Online
              </span>
            </div>

            {/* Circular gauge */}
            <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, marginLeft: '12px' }}>
              {/* Background glow blob */}
              <div style={{
                position: 'absolute',
                width: '80px', height: '80px', borderRadius: '50%',
                background: scoreColor, filter: 'blur(30px)', opacity: 0.08,
                pointerEvents: 'none'
              }} />

              <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="7" />
                <motion.circle
                  cx="55" cy="55" r="42" fill="none"
                  stroke={scoreColor}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - securityScore / 100) }}
                  transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                  style={{ filter: `drop-shadow(0 0 4px ${scoreColor}80)` }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <span className="gamified-metric" style={{
                  fontSize: '28px',
                  fontWeight: '950',
                  color: textColor,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}>
                  {securityScore}
                </span>
                <span className="gamified-metric" style={{ fontSize: '8px', color: textColor, opacity: 0.7, fontWeight: '800', marginTop: '2px', letterSpacing: '0.05em' }}>/ 100 PTS</span>
              </div>
            </div>

            {/* Tactical Standing Tier */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', zIndex: 2, paddingLeft: '12px' }}>
              <div style={{ fontSize: '9px', fontWeight: '800', color: textColor, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Tactical Standing
              </div>
              <div style={{
                fontSize: isLow ? '11px' : '13px',
                fontWeight: '900',
                color: textColor,
                background: '#fff',
                border: `1px solid ${cardBorder}`,
                padding: isLow ? '3px 12px' : '5px 18px',
                borderRadius: '10px',
                letterSpacing: '0.1em',
                boxShadow: `0 4px 12px ${scoreColor}15`,
                textAlign: 'center',
                minWidth: '90px',
                textTransform: 'uppercase'
              }}>
                {statusLabel}
              </div>
            </div>

            {/* Floating Character overlapping popout */}
            <div className="shield-standing-mascot-wrapper" style={{ right: '-5px', bottom: '-5px', height: '220px' }}>
              <img
                src={standingImg}
                alt={`Mascot for status ${statusLabel}`}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.18))'
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Middle Section ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '28px' }} className="emp-home-mid-grid">

        {/* Badge Roadmap — full width */}
          {/* Badge Roadmap Card — Horizontal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
              border: '1px solid rgba(37,99,235,0.3)',
              borderRadius: '20px',
              padding: '20px 24px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(37,99,235,0.15)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }} className="gaming-title">
                <Award size={18} color="#06b6d4" /> Badge Roadmap
              </h3>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#06b6d4', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', padding: '3px 10px', borderRadius: '20px' }}>
                Level {level} / 15
              </span>
            </div>

            {/* Horizontal Scrollable Path */}
            <div
              ref={scrollContainerRef}
              style={{
                overflowX: 'auto',
                overflowY: 'visible',
                paddingBottom: '8px',
                paddingTop: '8px',
              }}
              className="emp-roadmap-scroll-container"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0px',
                width: 'max-content',
                paddingLeft: '12px',
                paddingRight: '12px',
                position: 'relative',
                minHeight: '130px',
              }}>
                {BADGES.map((b, idx) => {
                  const isUnlocked = level >= b.level;
                  const isCurrent = level === b.level;
                  const Icon = b.icon;
                  const isAbove = idx % 2 === 0;

                  // pick a gradient per node based on badge tier
                  const nodeGradient = isCurrent
                    ? 'linear-gradient(135deg, #2563eb, #06b6d4)'
                    : isUnlocked
                      ? idx < 4
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : idx < 7
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                          : idx < 10
                            ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                            : idx < 12
                              ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                              : 'linear-gradient(135deg, #eab308, #ca8a04)'
                      : 'linear-gradient(135deg, #334155, #1e293b)';

                  const connectorColor = isUnlocked
                    ? idx < 4 ? '#10b981' : idx < 7 ? '#f59e0b' : idx < 10 ? '#06b6d4' : idx < 12 ? '#7c3aed' : '#eab308'
                    : '#334155';

                  return (
                    <div key={b.level} style={{ display: 'flex', alignItems: 'center' }}>
                      {/* Node + Label */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        position: 'relative',
                      }}>
                        {/* Label above (even index) */}
                        {isAbove && (
                          <div style={{
                            textAlign: 'center',
                            marginBottom: '2px',
                            maxWidth: '72px',
                          }}>
                            <div style={{
                              fontSize: '9px',
                              fontWeight: '800',
                              color: isCurrent ? '#06b6d4' : isUnlocked ? '#e2e8f0' : '#475569',
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                            }}>
                              {b.name.replace(' Badge', '')}
                            </div>
                          </div>
                        )}

                        {/* Spacer when label is below */}
                        {!isAbove && <div style={{ height: '28px' }} />}

                        {/* Circle Node */}
                        <motion.div
                          whileHover={isUnlocked ? { scale: 1.15, y: -3 } : {}}
                          className={`roadmap-badge-node ${isCurrent ? 'badge-current-pulse' : ''}`}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: nodeGradient,
                            border: isCurrent
                              ? '3px solid #06b6d4'
                              : isUnlocked
                                ? '2px solid rgba(255,255,255,0.2)'
                                : '2px solid #334155',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            opacity: isUnlocked ? 1 : 0.4,
                            boxShadow: isCurrent
                              ? '0 0 24px rgba(6,182,212,0.7), 0 0 8px rgba(37,99,235,0.5), 0 4px 0 rgba(0,0,0,0.4)'
                              : isUnlocked
                                ? '0 4px 12px rgba(0,0,0,0.3), 0 2px 0 rgba(0,0,0,0.4)'
                                : '0 2px 6px rgba(0,0,0,0.2)',
                            cursor: isUnlocked ? 'pointer' : 'default',
                            position: 'relative',
                          }}
                        >
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '900',
                            color: isUnlocked ? '#ffffff' : '#64748b',
                            lineHeight: 1,
                            fontFamily: "'Oxanium', sans-serif",
                          }}>
                            {b.level}
                          </span>
                          {isCurrent && (
                            <span style={{ fontSize: '7px', color: '#bfdbfe', fontWeight: '700', marginTop: '1px' }}>YOU</span>
                          )}
                        </motion.div>

                        {/* Label below (odd index) */}
                        {!isAbove && (
                          <div style={{
                            textAlign: 'center',
                            marginTop: '2px',
                            maxWidth: '72px',
                          }}>
                            <div style={{
                              fontSize: '9px',
                              fontWeight: '800',
                              color: isCurrent ? '#06b6d4' : isUnlocked ? '#e2e8f0' : '#475569',
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                            }}>
                              {b.name.replace(' Badge', '')}
                            </div>
                          </div>
                        )}

                        {/* Spacer when label is above */}
                        {isAbove && <div style={{ height: '28px' }} />}
                      </div>

                      {/* Connector between nodes */}
                      {idx < BADGES.length - 1 && (
                        <div style={{
                          width: '32px',
                          height: '4px',
                          flexShrink: 0,
                          borderRadius: '99px',
                          background: connectorColor,
                          opacity: isUnlocked ? 0.9 : 0.2,
                          boxShadow: isUnlocked ? `0 0 6px ${connectorColor}60` : 'none',
                          position: 'relative',
                          top: '0px',
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { color: '#10b981', label: 'Starter' },
                { color: '#f59e0b', label: 'Bronze–Gold' },
                { color: '#06b6d4', label: 'Cyber' },
                { color: '#7c3aed', label: 'Elite' },
                { color: '#eab308', label: 'Champion' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}80` }} />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>


      </div>

      {/* responsive grid tweak */}
      <style>{`
        @media (max-width: 991px) {
          .emp-hero-celebration-wrapper { display: none !important; }
          .emp-hero-text-container { max-width: 100% !important; }
          .emp-hero-right-container { flex-direction: row !important; width: 100% !important; justify-content: flex-start !important; gap: 24px !important; margin-top: 16px; }
          .emp-home-mid-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 580px) {
          .emp-hero-right-container { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default UserHome;
