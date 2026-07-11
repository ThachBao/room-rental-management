import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function AppHeader({ title, showBack = false, action, onBackClick }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        height: '56px',
        backgroundColor: 'var(--light)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 999,
        boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '40px' }}>
        {showBack && (
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-light)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>

      <h2
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--dark)',
          margin: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {title}
      </h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: '40px' }}>
        {action || null}
      </div>
    </header>
  );
}
