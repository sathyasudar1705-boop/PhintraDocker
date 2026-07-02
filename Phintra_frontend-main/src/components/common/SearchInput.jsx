import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = React.forwardRef(({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  ...props
}, ref) => {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: '100%', maxWidth: '320px' }}>
      <Search 
        size={18} 
        color="var(--text-light)" 
        style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} 
      />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-control ${className}`}
        style={{ paddingLeft: '38px', height: '38px', fontSize: '13px' }}
        {...props}
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
