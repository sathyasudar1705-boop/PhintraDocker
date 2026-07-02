import React from 'react';

const Table = ({ children, className = '', containerStyle = {}, ...props }) => {
  return (
    <div className="saas-table-container" style={containerStyle}>
      <table className={`saas-table ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export default Table;
