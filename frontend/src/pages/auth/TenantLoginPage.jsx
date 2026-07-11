import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { tenantApi } from '../../api/tenantApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Home, ShieldAlert } from 'lucide-react';

export default function TenantLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clear old auth
    localStorage.removeItem('userRole');
    localStorage.removeItem('demoTenantId');
    localStorage.removeItem('demoTenantName');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ số điện thoại và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userResponse = await userApi.login(phone.trim(), password.trim());

      if (userResponse.userRole !== 'TENANT') {
        setError('Tài khoản của bạn không có quyền truy cập cổng khách thuê.');
        return;
      }

      if (userResponse.token) {
        localStorage.setItem('token', userResponse.token);
      }

      // Find the corresponding tenant profile in the database
      let matchingTenant;
      try {
        const tenantsList = await tenantApi.getAll();
        matchingTenant = tenantsList.find(
          t => t.phone === userResponse.phone || t.userId === userResponse.id
        );
      } catch (err) {
        localStorage.removeItem('token');
        throw err;
      }

      if (!matchingTenant) {
        localStorage.removeItem('token');
        setError('Tài khoản chưa được liên kết với hợp đồng phòng nào. Vui lòng liên hệ chủ trọ.');
        return;
      }

      localStorage.setItem('userRole', 'tenant');
      localStorage.setItem('demoTenantId', matchingTenant.id);
      localStorage.setItem('demoTenantName', matchingTenant.fullName);

      navigate('/tenant/home');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Home size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
          Cổng khách thuê
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Đăng nhập xem phòng, hóa đơn và gửi báo cáo sự cố
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '12px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <Input
          label="Số điện thoại của bạn"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại được chủ trọ cấp"
          required
        />
        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          required
        />

        <Button
          type="submit"
          variant="primary"
          style={{ width: '100%', padding: '12px', marginTop: '12px', minHeight: '44px', fontWeight: 700 }}
          disabled={loading}
        >
          {loading ? 'Đang kiểm tra...' : 'Đăng nhập Thành viên'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Bạn là chủ nhà trọ? </span>
        <Link to="/admin/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
          Đến trang Quản lý
        </Link>
      </div>
    </div>
  );
}
