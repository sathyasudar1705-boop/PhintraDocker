import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={inputId}
        className={`form-control ${className}`}
        {...props}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
