import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { validateRequired, validatePhone } from '../../utils/validateForm';

const roleOptions = [
  { value: 'LANDLORD', label: 'Chủ trọ / Quản lý' },
  { value: 'TENANT', label: 'Khách thuê phòng' },
];

export default function UserForm({ initialData, onSubmit, onCancel, isCurrentUserRoot }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    userRole: 'TENANT',
    enabled: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName ?? '',
        phone: initialData.phone ?? '',
        password: '', // Keep blank unless changing
        userRole: initialData.userRole ?? 'TENANT',
        enabled: initialData.enabled ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateRequired(formData.fullName)) newErrors.fullName = 'Họ và tên không được để trống';
    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!initialData) {
      if (!validateRequired(formData.password)) {
        newErrors.password = 'Mật khẩu là bắt buộc đối với tài khoản mới';
      } else if (formData.password.trim().length < 6) {
        newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
      }
    } else {
      if (formData.password && formData.password.trim().length < 6) {
        newErrors.password = 'Mật khẩu mới phải chứa ít nhất 6 ký tự';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      password: formData.password ? formData.password : undefined,
    });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Input
        label="Họ và tên chủ tài khoản"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        required
        error={errors.fullName}
      />
      <div className="responsive-grid-2">
        <Input
          label="Số điện thoại đăng nhập"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          error={errors.phone}
        />
        <Select
          label="Vai trò hệ thống"
          name="userRole"
          value={formData.userRole}
          onChange={handleChange}
          options={roleOptions}
          required
          disabled={!isCurrentUserRoot}
        />
      </div>
      <Input
        label={initialData ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu đăng nhập"}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required={!initialData}
        error={errors.password}
      />
      
      {initialData && (
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={formData.enabled}
            onChange={handleChange}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="enabled" style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            Tài khoản đang hoạt động (Enabled)
          </label>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu tài khoản</Button>
      </div>
    </form>
  );
}
