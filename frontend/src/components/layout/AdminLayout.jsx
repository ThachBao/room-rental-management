import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const adminMenuItems = [
  { path: '/admin/dashboard', label: 'Tổng quan', icon: '📊' },
  { path: '/admin/rooms', label: 'Phòng trọ', icon: '🏠' },
  { path: '/admin/tenants', label: 'Người thuê', icon: '👥' },
  { path: '/admin/room-rentals', label: 'Lượt thuê phòng', icon: '📋' },
  { path: '/admin/rental-members', label: 'Thành viên phòng', icon: '🧑‍🤝‍🧑' },
  { path: '/admin/contract-files', label: 'Hồ sơ hợp đồng', icon: '📄' },
  { path: '/admin/utility-rates', label: 'Đơn giá dịch vụ', icon: '💡' },
  { path: '/admin/meter-readings', label: 'Chỉ số điện nước', icon: '🔢' },
  { path: '/admin/invoices', label: 'Hóa đơn', icon: '🧾' },
  { path: '/admin/payments', label: 'Thanh toán', icon: '💳' },
  { path: '/admin/maintenance-requests', label: 'Yêu cầu sửa chữa', icon: '🔧' },
  { path: '/admin/users', label: 'Quản lý tài khoản', icon: '⚙️' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-close sidebar on route change (mobile navigation)
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
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  };

  return (
    <div className="app-container">
      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu">
          ✕
        </button>
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">Quản Lý Nhà Trọ</span>
        </div>
        <ul className="sidebar-menu">
          {adminMenuItems.map((item) => (
            <li key={item.path} className="sidebar-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
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
          Hệ thống quản lý nhà trọ
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
              <h1 className="header-title" style={{ color: 'var(--primary)' }}>Cổng Quản Trị</h1>
              <span className="header-subtitle">Hệ thống quản lý nhà trọ chuyên nghiệp</span>
            </div>
          </div>
          <div className="header-actions">
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }} className="hide-mobile">Chủ trọ / Quản lý</span>
          </div>
        </header>
        <main className="content-pane">
          {children}
        </main>
      </div>
    </div>
  );
}
