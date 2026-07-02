import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  const classNames = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    loading ? 'btn-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classNames}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSize} className="btn-spinner" />
      ) : Icon ? (
        <Icon size={iconSize} />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight size={iconSize} />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
