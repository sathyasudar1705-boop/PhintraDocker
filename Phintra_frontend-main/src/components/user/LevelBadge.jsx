import React from 'react';
import { Shield } from 'lucide-react';

const LevelBadge = ({ level, size = 'md' }) => {
  const getBadgeStyle = () => {
    if (level >= 15) {
      return {
        background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
        color: '#ffffff',
        border: '1.5px solid #d8b4fe',
        shadow: '0 4px 10px rgba(168, 85, 247, 0.3)'
      };
    }
    if (level >= 10) {
      return {
        background: 'linear-gradient(135deg, #ca8a04 0%, #facc15 100%)',
        color: '#ffffff',
        border: '1.5px solid #fef08a',
        shadow: '0 4px 10px rgba(202, 138, 4, 0.3)'
      };
    }
    if (level >= 5) {
      return {
        background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
        color: '#ffffff',
        border: '1.5px solid #99f6e4',
        shadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
      };
    }
    return {
      background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      color: '#ffffff',
      border: '1.5px solid #bfdbfe',
      shadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
    };
  };

  const style = getBadgeStyle();
  const dimension = size === 'lg' ? '48px' : size === 'sm' ? '28px' : '36px';
  const fontSize = size === 'lg' ? '16px' : size === 'sm' ? '11px' : '13px';
  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 12 : 16;

  return (
    <div 
      className="level-badge-container"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: style.background,
        color: style.color,
        border: style.border,
        boxShadow: style.shadow,
        width: dimension,
        height: dimension,
        borderRadius: '10px',
        fontWeight: '800',
        fontSize: fontSize,
        position: 'relative',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}
      title={`Level ${level}`}
    >
      <Shield size={iconSize} style={{ opacity: 0.15, position: 'absolute' }} />
      <span style={{ zIndex: 2 }}>{level}</span>
    </div>
  );
};

export default LevelBadge;
