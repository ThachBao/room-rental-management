import React from 'react';

export default function Button({ children, type = 'button', variant = 'secondary', size = 'md', onClick, disabled, style }) {
  const className = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''}`;
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
