import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Shield } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LeaderboardPodium = ({ topThree }) => {
  // Sort topThree specifically to be rendered: Rank 2, Rank 1, Rank 3
  const getPodiumOrder = () => {
    const order = [null, null, null];
    topThree.forEach(user => {
      if (user.rank === 1) order[1] = user;
      else if (user.rank === 2) order[0] = user;
      else if (user.rank === 3) order[2] = user;
    });
    // Fallbacks
    return [
      order[0] || { name: 'Player 2', total_xp: 0, securityScore: 0, rank: 2 },
      order[1] || { name: 'Player 1', total_xp: 0, securityScore: 0, rank: 1 },
      order[2] || { name: 'Player 3', total_xp: 0, securityScore: 0, rank: 3 }
    ];
  };

  const podiumUsers = getPodiumOrder();

  const getRankBadgeInfo = (rank) => {
    if (rank === 1) return { color: '#ca8a04', text: 'Gold', trophyColor: '#eab308', height: 160 };
    if (rank === 2) return { color: '#475569', text: 'Silver', trophyColor: '#94a3b8', height: 130 };
    return { color: '#b45309', text: 'Bronze', trophyColor: '#d97706', height: 100 }; // 3
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      gap: '16px',
      margin: '40px 0 24px 0',
      minHeight: '260px',
      flexWrap: 'wrap'
    }}>
      {podiumUsers.map((user, idx) => {
        const badge = getRankBadgeInfo(user.rank);
        const isFirst = user.rank === 1;

        return (
          <motion.div
            key={user.rank}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.15, type: 'spring', stiffness: 100 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: user.rank === 1 ? '120px' : user.rank === 2 ? '100px' : '90px',
              zIndex: isFirst ? 10 : 1
            }}
          >
            {/* Avatar & Rank badge on top */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <motion.div
                animate={isFirst ? { y: [0, -8, 0] } : {}}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                style={{
                  width: user.rank === 1 ? '80px' : user.rank === 2 ? '65px' : '55px',
                  height: user.rank === 1 ? '80px' : user.rank === 2 ? '65px' : '55px',
                  borderRadius: '50%',
                  border: `4px solid ${badge.trophyColor}`,
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  boxShadow: isFirst
                    ? '0 16px 40px rgba(234, 179, 8, 0.35), 0 0 0 6px rgba(234,179,8,0.1)'
                    : user.rank === 2
                    ? '0 10px 28px rgba(148,163,184,0.3), 0 0 0 4px rgba(148,163,184,0.1)'
                    : '0 8px 20px rgba(217,119,6,0.25), 0 0 0 3px rgba(217,119,6,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {user.rank === 1 ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DotLottieReact
                      src="https://lottie.host/3b60f668-1f45-41a8-bf23-14d8ec37573e/9tqUpN9kOS.lottie"
                      loop
                      autoplay
                      style={{ width: '150%', height: '150%' }}
                    />
                  </div>
                ) : (
                  <img
                    src={user.rank === 2 ? '/rank2.png' : (user.rank === 3 ? '/rank3.png' : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`)}
                    alt={user.name}
                    style={{ width: '92%', height: '92%', objectFit: 'cover' }}
                  />
                )}
              </motion.div>
              
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: badge.trophyColor,
                color: '#ffffff',
                borderRadius: '50%',
                width: user.rank === 1 ? '22px' : '18px',
                height: user.rank === 1 ? '22px' : '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: user.rank === 1 ? '11px' : '10px',
                fontWeight: '900',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                {user.rank}
              </div>
            </div>

            {/* Name and Stats */}
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', textAlign: 'center', display: 'block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name.split(' ')[0]}
            </span>
            <span style={{ fontSize: '11px', fontWeight: '750', color: '#64748b', marginTop: '2px' }}>
              {user.total_xp || user.rewards_balance || 0} XP
            </span>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#0d9488', background: '#ccfbf1', padding: '1px 6px', borderRadius: '4px', marginTop: '4px' }}>
              Score: {user.securityScore || user.security_score || 80}
            </span>

            {/* Podium Base */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${badge.height}px` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                width: '100%',
                background: isFirst 
                  ? 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)' 
                  : user.rank === 2
                    ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)'
                    : 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
                border: '2px solid ' + (isFirst ? '#fbbf24' : user.rank === 2 ? '#94a3b8' : '#f97316'),
                borderBottom: `8px solid ${isFirst ? '#ca8a04' : user.rank === 2 ? '#475569' : '#b45309'}`,
                borderRadius: '20px 20px 0 0',
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFirst ? '#854d0e' : user.rank === 2 ? '#334155' : '#7c2d12',
                boxShadow: `0 8px 16px rgba(0, 0, 0, 0.08), inset 0 2px 0 rgba(255, 255, 255, 0.4)`
              }}
            >
              <Trophy size={isFirst ? 32 : 22} style={{ filter: 'drop-shadow(0 2px 0 rgba(255,255,255,0.4))' }} />
              <span style={{ fontSize: '20px', fontWeight: '950', marginTop: '4px', fontFamily: "'Fredoka', sans-serif" }}>
                {user.rank === 1 ? '1st' : user.rank === 2 ? '2nd' : '3rd'}
              </span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LeaderboardPodium;
