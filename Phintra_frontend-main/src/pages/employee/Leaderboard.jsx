import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, RefreshCw, AlertCircle } from 'lucide-react';
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
    <img src="/rank1.png" alt="Champion" style={{ width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))' }}
      onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
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
        completion_percentage: item.training_completed_count * 20, // 5 courses total, 20% each
        badges: item.badge ? [item.badge] : [],
        employee_id: item.employee_id,
        risk_score: item.risk_score,
        training_completed_count: item.training_completed_count,
        quiz_pass_count: item.quiz_pass_count,
      }));
      setLeaderboard(mapped);

      // Resolve viewer stats from mapped list
      const viewer = mapped.find(item => item.employee_id === currentUser?.employee_id || item.email === currentUser?.email);
      if (viewer) {
        setViewerStats({
          rank: viewer.rank,
          security_score: viewer.securityScore,
          total_xp: viewer.total_xp,
          reports_count: viewer.reports_count,
          completion_percentage: viewer.completion_percentage,
          percentile: Math.round(((mapped.length - viewer.rank + 1) / mapped.length) * 100)
        });
      } else {
        setViewerStats(null);
      }
      setTotalCount(mapped.length);
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
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif", maxWidth: '1080px', margin: '0 auto', padding: '0 15px', boxSizing: 'border-box' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes goldPulse {
          0% { box-shadow: 0 12px 36px rgba(245, 158, 11, 0.15), 0 0 8px rgba(251, 191, 36, 0.35); }
          50% { box-shadow: 0 12px 42px rgba(245, 158, 11, 0.25), 0 0 16px rgba(251, 191, 36, 0.6); }
          100% { box-shadow: 0 12px 36px rgba(245, 158, 11, 0.15), 0 0 8px rgba(251, 191, 36, 0.35); }
        }
        @keyframes silverPulse {
          0% { box-shadow: 0 10px 28px rgba(59, 130, 246, 0.1), 0 0 6px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 10px 34px rgba(59, 130, 246, 0.2), 0 0 14px rgba(59, 130, 246, 0.55); }
          100% { box-shadow: 0 10px 28px rgba(59, 130, 246, 0.1), 0 0 6px rgba(59, 130, 246, 0.3); }
        }
        @keyframes bronzePulse {
          0% { box-shadow: 0 8px 24px rgba(34, 197, 94, 0.08), 0 0 5px rgba(34, 197, 94, 0.25); }
          50% { box-shadow: 0 8px 30px rgba(34, 197, 94, 0.18), 0 0 12px rgba(34, 197, 94, 0.5); }
          100% { box-shadow: 0 8px 24px rgba(34, 197, 94, 0.08), 0 0 5px rgba(34, 197, 94, 0.25); }
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
        .leaderboard-card-1 {
          animation: goldPulse 3.2s infinite ease-in-out;
        }
        .leaderboard-card-2 {
          animation: silverPulse 3.6s infinite ease-in-out;
        }
        .leaderboard-card-3 {
          animation: bronzePulse 4.0s infinite ease-in-out;
        }
        .active-badge-glow {
          animation: badgeGlow 2.5s infinite ease-in-out;
        }
        .active-badge-glow-dark {
          animation: badgeGlowDark 2.5s infinite ease-in-out;
        }
        @media (max-width: 768px) {
          .leaderboard-card {
            max-width: 100% !important;
            padding-right: 90px !important;
            min-height: 90px !important;
          }
          .leaderboard-mascot {
            width: 90px !important;
            height: 110px !important;
            right: 5px !important;
            bottom: -8px !important;
          }
          .leaderboard-mascot img {
            width: 80px !important;
            height: 80px !important;
          }
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 32px;
          width: 100%;
        }

        .leaderboard-card {
          position: relative;
          overflow: visible;
          border-radius: 22px;
          min-height: 120px;
        }

        .leaderboard-card.rank-1 {
          width: 500px;
        }

        .leaderboard-card.rank-2 {
          width: 750px;
        }

        .leaderboard-card.rank-3,
        .leaderboard-card.rank-normal {
          width: 1000px;
        }

        .leaderboard-popout {
          position: absolute;
          right: 35px;
          top: 50%;
          transform: translateY(-50%);
          width: 130px;
          max-height: 150px;
          object-fit: contain;
          z-index: 5;
          pointer-events: none;
        }

        .leaderboard-card.rank-1 .leaderboard-popout {
          width: 145px;
        }

        .leaderboard-card.rank-2 .leaderboard-popout {
          width: 135px;
        }

        .leaderboard-card.rank-3 .leaderboard-popout {
          width: 130px;
        }

        .leaderboard-card.rank-normal .leaderboard-popout {
          display: none;
        }

        @media (max-width: 1100px) {
          .leaderboard-card.rank-1,
          .leaderboard-card.rank-2,
          .leaderboard-card.rank-3,
          .leaderboard-card.rank-normal {
            width: 100%;
          }

          .leaderboard-popout {
            right: 12px;
            width: 95px;
          }
        }

        @media (max-width: 768px) {
          .leaderboard-card {
            padding-right: 90px !important;
            min-height: 90px !important;
          }
          .leaderboard-popout {
            right: 5px !important;
            width: 80px !important;
            max-height: 100px !important;
          }
        }

        @media (max-width: 480px) {
          .leaderboard-card {
            padding-right: 15px !important;
          }
          .leaderboard-popout {
            display: none !important;
          }
        }
      ` }} />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <h1 style={{ fontSize: '34px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Leaderboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>
            {loading ? 'Loading live rankings…' : `${totalCount} employee${totalCount !== 1 ? 's' : ''} ranked by security performance`}
          </p>
        </div>

        <button
          onClick={() => fetchLeaderboard(true)}
          disabled={refreshing || loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 18px', borderRadius: '12px',
            background: '#fff', border: '1px solid #e2e8f0',
            fontSize: '13px', fontWeight: '700', color: '#475569',
            cursor: refreshing || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease', opacity: refreshing ? 0.7 : 1,
          }}
          className="lb-refresh-btn"
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </motion.div>

      {/* ── Viewer Stats Banner (live data) ── */}
      {viewerStats && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #0B1120, #0e2244)',
            borderRadius: '18px',
            padding: '18px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 6px 24px rgba(11,17,32,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Stats</span>
          </div>
          {[
            { label: 'Rank', value: `#${viewerStats.rank}` },
            { label: 'Security Score', value: `${viewerStats.security_score}/100` },
            { label: 'Total XP', value: `${viewerStats.total_xp} XP` },
            { label: 'Reports', value: viewerStats.reports_count },
            { label: 'Completion', value: `${viewerStats.completion_percentage}%` },
            { label: 'Percentile', value: `Top ${100 - viewerStats.percentile + 1}%` },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Filter Tabs ── */}
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

      {/* ── Error State ── */}
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

      {/* ── Loading Skeletons ── */}
      {loading && (
        <div className="leaderboard-list">
          {[0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} idx={i} />)}
        </div>
      )}

      {/* ── Podium (Top 3) ── */}
      {!loading && !error && displayList.length > 0 && (
        <LeaderboardPodium topThree={displayList.slice(0, 3)} />
      )}

      {/* ── Ranked Rows ── */}
      {!loading && (
        <div className="leaderboard-list">
          <AnimatePresence>
            {displayList.map((emp, idx) => {
              const rank = emp.rank || idx + 1;
              const isMine = isCurrentUser(emp);
              const score = emp.securityScore || 0;
              const xp = emp.total_xp || 0;
              
              // Custom styles for ranks (Light and Colorful backgrounds)
              let cardStyle = {};
              let numBgColor = '';
              let numTextColor = '';
              let cardClass = '';
              let nameColor = '';
              let deptColor = '';
              let scoreColor = '';
              let xpColor = '';
              let reportsColor = '';
              let isDark = false; // All cards are now light background

              const LIGHT_ROTATING_STYLES = [
                { bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', border: '1px solid #fbcfe8', text: '#86198f', numBg: 'rgba(192, 132, 252, 0.12)', numText: '#a855f7', dept: '#a21caf', xp: '#b71c1c' }, // Pink/Purple
                { bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)', border: '1px solid #a5f3fc', text: '#0f766e', numBg: 'rgba(34, 211, 238, 0.12)', numText: '#06b6d4', dept: '#0891b2', xp: '#0e7490' },  // Teal/Cyan
                { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fed7aa', text: '#9a3412', numBg: 'rgba(251, 146, 60, 0.12)', numText: '#f97316', dept: '#c2410c', xp: '#ea580c' },  // Orange
                { bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #ddd6fe', text: '#5b21b6', numBg: 'rgba(167, 139, 250, 0.12)', numText: '#7c3aed', dept: '#6d28d9', xp: '#7c3aed' },  // Purple/Violet
                { bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', border: '1px solid #99f6e4', text: '#115e59', numBg: 'rgba(45, 212, 191, 0.12)', numText: '#14b8a6', dept: '#0f766e', xp: '#0d9488' },  // Mint/Teal
              ];

              if (rank === 1) {
                // Gold Premium Light theme
                cardStyle = {
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
                  border: '2px solid #f59e0b',
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
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '2px solid #3b82f6',
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
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '2px solid #22c55e',
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
                // Rotating Light/Color themes for Ranks 4+
                const rotationStyle = LIGHT_ROTATING_STYLES[(rank - 4) % LIGHT_ROTATING_STYLES.length];
                cardStyle = {
                  background: rotationStyle.bg,
                  border: rotationStyle.border,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                };
                numBgColor = rotationStyle.numBg;
                numTextColor = rotationStyle.numText;
                nameColor = rotationStyle.text;
                deptColor = rotationStyle.dept;
                scoreColor = rotationStyle.text;
                xpColor = rotationStyle.xp;
                reportsColor = rotationStyle.dept;
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
                    boxSizing: 'border-box',
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                    zIndex: rank <= 3 ? 10 - rank : 1,
                    border: isMine ? '3px solid #2563eb' : cardStyle.border,
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
                      animate={{ y: ["-50%", "-54%", "-50%"] }}
                      transition={{ repeat: Infinity, duration: 2.2 + rank * 0.4, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        right: '35px',
                        top: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 5,
                        pointerEvents: 'none',
                      }}
                    >
                      {getCharacter(rank, "100%")}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Empty State ── */}
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

      {/* ── "Your Position" footer banner if not in visible list ── */}
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

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .lb-refresh-btn:hover {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
};

export default UserLeaderboard;
