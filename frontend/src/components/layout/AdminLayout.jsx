import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  FileSpreadsheet,
  FileText,
  Zap,
  Receipt,
  CreditCard,
  Wrench,
  Settings,
  LogOut,
  Building2,
  ShieldCheck,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

const adminMenuItems = [
  { path: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { path: '/admin/rooms', label: 'Phòng trọ', icon: Home },
  { path: '/admin/tenants', label: 'Khách thuê', icon: UserCheck },
  { path: '/admin/rentals', label: 'Hợp đồng thuê', icon: FileSpreadsheet },
  { path: '/admin/rental-members', label: 'Thành viên phòng', icon: Users },
  { path: '/admin/contract-files', label: 'Hồ sơ hợp đồng', icon: FileText },
  { path: '/admin/utility-rates', label: 'Đơn giá dịch vụ', icon: ShieldCheck },
  { path: '/admin/meter-readings', label: 'Chỉ số điện nước', icon: Zap },
  { path: '/admin/invoices', label: 'Hóa đơn', icon: Receipt },
  { path: '/admin/payments', label: 'Lịch sử thanh toán', icon: CreditCard },
  { path: '/admin/maintenance', label: 'Yêu cầu sửa chữa', icon: Wrench },
  { path: '/admin/users', label: 'Quản lý tài khoản', icon: Settings },
];

export default function AdminLayout({ children, title = 'Cổng Quản Trị' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminName = localStorage.getItem('adminName') || 'Chủ trọ / Quản lý';

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
    localStorage.removeItem('token');
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
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)' }}>
              <Building2 size={18} />
            </div>
            <div>
              <span className="sidebar-logo-text">RRMS</span>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>QUẢN LÝ NHÀ TRỌ</div>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu">
            <X size={18} />
          </button>
        </div>

        <ul className="sidebar-menu">
          {adminMenuItems.map((item) => {
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
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontWeight: 700, fontSize: '0.8125rem' }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {adminName}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>Chủ nhà / Quản lý</div>
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
              <span className="header-subtitle">Hệ thống Quản lý Nhà trọ & Phòng cho thuê</span>
            </div>
          </div>
          <div className="header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#f1f5f9', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                {adminName}
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
