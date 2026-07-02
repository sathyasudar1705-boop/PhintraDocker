import React from 'react';

const Badge = ({ children, variant = 'info', className = '', ...props }) => {
  const getBadgeClass = (v) => {
    const variantLower = v.toLowerCase();
    switch (variantLower) {
      case 'success':
      case 'low':
      case 'passed':
      case 'resolved':
      case 'completed':
        return 'badge-success';
      case 'warning':
      case 'medium':
      case 'investigating':
      case 'in-progress':
      case 'draft':
        return 'badge-warning';
      case 'danger':
      case 'high':
      case 'failed':
      case 'new':
      case 'not-started':
        return 'badge-danger';
      case 'primary':
      case 'info':
      case 'reported':
      case 'active':
        return 'badge-reported';
      default:
        return `badge-${variantLower}`;
    }
  };

  return (
    <span className={`badge ${getBadgeClass(variant)} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
