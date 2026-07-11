import React from 'react';

export default function Card({ children, title, className = '', onClick, style = {} }) {
  const isClickable = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      className={`card ${className}`}
      style={{
        backgroundColor: 'var(--light)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        padding: '16px',
        marginBottom: '16px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        position: 'relative',
        ...style
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      {title && (
        <h3
          className="card-title"
          style={{
            fontSize: 'var(--fs-md)',
            fontWeight: 700,
            color: 'var(--dark)',
            marginBottom: '12px',
            fontFamily: 'var(--font-heading)'
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
