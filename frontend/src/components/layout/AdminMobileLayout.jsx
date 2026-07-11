import React from 'react';
import MobileAppLayout from './MobileAppLayout';

export default function AdminMobileLayout({ children, title = 'Quản Lý Nhà Trọ', showBack = false, action = null, onBackClick = null }) {
  return (
    <MobileAppLayout title={title} role="admin" showBack={showBack} action={action} onBackClick={onBackClick}>
      {children}
    </MobileAppLayout>
  );
}
