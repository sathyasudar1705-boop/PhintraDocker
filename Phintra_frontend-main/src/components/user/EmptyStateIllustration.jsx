import React from 'react';
import { motion } from 'framer-motion';

const EmptyStateIllustration = ({ title, description }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
      width: '100%'
    }}>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{
          width: '140px',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          overflow: 'hidden'
        }}
      >
        <img 
          src="/images/empty_state.png" 
          alt="Empty State Illustration" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
      </motion.div>
      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', margin: 0, maxWidth: '320px', lineHeight: '1.5', fontWeight: '600' }}>
        {description}
      </p>
    </div>
  );
};

export default EmptyStateIllustration;
