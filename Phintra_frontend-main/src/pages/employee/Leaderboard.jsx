import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import api from '../../services/api';
import LeaderboardPodium from '../../components/user/LeaderboardPodium';

/* ──────────────────────────────────────────────
   Rank-row colour config (matches gamified look)
────────────────────────────────────────────── */
const RANK_STYLES = [
  { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',  shadow: 'rgba(239,68,68,0.40)',   numBg: 'rgba(0,0,0,0.18)' },
  { bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',  shadow: 'rgba(99,102,241,0.40)',  numBg: 'rgba(0,0,0,0.18)' },
  { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',  shadow: 'rgba(34,197,94,0.40)',   numBg: 'rgba(0,0,0,0.18)' },
  { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',  shadow: 'rgba(245,158,11,0.40)',  numBg: 'rgba(0,0,0,0.18)' },
  { bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',  shadow: 'rgba(236,72,153,0.40)',  numBg: 'rgba(0,0,0,0.18)' },
  { bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',  shadow: 'rgba(6,182,212,0.38)',   numBg: 'rgba(0,0,0,0.18)' },
  { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',  shadow: 'rgba(139,92,246,0.38)',  numBg: 'rgba(0,0,0,0.18)' },
  { bg: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',  shadow: 'rgba(13,148,136,0.38)',  numBg: 'rgba(0,0,0,0.18)' },
];

/* ──────────────────────────────────────────────
   Star rating from security_score
────────────────────────────────────────────── */
const StarRating = ({ score, isDark }) => {
  const stars = Math.round((score / 100) * 5);
  return (
    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: '13px', color: i <= stars ? '#fbbf24' : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)') }}>★</span>
      ))}
    </div>
  );
};

/* ──────────────────────────────────────────────
   Inline SVG character illustrations for top 5
────────────────────────────────────────────── */
const CharacterSVGs = {
  1: ({ size = 130 }) => (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <DotLottieReact
        src="https://lottie.host/3b60f668-1f45-41a8-bf23-14d8ec37573e/9tqUpN9kOS.lottie"
        loop
        autoplay
        style={{ width: '130%', height: '130%' }}
      />
    </div>
  ),
  2: ({ size = 115 }) => (
    <img src="/rank2.png" alt="Agent" style={{ width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.30))' }}
      onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
  ),
  3: ({ size = 110 }) => (
    <img src="/rank3.png" alt="Bronze" style={{ width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.28))' }}
      onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
  ),
  4: ({ size = 100 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.28))' }}>
      <ellipse cx="50" cy="65" rx="28" ry="26" fill="#f59e0b" />
      <circle cx="50" cy="36" r="24" fill="#fbbf24" />
      <ellipse cx="50" cy="34" rx="16" ry="7" fill="#0f172a" />
      <circle cx="43" cy="32" r="3" fill="#06b6d4" /><circle cx="57" cy="32" r="3" fill="#06b6d4" />
      <circle cx="43" cy="32" r="1.5" fill="#fff" /><circle cx="57" cy="32" r="1.5" fill="#fff" />
      <path d="M40 42 Q50 48 60 42" stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="30" y="60" width="40" height="24" rx="4" fill="#1e293b" />
      <rect x="33" y="63" width="34" height="16" rx="2" fill="#0f172a" />
      <rect x="36" y="66" width="10" height="2" rx="1" fill="#06b6d4" opacity="0.7" />
      <rect x="36" y="70" width="20" height="2" rx="1" fill="#06b6d4" opacity="0.5" />
      <ellipse cx="20" cy="64" rx="8" ry="13" fill="#fbbf24" />
      <ellipse cx="80" cy="64" rx="8" ry="13" fill="#fbbf24" />
    </svg>
  ),
  5: ({ size = 100 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.28))' }}>
      <path d="M28 50 Q20 75 32 92 L50 85 L68 92 Q80 75 72 50 Z" fill="#db2777" />
      <rect x="28" y="45" width="44" height="42" rx="10" fill="#ec4899" />
      <path d="M50 55 L42 60 L44 72 L50 76 L56 72 L58 60 Z" fill="#fff" opacity="0.9" />
      <path d="M50 58 L44 62 L46 70 L50 73 L54 70 L56 62 Z" fill="#ec4899" />
      <text x="47" y="69" fontSize="8" fill="#fff" fontWeight="bold">★</text>
      <circle cx="50" cy="32" r="20" fill="#fde68a" />
      <ellipse cx="43" cy="31" rx="5" ry="6" fill="#fff" /><ellipse cx="57" cy="31" rx="5" ry="6" fill="#fff" />
      <circle cx="44" cy="32" r="3" fill="#1e293b" /><circle cx="58" cy="32" r="3" fill="#1e293b" />
      <circle cx="45" cy="31" r="1" fill="#fff" /><circle cx="59" cy="31" r="1" fill="#fff" />
      <path d="M43 40 Q50 46 57 40" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="38" r="4" fill="#fca5a5" opacity="0.5" />
      <circle cx="62" cy="38" r="4" fill="#fca5a5" opacity="0.5" />
      <ellipse cx="50" cy="18" rx="18" ry="9" fill="#db2777" />
      <rect x="32" y="16" width="36" height="8" rx="4" fill="#db2777" />
      <ellipse cx="17" cy="58" rx="8" ry="15" fill="#ec4899" />
      <ellipse cx="83" cy="58" rx="8" ry="15" fill="#ec4899" />
    </svg>
  ),
};

const GenericChar = ({ rank, size = 90 }) => {
  const colors = ['#06b6d4', '#8b5cf6', '#0d9488', '#f97316', '#14b8a6'];
  const col = colors[(rank - 6) % colors.length] || '#64748b';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))' }}>
      <circle cx="50" cy="36" r="22" fill={col} />
      <circle cx="50" cy="36" r="16" fill="white" opacity="0.18" />
      <text x="50" y="42" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff">{rank}</text>
      <rect x="24" y="56" width="52" height="38" rx="10" fill={col} />
      <rect x="30" y="62" width="40" height="26" rx="6" fill="white" opacity="0.13" />
      <ellipse cx="14" cy="68" rx="8" ry="15" fill={col} />
      <ellipse cx="86" cy="68" rx="8" ry="15" fill={col} />
    </svg>
  );
};

