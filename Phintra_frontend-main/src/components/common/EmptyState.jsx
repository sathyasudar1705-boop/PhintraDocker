import React from 'react';

const EmptyState = ({
  title = 'No records found',
  description,
  icon: Icon,
  action,
  className = '',
  ...props
}) => {
  return (
    <div className={`empty-state ${className}`} {...props}>
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={28} />
        </div>
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && (
        <div style={{ marginTop: '12px' }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
