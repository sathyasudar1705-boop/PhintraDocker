import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`saas-card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
