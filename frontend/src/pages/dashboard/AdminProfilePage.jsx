import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Toast from '../../components/common/Toast';
import { validateRequired, validatePhone } from '../../utils/validateForm';
import { getErrorMessage } from '../../utils/errorHandler';
import { LogOut } from 'lucide-react';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [originalRole, setOriginalRole] = useState('LANDLORD');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

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
          password: '',
        });
        setOriginalRole(data.userRole ?? 'LANDLORD');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateRequired(formData.fullName)) {
      newErrors.fullName = 'Họ và tên không được để trống';
    }
    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Số điện thoại liên hệ là bắt buộc';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (formData.password && formData.password.trim().length < 6) {
      newErrors.password = 'Mật khẩu mới phải chứa ít nhất 6 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        userRole: originalRole,
        enabled: true,
      };

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const updatedUser = await userApi.update(adminId, payload);
      showToast('Cập nhật thông tin tài khoản thành công!');
      
      // Update stored name in localStorage
      localStorage.setItem('adminName', updatedUser.fullName);
      
      // Clear password field after success
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
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

      <form onSubmit={handleSubmit}>
        <Card title="Thông tin tài khoản">
          <Input
            label="Họ và tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            error={errors.fullName}
          />
          <Input
            label="Số điện thoại đăng nhập"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            error={errors.phone}
          />
          <Input
            label="Mật khẩu mới (để trống nếu không đổi)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            error={errors.password}
          />
        </Card>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', minHeight: '44px', fontWeight: 700 }}
          >
            Lưu thay đổi
          </Button>

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
              borderColor: '#fca5a5'
            }}
          >
            <LogOut size={18} />
            Đăng xuất
          </Button>
        </div>
      </form>

      {/* Toast alert */}
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
