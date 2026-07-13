import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { getErrorMessage } from '../../utils/errorHandler';
import { LogOut } from 'lucide-react';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  const adminId = localStorage.getItem('adminId');

  useEffect(() => {
    async function loadProfile() {
      if (!adminId) {
        setError('Không tìm thấy thông tin định danh quản trị viên.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getById(adminId);
        setFormData({
          fullName: data.fullName ?? '',
          phone: data.phone ?? '',
        });
        // Sync adminName in localStorage if it differs
        if (data.fullName) {
          localStorage.setItem('adminName', data.fullName);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [adminId]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  if (loading) return <Loading />;

  const displayAdminName = formData.fullName || localStorage.getItem('adminName') || 'Chủ trọ / Quản lý';

  return (
    <div>
      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Profile Header */}
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
          {displayAdminName.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, margin: 0 }}>{displayAdminName}</h3>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: '4px' }}>Chủ nhà trọ</p>
      </div>

      <Card title="Thông tin tài khoản">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 4px' }}>
          <div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Họ và tên</div>
            <div style={{ fontSize: 'var(--fs-md)', fontWeight: 500, color: 'var(--text)' }}>{formData.fullName || '---'}</div>
          </div>
          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: 0 }} />
          <div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Số điện thoại đăng nhập</div>
            <div style={{ fontSize: 'var(--fs-md)', fontWeight: 500, color: 'var(--text)' }}>{formData.phone || '---'}</div>
          </div>
        </div>
      </Card>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
        <Button
          type="button"
          variant="secondary"
          onClick={handleLogout}
          style={{
            width: '100%',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#fee2e2',
            color: 'var(--danger)',
            borderColor: '#fca5a5',
            fontWeight: 700
          }}
        >
          <LogOut size={18} />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
