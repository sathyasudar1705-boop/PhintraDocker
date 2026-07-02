import React from 'react';
import { motion } from 'framer-motion';

const StreakBadge = ({ streak, size = 'md' }) => {
  const isSm = size === 'sm';
  const padding = isSm ? '2px 8px' : '4px 12px';
  const fontSize = isSm ? '11px' : '13px';
  const emojiSize = isSm ? '12px' : '15px';

  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: '#fff7ed',
        border: '1px solid #ffedd5',
        borderRadius: '99px',
        padding: padding,
        fontSize: fontSize,
        fontWeight: '800',
        color: '#ea580c',
        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
        width: 'fit-content',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}
      title={`${streak}-day active streak!`}
    >
      <span style={{ fontSize: emojiSize }}>🔥</span>
      <span>{streak}d Streak</span>
    </motion.div>
  );
};

export default StreakBadge;
