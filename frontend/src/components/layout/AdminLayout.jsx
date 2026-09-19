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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)' }}>
              <Building2 size={20} />
            </div>
            <div>
              <span className="sidebar-logo-text" style={{ fontSize: '1.1rem', fontWeight: 800 }}>RRMS</span>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quản Lý Nhà Trọ</div>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu" style={{ color: '#94a3b8' }}>
            <X size={20} />
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
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer User Card */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(15, 23, 42, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {adminName}
              </div>
              <div style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>Chủ trọ / Admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        <header className="main-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#ffffff', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 40, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Mở menu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-light)', border: 'none', borderRadius: '8px', width: '38px', height: '38px', cursor: 'pointer', color: 'var(--dark)' }}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="header-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--dark)' }}>{title}</h1>
              <span className="header-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hệ thống Quản lý Nhà trọ & Phòng cho thuê</span>
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary-hover)', padding: '6px 12px', borderRadius: '20px' }}>
              👤 {adminName}
            </span>
          </div>
        </header>

        <main className="content-pane" style={{ padding: '24px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
