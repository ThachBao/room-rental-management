import React from 'react';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';

export default function MobileAppLayout({
  children,
  title,
  role = 'tenant',
  showBack = false,
  action = null,
  onBackClick = null
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-main)'
      }}
    >
      <AppHeader
        title={title}
        showBack={showBack}
        action={action}
        onBackClick={onBackClick}
      />
      
      <main
        style={{
          flex: 1,
          padding: '16px',
          paddingBottom: '80px', // Đảm bảo không bị che bởi BottomNav
          overflowY: 'auto'
        }}
      >
        {children}
      </main>

      <BottomNav role={role} />
    </div>
  );
}
