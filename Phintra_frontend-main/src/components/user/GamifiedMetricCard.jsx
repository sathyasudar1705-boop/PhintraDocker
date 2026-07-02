import React from 'react';
import { motion } from 'framer-motion';

const GamifiedMetricCard = ({ title, value, subtitle, icon: Icon, colorTheme = 'blue', delay = 0 }) => {
  const getColors = () => {
    switch (colorTheme) {
      case 'pink':
        return {
          iconBg: '#fdf2f8',
          iconColor: '#db2777',
          glowColor: 'rgba(219, 39, 119, 0.15)',
          barColor: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
        };
      case 'teal':
        return {
          iconBg: '#f0fdfa',
          iconColor: '#0d9488',
          glowColor: 'rgba(13, 148, 136, 0.15)',
          barColor: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
        };
      case 'yellow':
        return {
          iconBg: '#fffbeb',
          iconColor: '#d97706',
          glowColor: 'rgba(217, 119, 6, 0.15)',
          barColor: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
        };
      case 'red':
        return {
          iconBg: '#fdf2f2',
          iconColor: '#ef4444',
          glowColor: 'rgba(239, 68, 68, 0.15)',
          barColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        };
      default: // blue
        return {
          iconBg: '#eff6ff',
          iconColor: '#2563eb',
          glowColor: 'rgba(37, 99, 235, 0.15)',
          barColor: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
        };
    }
  };

  const theme = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay, ease: 'easeOut' }}
      whileHover={{ y: -6, boxShadow: `0 12px 30px ${theme.glowColor}` }}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
        cursor: 'pointer',
        height: '100%'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: theme.barColor }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '750', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
            {value}
          </h3>
        </div>

        {Icon && (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: theme.iconBg,
            color: theme.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
          {subtitle}
        </span>
      )}
    </motion.div>
  );
};

export default GamifiedMetricCard;
