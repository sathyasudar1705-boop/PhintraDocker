import React from 'react';
import { motion } from 'framer-motion';

const XPProgressBar = ({ progress, label, xpReward, colorClass = 'blue' }) => {
  const percent = Math.min(Math.max(0, progress), 100);

  const getGradient = () => {
    if (colorClass === 'pink') {
      return 'linear-gradient(90deg, #ec4899 0%, #a855f7 100%)';
    }
    if (colorClass === 'green') {
      return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    }
    return 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)'; // default blue/cyan
  };

  return (
    <div className="xp-progress-component" style={{ width: '100%' }}>
      {(label || xpReward) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          {label && <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{label}</span>}
          {xpReward && (
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', background: '#fef3c7', padding: '2px 8px', borderRadius: '99px' }}>
              +{xpReward} XP Reward
            </span>
          )}
        </div>
      )}
      
      <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: getGradient(),
            borderRadius: '99px',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>{Math.round(percent)}%</span>
      </div>
    </div>
  );
};

export default XPProgressBar;
