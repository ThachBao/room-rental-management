import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const tenantMenuItems = [
  { path: '/tenant/dashboard', label: 'Trang của tôi', icon: '🏡' },
  { path: '/tenant/my-room', label: 'Phòng đang thuê', icon: '🛏️' },
  { path: '/tenant/my-invoices', label: 'Hóa đơn của tôi', icon: '🧾' },
  { path: '/tenant/my-payments', label: 'Thanh toán của tôi', icon: '💳' },
  { path: '/tenant/my-maintenance', label: 'Báo hỏng / Sửa chữa', icon: '🔧' },
  { path: '/tenant/my-contracts', label: 'Hợp đồng của tôi', icon: '📄' },
  { path: '/tenant/profile', label: 'Thông tin cá nhân', icon: '👤' },
];

export default function TenantLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tenantName = localStorage.getItem('demoTenantName') || 'Khách thuê trọ';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar overlay is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('demoTenantId');
    localStorage.removeItem('demoTenantName');
    navigate('/tenant/login');
  };

  return (
    <div className="app-container">
      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`} style={{ backgroundColor: '#1e293b' }}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu">
          ✕
        </button>
        <div className="sidebar-logo">
          <span className="sidebar-logo-text" style={{ background: 'linear-gradient(135deg, #a7f3d0 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Cổng Người Thuê
          </span>
        </div>
        <ul className="sidebar-menu">
          {tenantMenuItems.map((item) => (
            <li key={item.path} className="sidebar-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => isActive ? { backgroundColor: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' } : {}}
              >
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 'var(--fs-sm)'
            }}
          >
            Đổi vai trò / Đăng xuất
          </button>
        </div>
        <div className="sidebar-footer">
          Cổng tự phục vụ khách thuê
        </div>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Mở menu">
              ☰
            </button>
            <div className="header-title-section">
              <h1 className="header-title" style={{ color: '#10b981' }}>Cổng Người Thuê</h1>
              <span className="header-subtitle">Thông tin tiện ích, hóa đơn và yêu cầu sửa chữa</span>
            </div>
          </div>
          <div className="header-actions">
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }} className="hide-mobile">Xin chào, {tenantName}</span>
          </div>
        </header>
        <main className="content-pane">
          {children}
        </main>
      </div>
    </div>
  );
}
