import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Shield } from 'lucide-react';

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
              width: '130px',
              zIndex: isFirst ? 10 : 1
            }}
          >
            {/* Avatar & Rank badge on top */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <motion.div
                animate={isFirst ? { y: [0, -6, 0] } : {}}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                style={{
                  width: isFirst ? '70px' : '56px',
                  height: isFirst ? '70px' : '56px',
                  borderRadius: '50%',
                  border: `3px solid ${badge.trophyColor}`,
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  boxShadow: isFirst ? '0 10px 25px rgba(234, 179, 8, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img 
                  src={user.rank === 1 ? '/rank1.png' : (user.rank === 2 ? '/rank2.png' : (user.rank === 3 ? '/rank3.png' : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`))} 
                  alt={user.name} 
                  style={{ width: '90%', height: '90%', objectFit: 'cover' }}
                />
              </motion.div>
              
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: badge.trophyColor,
                color: '#ffffff',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '900',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                background: isFirst ? 'linear-gradient(185deg, #fef08a 0%, #facc15 100%)' : 'linear-gradient(185deg, #f1f5f9 0%, #cbd5e1 100%)',
                border: '1px solid ' + (isFirst ? '#fde047' : '#e2e8f0'),
                borderRadius: '12px 12px 0 0',
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFirst ? '#854d0e' : '#475569',
                boxShadow: '0 -4px 10px rgba(0,0,0,0.02)'
              }}
            >
              <Trophy size={isFirst ? 28 : 20} style={{ opacity: 0.8 }} />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LeaderboardPodium;
