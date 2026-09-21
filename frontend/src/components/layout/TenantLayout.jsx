import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  DoorOpen,
  Receipt,
  CreditCard,
  Wrench,
  FileText,
  User,
  LogOut,
  Building,
  Menu,
  X
} from 'lucide-react';

const tenantMenuItems = [
  { path: '/tenant/dashboard', label: 'Trang chủ của tôi', icon: Home },
  { path: '/tenant/my-room', label: 'Phòng đang thuê', icon: DoorOpen },
  { path: '/tenant/my-invoices', label: 'Hóa đơn dịch vụ', icon: Receipt },
  { path: '/tenant/my-payments', label: 'Lịch sử thanh toán', icon: CreditCard },
  { path: '/tenant/my-maintenance', label: 'Báo hỏng / Sửa chữa', icon: Wrench },
  { path: '/tenant/my-contracts', label: 'Hồ sơ hợp đồng', icon: FileText },
  { path: '/tenant/profile', label: 'Tài khoản cá nhân', icon: User },
];

export default function TenantLayout({ children, title = 'Cổng Khách Thuê' }) {
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
    localStorage.removeItem('token');
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
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)' }}>
              <Building size={18} />
            </div>
            <div>
              <span className="sidebar-logo-text">RRMS</span>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>CỔNG KHÁCH THUÊ</div>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu">
            <X size={18} />
          </button>
        </div>

        <ul className="sidebar-menu">
          {tenantMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="sidebar-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer User Card */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 700, fontSize: '0.8125rem' }}>
              {tenantName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {tenantName}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>Khách thuê phòng</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              padding: '7px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.75rem',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
          >
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Mở menu">
              <Menu size={18} />
            </button>
            <div className="header-title-section">
              <h1 className="header-title">{title}</h1>
              <span className="header-subtitle">Cổng thông tin & Tiện ích dành cho Khách thuê</span>
            </div>
          </div>
          <div className="header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#f0f9ff', borderRadius: '20px', border: '1px solid #bae6fd' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tenantName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0369a1' }}>
                {tenantName}
              </span>
            </div>
          </div>
        </header>

        <main className="content-pane">
          {children}
        </main>
      </div>
    </div>
  );
}
