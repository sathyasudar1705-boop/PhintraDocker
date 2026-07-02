import React from 'react';

const ProgressCard = ({ title, value, max = 100, icon: Icon, color = 'var(--color-teal)', isLoading, ...props }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="saas-card" {...props}>
      {isLoading ? (
        <div>
          <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
          <div className="skeleton skeleton-title" style={{ width: '60%' }}></div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>{title}</span>
            {Icon && (
              <div style={{ color }}>
                <Icon size={20} />
              </div>
            )}
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-main)', marginBottom: '8px' }}>
            {value} <span style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: '500' }}>/ {max}</span>
          </h2>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${percentage}%`, 
              height: '100%', 
              backgroundColor: color 
            }} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressCard;
