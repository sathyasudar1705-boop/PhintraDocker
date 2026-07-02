import React from 'react';
import { motion } from 'framer-motion';

const AchievementBadge = ({ name, description, icon: Icon, isUnlocked }) => {
  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.08, boxShadow: '0 8px 24px rgba(6, 182, 212, 0.2)' } : {}}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        opacity: isUnlocked ? 1 : 0.45,
        filter: isUnlocked ? 'none' : 'grayscale(1)',
        width: '120px',
        textAlign: 'center',
        position: 'relative'
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: isUnlocked ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : '#e2e8f0',
        color: isUnlocked ? '#ffffff' : '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        boxShadow: isUnlocked ? '0 4px 12px rgba(6, 182, 212, 0.2)' : 'none'
      }}>
        {Icon && <Icon size={22} />}
      </div>
      <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', display: 'block', marginBottom: '2px' }}>
        {name}
      </span>
      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '600', lineHeight: '1.2' }}>
        {description}
      </span>
    </motion.div>
  );
};

export default AchievementBadge;
