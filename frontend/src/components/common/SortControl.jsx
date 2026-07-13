import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function SortControl({ 
  sortBy, 
  onSortByChange, 
  sortDirection, 
  onSortDirectionChange, 
  options = [] 
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sắp xếp:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            backgroundColor: 'var(--light)',
            color: 'var(--text-main)',
            flex: 1,
            outline: 'none',
            cursor: 'pointer',
            height: '32px'
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--light)',
          cursor: 'pointer',
          height: '32px',
          width: '32px',
          transition: 'all var(--transition-fast)'
        }}
        title={sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
      >
        {sortDirection === 'asc' ? (
          <ArrowUp size={16} style={{ color: 'var(--primary)' }} />
        ) : (
          <ArrowDown size={16} style={{ color: 'var(--primary)' }} />
        )}
      </button>
    </div>
  );
}