/* ──────────────────────────────────────────────
   Skeleton loading row
────────────────────────────────────────────── */
const SkeletonRow = ({ idx }) => {
  const rank = idx + 1;
  return (
    <div 
      className={`leaderboard-card rank-${rank <= 3 ? rank : 'normal'}`}
      style={{
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '400% 100%',
        animation: 'shimmer 1.4s ease infinite',
        minHeight: '120px',
      }} 
    />
  );
};

/* ──────────────────────────────────────────────
   Main Component
────────────────────────────────────────────── */
const UserLeaderboard = () => {
  const { currentUser } = useAppContext();

  const [leaderboard, setLeaderboard] = useState([]);
  const [viewerStats, setViewerStats] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const FILTERS = ['Top 5', 'All', 'Department'];

  /* ── Fetch all pages from backend ── */
  const fetchLeaderboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await api.get('/leaderboard/employee');
      const raw = res.data || [];
      const mapped = raw.map(item => ({
        rank: item.rank,
        name: item.employee_name,
        email: item.email,
        department: item.department || 'General',
        securityScore: item.security_score,
        total_xp: item.total_points || 0,
        reports_count: item.report_count || 0,
        completion_percentage: item.training_completed_count * 20,
        badges: item.badge ? [item.badge] : [],
        employee_id: item.employee_id,
        risk_score: item.risk_score,
        training_completed_count: item.training_completed_count,
        quiz_pass_count: item.quiz_pass_count,
        isMock: false,
      }));

      let combined = [...mapped];
      // Sort by security score desc, then XP desc, re-assign ranks
      combined.sort((a, b) => b.securityScore - a.securityScore || b.total_xp - a.total_xp);
      combined = combined.map((e, i) => ({ ...e, rank: i + 1 }));

      setLeaderboard(combined);

      // Resolve viewer stats from full combined list
      const viewer = combined.find(item => item.employee_id === currentUser?.employee_id || item.email === currentUser?.email);
      if (viewer) {
        setViewerStats({
          rank: viewer.rank,
          security_score: viewer.securityScore,
          total_xp: viewer.total_xp,
          reports_count: viewer.reports_count,
          completion_percentage: viewer.completion_percentage,
          percentile: Math.round(((combined.length - viewer.rank + 1) / combined.length) * 100)
        });
      } else {
        setViewerStats(null);
      }
      setTotalCount(combined.length);
    } catch (err) {
      setError('Could not load leaderboard data. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  /* ── Filter logic ── */
  const depts = ['All', ...Array.from(new Set(leaderboard.map(e => e.department).filter(Boolean)))];

  const filteredByDept = selectedDept === 'All'
    ? leaderboard
    : leaderboard.filter(e => e.department === selectedDept);

  const displayList = filter === 'Top 5' ? filteredByDept.slice(0, 5) : filteredByDept;
  const visibleList = showAll ? displayList : displayList.slice(0, 6);
  const hasMore = displayList.length > 6;

  /* ── Current user check ── */
  const isCurrentUser = (emp) =>
    emp.name === currentUser?.name || emp.email === currentUser?.email;

  /* ── Character renderer ── */
  const getCharacter = (rank, customSize) => {
    const Char = CharacterSVGs[rank];
    if (Char) return <Char size={customSize || (rank <= 2 ? 200 : rank === 3 ? 110 : 100)} />;
    return <GenericChar rank={rank} size={90} />;
  };

  return (
    <div style={{ fontFamily: "'Fredoka', 'Outfit', 'Inter', sans-serif", maxWidth: '1100px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes goldPulse {
          0% { box-shadow: 0 8px 24px rgba(245, 158, 11, 0.1), 0 0 4px rgba(251, 191, 36, 0.2); }
          50% { box-shadow: 0 8px 30px rgba(245, 158, 11, 0.2), 0 0 10px rgba(251, 191, 36, 0.4); }
          100% { box-shadow: 0 8px 24px rgba(245, 158, 11, 0.1), 0 0 4px rgba(251, 191, 36, 0.2); }
        }
        @keyframes silverPulse {
          0% { box-shadow: 0 8px 24px rgba(59, 130, 246, 0.08), 0 0 4px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 8px 30px rgba(59, 130, 246, 0.18), 0 0 10px rgba(59, 130, 246, 0.4); }
          100% { box-shadow: 0 8px 24px rgba(59, 130, 246, 0.08), 0 0 4px rgba(59, 130, 246, 0.2); }
        }
        @keyframes bronzePulse {
          0% { box-shadow: 0 8px 24px rgba(34, 197, 94, 0.08), 0 0 4px rgba(34, 197, 94, 0.2); }
          50% { box-shadow: 0 8px 30px rgba(34, 197, 94, 0.18), 0 0 10px rgba(34, 197, 94, 0.4); }
          100% { box-shadow: 0 8px 24px rgba(34, 197, 94, 0.08), 0 0 4px rgba(34, 197, 94, 0.2); }
        }
        @keyframes badgeGlow {
          0% { box-shadow: 0 0 4px rgba(59, 130, 246, 0.25); }
          50% { box-shadow: 0 0 12px rgba(59, 130, 246, 0.65); }
          100% { box-shadow: 0 0 4px rgba(59, 130, 246, 0.25); }
        }
        @keyframes badgeGlowDark {
          0% { box-shadow: 0 0 4px rgba(245, 158, 11, 0.25); }
          50% { box-shadow: 0 0 12px rgba(245, 158, 11, 0.65); }
          100% { box-shadow: 0 0 4px rgba(245, 158, 11, 0.25); }
        }

        /* ── Top header row ── */
        .lb-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .lb-stats-hud {
          flex-shrink: 0;
          width: 320px;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 36px;
          width: 100%;
          padding: 8px 0 24px 0;
          overflow-x: hidden;
        }

        .leaderboard-card {
          position: relative;
          overflow: visible;
          border-radius: 22px;
          min-height: 120px;
          box-sizing: border-box;
          max-width: 100%;
        }

        .leaderboard-card.rank-1 {
          width: 500px;
          min-height: 160px;
        }

        .leaderboard-card.rank-2 {
          width: 750px;
          min-height: 145px;
        }

        .leaderboard-card.rank-3,
        .leaderboard-card.rank-normal {
          width: 100%;
        }

        .leaderboard-popout {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          object-fit: contain;
          z-index: 5;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .leaderboard-card.rank-1 .leaderboard-popout {
          width: 200px;
          max-height: 200px;
        }

        .leaderboard-card.rank-2 .leaderboard-popout {
          width: 170px;
          max-height: 170px;
        }

        .leaderboard-card.rank-3 .leaderboard-popout {
          width: 145px;
          max-height: 145px;
        }

        .leaderboard-card.rank-normal .leaderboard-popout {
          display: none;
        }

        @media (max-width: 860px) {
          .lb-top-row {
            flex-direction: column;
          }
          .lb-stats-hud {
            width: 100%;
          }
          .leaderboard-card.rank-1,
          .leaderboard-card.rank-2 {
            width: 100%;
          }
          .leaderboard-popout {
            right: 12px;
            width: 90px !important;
            max-height: 110px !important;
          }
        }

        @media (max-width: 480px) {
          .leaderboard-popout {
            display: none !important;
          }
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }} />

      {/* ── Page Title ── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '20px' }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
          Leaderboard
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', margin: '6px 0 0 0', lineHeight: 1.4 }}>
          {loading ? 'Loading live rankings…' : `${totalCount} employee${totalCount !== 1 ? 's' : ''} ranked by security performance`}
        </p>
      </motion.div>

      {/* ── Your Stats horizontal bar ── */}
      {viewerStats && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            borderRadius: '20px',
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            border: '2px solid rgba(255,255,255,0.2)',
            borderBottom: '5px solid #1e1b4b',
            boxShadow: '0 8px 24px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.25)',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          {/* "Your Stats" label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', paddingRight: '24px', marginRight: '4px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Your Stats</span>
          </div>

          {/* Stat items */}
          {[
            { label: 'Rank',           value: `#${viewerStats.rank}` },
            { label: 'Security Score', value: `${viewerStats.security_score}/100` },
            { label: 'Total XP',       value: `${viewerStats.total_xp} XP` },
            { label: 'Reports',        value: viewerStats.reports_count },
            { label: 'Completion',     value: `${viewerStats.completion_percentage}%` },
            { label: 'Percentile',     value: `Top ${100 - viewerStats.percentile + 1}%` },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 24px',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: '950', color: '#fff', lineHeight: 1, fontFamily: "'Fredoka', sans-serif" }}>
                {stat.value}
              </span>
              <span style={{ fontSize: '10px', color: '#c7d2fe', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      )}


      {/* ── Rankings list ── */}
      <div>
          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}
          >
            <div style={{ display: 'flex', gap: '5px', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '7px 18px', borderRadius: '9px', border: 'none',
                    fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                    background: filter === f ? '#fff' : 'transparent',
                    color: filter === f ? '#0f172a' : '#94a3b8',
                    boxShadow: filter === f ? '0 1px 6px rgba(0,0,0,0.10)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {(filter === 'Department' || filter === 'All') && (
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                style={{
                  padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                  fontSize: '13px', fontWeight: '600', color: '#475569',
                  background: '#fff', cursor: 'pointer', outline: 'none',
                }}
              >
                {depts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
              </select>
            )}
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '16px', padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '20px'
              }}
            >
              <AlertCircle size={20} color="#ef4444" />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626', margin: 0 }}>{error}</p>
                <button onClick={() => fetchLeaderboard()} style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px', padding: 0, textDecoration: 'underline' }}>
                  Try again
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="leaderboard-list">
              {[0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} idx={i} />)}
            </div>
          )}

          {/* Podium (Top 3) */}
          {!loading && !error && displayList.length > 0 && (
            <LeaderboardPodium topThree={displayList.slice(0, 3)} />
          )}

          {/* Ranked Rows */}
          {!loading && (
            <div className="leaderboard-list">
              <AnimatePresence>
                {visibleList.map((emp, idx) => {
                  const rank = emp.rank || idx + 1;
                  const isMine = isCurrentUser(emp);
                  const score = emp.securityScore || 0;
                  const xp = emp.total_xp || 0;
                  
                  // Custom styles for ranks (Skeuomorphic 3D Cartoon styles)
                  let cardStyle = {};
                  let numBgColor = '';
                  let numTextColor = '';
                  let cardClass = '';
                  let nameColor = '';
                  let deptColor = '';
                  let scoreColor = '';
                  let xpColor = '';
                  let reportsColor = '';
                  let isDark = false; 

                  if (isMine) {
                    // Highlight user row with a special blue skeuomorphic card
                    cardStyle = {
                      background: 'linear-gradient(135deg, #f0f7ff 0%, #e0f0fe 100%)',
                      border: '2px solid #3b82f6',
                      borderBottom: '6px solid #1d4ed8',
                      boxShadow: '0 8px 16px rgba(59, 130, 246, 0.1)',
                    };
                    numBgColor = 'rgba(59, 130, 246, 0.15)';
                    numTextColor = '#1d4ed8';
                    nameColor = '#1e3a8a';
                    deptColor = '#2563eb';
                    scoreColor = '#1d4ed8';
                    xpColor = '#2563eb';
                    reportsColor = '#2563eb';
                  } else if (rank === 1) {
                    cardStyle = {
                      background: 'linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)',
                      border: '2px solid #f59e0b',
                      borderBottom: '6px solid #d97706',
                    };
                    numBgColor = 'rgba(245, 158, 11, 0.15)';
                    numTextColor = '#d97706';
                    cardClass = 'leaderboard-card-1';
                    nameColor = '#78350f';
                    deptColor = '#b45309';
                    scoreColor = '#78350f';
                    xpColor = '#92400e';
                    reportsColor = '#b45309';
                  } else if (rank === 2) {
                    cardStyle = {
                      background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                      border: '2px solid #3b82f6',
                      borderBottom: '6px solid #1d4ed8',
                    };
                    numBgColor = 'rgba(59, 130, 246, 0.12)';
                    numTextColor = '#2563eb';
                    cardClass = 'leaderboard-card-2';
                    nameColor = '#1e3a8a';
                    deptColor = '#2563eb';
                    scoreColor = '#1e3a8a';
                    xpColor = '#1d4ed8';
                    reportsColor = '#2563eb';
                  } else if (rank === 3) {
                    cardStyle = {
                      background: 'linear-gradient(135deg, #fcfdfd 0%, #f0fdf4 100%)',
                      border: '2px solid #22c55e',
                      borderBottom: '6px solid #16a34a',
                    };
                    numBgColor = 'rgba(34, 197, 94, 0.12)';
                    numTextColor = '#16a34a';
                    cardClass = 'leaderboard-card-3';
                    nameColor = '#14532d';
                    deptColor = '#16a34a';
                    scoreColor = '#14532d';
                    xpColor = '#15803d';
                    reportsColor = '#16a34a';
                  } else {
                    cardStyle = {
                      background: '#ffffff',
                      border: '2px solid #e2e8f0',
                      borderBottom: '6px solid #cbd5e1',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
                    };
                    numBgColor = '#f1f5f9';
                    numTextColor = '#475569';
                    nameColor = '#0f172a';
                    deptColor = '#64748b';
                    scoreColor = '#0f172a';
                    xpColor = '#2563eb';
                    reportsColor = '#64748b';
                  }
                  
                  return (
                    <motion.div
                      key={`${emp.name}-${rank}`}
                      initial={{ opacity: 0, x: -40, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.38, delay: idx * 0.055, ease: 'easeOut' }}
                      whileHover={{ scale: 1.015, y: -4 }}
                      className={`leaderboard-card rank-${rank <= 3 ? rank : 'normal'} ${cardClass}`}
                      style={{
                        ...cardStyle,
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'default',
                        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                        zIndex: rank <= 3 ? 10 - rank : 1,
                      }}
                    >
                      {/* shine overlay */}
                      {rank <= 3 && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 55%)', pointerEvents: 'none' }} />
                      )}

                      {/* Rank number block */}
                      <div style={{
                        width: rank === 1 ? '74px' : '64px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        alignSelf: 'stretch', flexShrink: 0,
                        background: numBgColor,
                        borderRadius: '16px 0 0 16px',
                      }}>
                        <span className="gamified-metric rank-number" style={{
                          fontSize: rank === 1 ? '34px' : rank <= 3 ? '26px' : '20px',
                          fontWeight: '900', color: numTextColor, lineHeight: 1,
                        }}>{rank}</span>
                      </div>

                      {/* Name + Stars + Dept */}
                      <div style={{ flex: 1, padding: '0 20px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: rank === 1 ? '20px' : rank <= 3 ? '17px' : '15px',
                            fontWeight: '900', color: nameColor,
                            letterSpacing: '-0.02em',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px'
                          }}>
                            {emp.name}
                          </span>
                          {isMine && (
                            <span 
                              className="active-badge-glow"
                              style={{
                                fontSize: '9px', fontWeight: '800', 
                                color: '#ffffff',
                                background: '#2563eb', 
                                padding: '2px 8px',
                                borderRadius: '99px', 
                                border: '1px solid rgba(37, 99, 235, 0.4)',
                                letterSpacing: '0.06em', flexShrink: 0,
                              }}
                            >YOU</span>
                          )}
                        </div>
                        <StarRating score={score} isDark={isDark} />
                        <div style={{ fontSize: '11px', color: deptColor, marginTop: '3px', fontWeight: '600' }}>
                          {emp.department}
                          {emp.completion_percentage > 0 && (
                            <span style={{ marginLeft: '8px', opacity: 0.75 }}>· {emp.completion_percentage}% trained</span>
                          )}
                        </div>
                      </div>

                      {/* Score + XP */}
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                        flexShrink: 0, gap: '4px',
                        padding: rank <= 3 ? (rank === 1 || rank === 2 ? '0 160px 0 16px' : '0 135px 0 16px') : '0 16px',
                      }}>
                        <span className="gamified-metric score-number" style={{
                          fontSize: rank === 1 ? '26px' : rank <= 3 ? '22px' : '18px',
                          fontWeight: '900', color: scoreColor,
                          letterSpacing: '-0.03em',
                        }}>
                          {score}<span style={{ fontSize: rank === 1 ? '15px' : '13px', opacity: 0.7 }}>/100</span>
                        </span>
                        <span className="gamified-metric xp-amount" style={{ fontSize: '10px', color: xpColor, fontWeight: '750', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Zap size={9} /> {xp.toLocaleString()} XP
                        </span>
                        {emp.reports_count > 0 && (
                          <span style={{ fontSize: '9px', color: reportsColor, fontWeight: '600' }}>
                            {emp.reports_count} report{emp.reports_count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Character overlapping popout */}
                      {rank <= 3 && (
                        <motion.div
                          className="leaderboard-popout"
                          animate={{ y: ["-50%", "-56%", "-50%"] }}
                          transition={{ repeat: Infinity, duration: 2.2 + rank * 0.4, ease: 'easeInOut' }}
                          style={{
                            position: 'absolute',
                            right: rank === 1 ? '12px' : rank === 2 ? '16px' : '20px',
                            top: '50%',
                            width: rank === 1 ? '200px' : rank === 2 ? '170px' : '145px',
                            height: rank === 1 ? '200px' : rank === 2 ? '170px' : '145px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 5,
                            pointerEvents: 'none',
                          }}
                        >
                          {getCharacter(rank, rank === 1 ? 200 : rank === 2 ? 170 : 145)}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Show More / Show Less button */}
          {!loading && hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}
            >
              <button
                onClick={() => setShowAll(prev => !prev)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '14px 40px',
                  borderRadius: '99px',
                  background: showAll
                    ? '#f1f5f9'
                    : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                  color: showAll ? '#475569' : '#fff',
                  border: showAll ? '2px solid #e2e8f0' : '2px solid rgba(255,255,255,0.2)',
                  borderBottom: showAll ? '4px solid #cbd5e1' : '4px solid #1e1b4b',
                  fontSize: '14px', fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: showAll
                    ? '0 4px 8px rgba(0,0,0,0.06)'
                    : '0 8px 24px rgba(79,70,229,0.25)',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.02em',
                }}
              >
                {showAll
                  ? '▲  Show Less'
                  : `▼  Show All ${displayList.length} Players`}
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && displayList.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center', padding: '60px 20px',
                background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0'
              }}
            >
              <Trophy size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#94a3b8' }}>No rankings found</h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>Leaderboard will appear after employees start completing trainings and reporting emails.</p>
            </motion.div>
          )}

          {/* "Your Position" footer banner if not in visible list */}
          {!loading && viewerStats && (() => {
            const isVisible = displayList.some(e => isCurrentUser(e));
            if (!isVisible && viewerStats.rank) {
              const styleIdx = (viewerStats.rank - 1) % RANK_STYLES.length;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    marginTop: '24px',
                    background: RANK_STYLES[styleIdx].bg,
                    borderRadius: '18px',
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    border: '3px solid rgba(255,255,255,0.65)',
                    boxShadow: `0 6px 24px ${RANK_STYLES[styleIdx].shadow}`,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ position: 'absolute' }} />
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📍 Your Position</span>
                  <span style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>#{viewerStats.rank}</span>
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: '700', color: '#fff' }}>{currentUser?.name}</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>{viewerStats.security_score}/100</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} /> {viewerStats.total_xp} XP
                  </span>
                </motion.div>
              );
            }
            return null;
          })()}
        </div>
      </div>

  );
};

export default UserLeaderboard;
