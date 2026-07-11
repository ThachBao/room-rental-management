import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { User, Shield, CreditCard, Settings, Users, Droplet, FileText, ArrowRightLeft, LogOut, Wrench, UserCheck } from 'lucide-react';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName') || 'Chủ trọ / Quản lý';

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  };

  const menuLinks = [
    { label: 'Quản lý người thuê', path: '/admin/tenants', icon: UserCheck, color: '#22c55e' },
    { label: 'Yêu cầu báo hỏng', path: '/admin/maintenance', icon: Wrench, color: '#ef4444' },
    { label: 'Thành viên phòng', path: '/admin/rental-members', icon: Users, color: '#3b82f6' },
    { label: 'Hồ sơ hợp đồng', path: '/admin/contract-files', icon: FileText, color: '#8b5cf6' },
    { label: 'Đơn giá dịch vụ', path: '/admin/utility-rates', icon: Shield, color: '#f59e0b' },
    { label: 'Lịch sử thanh toán', path: '/admin/payments', icon: CreditCard, color: '#ec4899' },
    { label: 'Quản lý tài khoản', path: '/admin/users', icon: Settings, color: '#64748b' },
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', margin: '16px 0 24px 0' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            fontSize: '32px',
            fontWeight: 'bold',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {adminName.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, margin: 0 }}>{adminName}</h3>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: '4px' }}>Chủ nhà trọ / Quản trị viên</p>
      </div>

      <Card title="Chức năng mở rộng">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuLinks.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eaeaea'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconComponent size={20} />
                  </div>
                  <span style={{ fontSize: 'var(--fs-base)', fontWeight: 600 }}>{item.label}</span>
                </div>
                <span style={{ color: 'var(--text-light)', fontSize: '18px' }}>&rsaquo;</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ marginTop: '24px' }}>
        <Button
          variant="secondary"
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#fee2e2',
            color: 'var(--danger)',
            borderColor: '#fca5a5'
          }}
        >
          <LogOut size={18} />
          Đăng xuất / Đổi vai trò
        </Button>
      </div>
    </div>
  );
}
