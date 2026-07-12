import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import ProvinceInput from '../../components/common/ProvinceInput';
import Button from '../../components/common/Button';
import { validateRequired, validatePhone } from '../../utils/validateForm';

export default function TenantForm({ initialData, onSubmit, onCancel }) {
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName ?? '',
        phone: initialData.phone ?? '',
        identityNumber: initialData.identityNumber ?? '',
        dateOfBirth: initialData.dateOfBirth ?? '',
        address: initialData.address ?? '',
        emergencyContactName: initialData.emergencyContactName ?? '',
        emergencyContactPhone: initialData.emergencyContactPhone ?? '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateRequired(formData.fullName)) newErrors.fullName = 'Họ và tên khách thuê không được để trống';
    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Số điện thoại liên hệ là bắt buộc';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (phải gồm 9-11 chữ số)';
    }

    if (formData.emergencyContactPhone && !validatePhone(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Số điện thoại liên hệ khẩn cấp không hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      identityNumber: formData.identityNumber ? formData.identityNumber.trim() : null,
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
      address: formData.address ? formData.address.trim() : null,
      emergencyContactName: formData.emergencyContactName ? formData.emergencyContactName.trim() : null,
      emergencyContactPhone: formData.emergencyContactPhone ? formData.emergencyContactPhone.trim() : null,
    });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Input
        label="Họ và tên khách thuê"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        required
        error={errors.fullName}
      />
      <div className="responsive-grid-2">
        <Input
          label="Số điện thoại"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          error={errors.phone}
        />
        <Input
          label="Số CCCD / Hộ chiếu"
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
        <ProvinceInput
          label="Quê quán / Hộ khẩu"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      <div className="responsive-grid-2">
        <Input
          label="Người liên hệ khẩn cấp"
          name="emergencyContactName"
          value={formData.emergencyContactName}
          onChange={handleChange}
          placeholder="Ví dụ: Bố/Mẹ/Anh chị..."
        />
        <Input
          label="SĐT liên hệ khẩn cấp"
          name="emergencyContactPhone"
          value={formData.emergencyContactPhone}
          onChange={handleChange}
          error={errors.emergencyContactPhone}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu lại</Button>
      </div>
    </form>
  );
}
