import React from 'react';

const ChartCard = ({ title, children, isLoading, height = '320px', ...props }) => {
  return (
    <div className="saas-card" style={{ display: 'flex', flexDirection: 'column' }} {...props}>
      <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>{title}</h3>
      {isLoading ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="skeleton skeleton-card" style={{ width: '100%', height: '100%' }}></div>
        </div>
      ) : (
        <div style={{ height }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default ChartCard;
