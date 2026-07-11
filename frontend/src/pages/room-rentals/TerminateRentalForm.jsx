import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateRequired, validatePositiveNumber } from '../../utils/validateForm';
import { toLocalDateString, toLocalISOString, formatDate } from '../../utils/formatDate';

export default function TerminateRentalForm({ rental, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    moveOutDate: '',
    depositDeductionAmount: '0',
    depositReturnAmount: '',
    depositReturnedAt: '',
    depositNote: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (rental) {
      const depositPaid = rental.depositPaidAmount || 0;
      setFormData((prev) => ({
        ...prev,
        moveOutDate: toLocalDateString(new Date()),
        depositReturnAmount: String(depositPaid),
        depositReturnedAt: toLocalISOString(new Date()),
        depositNote: `Hoàn tất trả phòng. Trả cọc ngày ${formatDate(new Date())}`,
      }));
    }
  }, [rental]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto recalculate depositReturnAmount when deduction changes
      if (name === 'depositDeductionAmount') {
        const depositPaid = rental ? rental.depositPaidAmount : 0;
        const deduction = value ? parseFloat(value) : 0;
        if (!isNaN(deduction)) {
          updated.depositReturnAmount = String(Math.max(0, depositPaid - deduction));
        }
      }
      
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateRequired(formData.moveOutDate)) newErrors.moveOutDate = 'Ngày chuyển đi không được trống';
    if (!validateRequired(formData.depositDeductionAmount) || !validatePositiveNumber(formData.depositDeductionAmount)) {
      newErrors.depositDeductionAmount = 'Tiền khấu trừ phạt cọc/chi phí đền bù phải là số không âm';
    }
    if (!validateRequired(formData.depositReturnAmount) || !validatePositiveNumber(formData.depositReturnAmount)) {
      newErrors.depositReturnAmount = 'Tiền hoàn trả cọc phải là số không âm';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      moveOutDate: formData.moveOutDate,
      depositDeductionAmount: parseFloat(formData.depositDeductionAmount),
      depositReturnAmount: parseFloat(formData.depositReturnAmount),
      depositReturnedAt: formData.depositReturnedAt ? formData.depositReturnedAt + ':00' : null,
      depositNote: formData.depositNote || null,
    });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div style={{ backgroundColor: 'var(--secondary-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
        <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
          <strong>Mã số phòng:</strong> Phòng {rental?.roomNumber}
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
          <strong>Người đại diện:</strong> {rental?.representativeTenantName}
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          <strong>Tiền cọc thực tế đã đóng:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rental?.depositPaidAmount || 0)}</span>
        </p>
      </div>

      <div className="responsive-grid-2">
        <Input
          label="Ngày chuyển đi (Move out)"
          name="moveOutDate"
          type="date"
          value={formData.moveOutDate}
          onChange={handleChange}
          required
          error={errors.moveOutDate}
        />
        <Input
          label="Khấu trừ / Phạt cọc (VNĐ)"
          name="depositDeductionAmount"
          type="number"
          value={formData.depositDeductionAmount}
          onChange={handleChange}
          required
          error={errors.depositDeductionAmount}
        />
      </div>

      <div className="responsive-grid-2">
        <Input
          label="Tiền trả cọc thực tế (VNĐ)"
          name="depositReturnAmount"
          type="number"
          value={formData.depositReturnAmount}
          onChange={handleChange}
          required
          error={errors.depositReturnAmount}
        />
        <Input
          label="Thời điểm trả cọc"
          name="depositReturnedAt"
          type="datetime-local"
          value={formData.depositReturnedAt}
          onChange={handleChange}
        />
      </div>

      <Input
        label="Lý do khấu trừ / Biên bản thanh lý"
        name="depositNote"
        value={formData.depositNote}
        onChange={handleChange}
        placeholder="Mô tả lý do phạt cọc, hỏng hóc thiết bị..."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="danger">Xác nhận trả phòng & chấm dứt</Button>
      </div>
    </form>
  );
}
