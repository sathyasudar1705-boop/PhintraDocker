import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'resolved':
      case 'completed':
      case 'passed':
        return { bg: '#ecfdf5', text: '#059669', border: '1px solid #a7f3d0' };
      case 'under review':
      case 'in_progress':
      case 'pending':
        return { bg: '#fffbeb', text: '#d97706', border: '1px solid #fde68a' };
      case 'failed':
      case 'not_started':
        return { bg: '#fdf2f2', text: '#ef4444', border: '1px solid #fca5a5' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '1px solid #cbd5e1' };
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
      {status}
    </span>
  );
};

export default StatusBadge;
