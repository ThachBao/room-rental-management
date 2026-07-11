import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Receipt, Wrench, FileText, User, LayoutDashboard, DoorOpen, Users, ClipboardList } from 'lucide-react';

export default function BottomNav({ role = 'tenant' }) {
  const tenantItems = [
    { path: '/tenant/home', label: 'Trang chủ', icon: Home },
    { path: '/tenant/bills', label: 'Hóa đơn', icon: Receipt },
    { path: '/tenant/maintenance', label: 'Báo hỏng', icon: Wrench },
    { path: '/tenant/contracts', label: 'Hợp đồng', icon: FileText },
    { path: '/tenant/profile', label: 'Cá nhân', icon: User },
  ];

  const adminItems = [
    { path: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/admin/rooms', label: 'Phòng trọ', icon: DoorOpen },
    { path: '/admin/rentals', label: 'Thuê phòng', icon: ClipboardList },
    { path: '/admin/invoices', label: 'Hóa đơn', icon: Receipt },
    { path: '/admin/profile', label: 'Cá nhân', icon: User },
  ];

  const items = role === 'admin' ? adminItems : tenantItems;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        margin: '0 auto',
        maxWidth: '430px',
        height: '60px',
        backgroundColor: 'var(--light)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
      }}
      className="bottom-nav-container"
    >
      {items.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <NavLink
            key={idx}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: isActive ? '700' : '500',
              flex: 1,
              height: '100%',
              gap: '4px',
              transition: 'color var(--transition-fast)'
            })}
          >
            <IconComponent size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
