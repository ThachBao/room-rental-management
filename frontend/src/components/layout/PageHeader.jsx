import React from 'react';
import Button from '../common/Button';

export default function PageHeader({ title, onActionClick, actionLabel, children }) {
  return (
    <div className="page-actions-bar">
      <div>
        <h2 style={{ fontSize: 'var(--fs-xl)', fontFamily: 'var(--font-heading)' }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
        {onActionClick && actionLabel && (
          <Button onClick={onActionClick} variant="primary">
            <span>➕</span> {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
