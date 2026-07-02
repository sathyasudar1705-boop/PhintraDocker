import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, isLoading, iconBg = 'var(--color-primary-light)', iconColor = 'var(--color-primary)', trend, ...props }) => {
  return (
    <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} {...props}>
      {isLoading ? (
        <div style={{ width: '100%' }}>
          <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
          <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
        </div>
      ) : (
        <>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>{title}</span>
            <h2 style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-main)', margin: '4px 0 2px 0' }}>{value}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              {trend}
              <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{subtext}</span>
            </div>
          </div>
          {Icon && (
            <div style={{ 
              backgroundColor: iconBg, 
              color: iconColor, 
              padding: '12px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Icon size={24} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatCard;
