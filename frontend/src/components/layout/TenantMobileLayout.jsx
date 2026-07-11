import React from 'react';
import MobileAppLayout from './MobileAppLayout';

export default function TenantMobileLayout({ children, title = 'Cổng Người Thuê', showBack = false, action = null, onBackClick = null }) {
  return (
    <MobileAppLayout title={title} role="tenant" showBack={showBack} action={action} onBackClick={onBackClick}>
      {children}
    </MobileAppLayout>
  );
}
