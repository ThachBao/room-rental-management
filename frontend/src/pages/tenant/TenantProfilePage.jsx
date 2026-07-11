import React, { useState, useEffect } from 'react';
import { tenantApi } from '../../api/tenantApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Toast from '../../components/common/Toast';
import { validateRequired, validatePhone } from '../../utils/validateForm';
import { getErrorMessage } from '../../utils/errorHandler';
import { User, Phone, Calendar, MapPin, Contact2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TenantProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    identityNumber: '',
    dateOfBirth: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    async function loadProfile() {
      const demoTenantId = localStorage.getItem('demoTenantId');
      if (!demoTenantId) {
        setError('Không tìm thấy thông tin định danh khách thuê.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await tenantApi.getById(demoTenantId);
        setFormData({
          fullName: data.fullName ?? '',
          phone: data.phone ?? '',
          identityNumber: data.identityNumber ?? '',
          dateOfBirth: data.dateOfBirth ?? '',
          address: data.address ?? '',
          emergencyContactName: data.emergencyContactName ?? '',
          emergencyContactPhone: data.emergencyContactPhone ?? '',
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('demoTenantId');
    localStorage.removeItem('demoTenantName');
    navigate('/tenant/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateRequired(formData.fullName)) newErrors.fullName = 'Họ và tên không được để trống';
    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Số điện thoại liên hệ là bắt buộc';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (formData.emergencyContactPhone && !validatePhone(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Số điện thoại liên hệ khẩn cấp không hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const demoTenantId = localStorage.getItem('demoTenantId');
      const payload = {
        ...formData,
        identityNumber: formData.identityNumber ? formData.identityNumber.trim() : null,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
        address: formData.address ? formData.address.trim() : null,
        emergencyContactName: formData.emergencyContactName ? formData.emergencyContactName.trim() : null,
        emergencyContactPhone: formData.emergencyContactPhone ? formData.emergencyContactPhone.trim() : null,
      };

      await tenantApi.update(demoTenantId, payload);
      showToast('Cập nhật hồ sơ cá nhân thành công!');
      // Update saved name in localStorage
      localStorage.setItem('demoTenantName', formData.fullName);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Profile Header Avatar */}
      <div style={{ textAlign: 'center', margin: '8px 0 20px 0' }}>
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
          {formData.fullName.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, margin: 0 }}>{formData.fullName}</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{formData.phone}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Thông tin cơ bản">
          <Input
            label="Họ và tên cư dân"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            error={errors.fullName}
          />
          <div className="responsive-grid-2">
            <Input
              label="Số điện thoại di động"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              error={errors.phone}
            />
            <Input
              label="Số CMND / CCCD / Hộ chiếu"
              name="identityNumber"
              value={formData.identityNumber}
              onChange={handleChange}
              error={errors.identityNumber}
            />
          </div>
          <div className="responsive-grid-2">
            <Input
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            <Input
              label="Quê quán / Thường trú"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </Card>

        <Card title="Liên hệ khẩn cấp">
          <div className="responsive-grid-2">
            <Input
              label="Họ tên người liên hệ khẩn cấp"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              placeholder="Người thân..."
            />
            <Input
              label="SĐT người liên hệ khẩn cấp"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              error={errors.emergencyContactPhone}
            />
          </div>
        </Card>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', minHeight: '44px', fontWeight: 700 }}
          >
            Lưu thay đổi hồ sơ
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
              gap: '6px',
              backgroundColor: '#fee2e2',
              color: 'var(--danger)',
              borderColor: '#fca5a5'
            }}
          >
            <LogOut size={16} />
            Đăng xuất tài khoản
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
