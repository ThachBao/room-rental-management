import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      padding: '16px'
    }}>
      <div className="card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: 'var(--space-card)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {children}
      </div>
    </div>
  );
}
