import React from 'react';

const RiskBadge = ({ riskLevel }) => {
  const getBadgeStyle = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return { bg: '#ecfdf5', text: '#059669', border: '1px solid #a7f3d0' };
      case 'high':
      case 'critical':
        return { bg: '#fdf2f2', text: '#ef4444', border: '1px solid #fca5a5' };
      default: // medium
        return { bg: '#fffbeb', text: '#d97706', border: '1px solid #fde68a' };
    }
  };

  const style = getBadgeStyle();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '99px',
      fontSize: '11px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      backgroundColor: style.bg,
      color: style.text,
      border: style.border
    }}>
      {riskLevel}
    </span>
  );
};

export default RiskBadge;
