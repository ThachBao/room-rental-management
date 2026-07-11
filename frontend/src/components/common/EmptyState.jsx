import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Không có dữ liệu hiển thị.', icon: Icon = Inbox }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        textAlign: 'center',
        backgroundColor: 'var(--light)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-color)',
        color: 'var(--text-muted)'
      }}
    >
      <Icon size={44} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
      <p style={{ fontSize: 'var(--fs-base)', fontWeight: 500 }}>{message}</p>
    </div>
  );
}
