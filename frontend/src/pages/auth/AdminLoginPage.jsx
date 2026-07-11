import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clear old auth
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
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

      const response = await userApi.login(phone.trim(), password.trim());

      if (response.userRole !== 'LANDLORD') {
        setError('Tài khoản của bạn không có quyền truy cập trang quản trị.');
        return;
      }

      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('adminId', response.id);
      localStorage.setItem('adminName', response.fullName);
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
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
          <KeyRound size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
          Hệ thống Chủ trọ
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Đăng nhập dành cho Chủ trọ / Ban quản lý
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
          label="Số điện thoại đăng nhập"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
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
          {loading ? 'Đang xác thực...' : 'Đăng nhập Quản lý'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Bạn là khách thuê trọ? </span>
        <Link to="/tenant/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
          Đến trang Khách thuê
        </Link>
      </div>
    </div>
  );
}
