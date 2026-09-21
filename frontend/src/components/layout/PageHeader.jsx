import React from 'react';
import Button from '../common/Button';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, onActionClick, actionLabel, children }) {
  return (
    <div className="page-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--dark)' }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
        {onActionClick && actionLabel && (
          <Button onClick={onActionClick} variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Plus size={16} />
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
