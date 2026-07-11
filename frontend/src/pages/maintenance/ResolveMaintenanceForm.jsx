import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateRequired, validatePositiveNumber } from '../../utils/validateForm';
import { toLocalISOString } from '../../utils/formatDate';

export default function ResolveMaintenanceForm({ request, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    resolvedNote: '',
    repairCost: '0',
    resolvedAt: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      resolvedNote: 'Đã hoàn thành sửa chữa thiết bị',
      repairCost: '0',
      resolvedAt: toLocalISOString(new Date()),
    });
  }, []);

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

    if (!validateRequired(formData.resolvedNote)) newErrors.resolvedNote = 'Ghi chú sửa chữa không được để trống';
    if (!validateRequired(formData.repairCost) || !validatePositiveNumber(formData.repairCost)) {
      newErrors.repairCost = 'Chi phí sửa chữa phải là số không âm';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      resolvedNote: formData.resolvedNote.trim(),
      repairCost: parseFloat(formData.repairCost),
      resolvedAt: formData.resolvedAt ? formData.resolvedAt + ':00' : null,
    });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div style={{ backgroundColor: 'var(--secondary-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.9rem' }}>
        <p style={{ marginBottom: '4px' }}><strong>Phòng báo sự cố:</strong> Phòng {request?.roomNumber}</p>
        <p style={{ marginBottom: '4px' }}><strong>Sự cố:</strong> {request?.title}</p>
        <p><strong>Chi tiết lỗi:</strong> {request?.description}</p>
      </div>

      <div className="form-group">
        <label className="form-label">Nội dung / Ghi chú sửa chữa (vật tư thay thế) *</label>
        <textarea
          name="resolvedNote"
          className="form-control"
          rows="3"
          value={formData.resolvedNote}
          onChange={handleChange}
          required
        />
        {errors.resolvedNote && <div className="form-error-msg">{errors.resolvedNote}</div>}
      </div>

      <div className="responsive-grid-2">
        <Input
          label="Tổng chi phí sửa chữa (VNĐ)"
          name="repairCost"
          type="number"
          value={formData.repairCost}
          onChange={handleChange}
          required
          error={errors.repairCost}
        />
        <Input
          label="Thời điểm hoàn thành"
          name="resolvedAt"
          type="datetime-local"
          value={formData.resolvedAt}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="success">Hoàn thành sửa chữa</Button>
      </div>
    </form>
  );
}
// 
