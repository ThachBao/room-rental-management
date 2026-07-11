import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { roomRentalApi } from '../../api/roomRentalApi';
import { tenantApi } from '../../api/tenantApi';
import { validateRequired } from '../../utils/validateForm';
import { toLocalDateString } from '../../utils/formatDate';

const roleOptions = [
  { value: 'REPRESENTATIVE', label: 'Người đại diện' },
  { value: 'OCCUPANT', label: 'Thành viên ở cùng' },
];

export default function RentalMemberForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    rentalId: '',
    tenantId: '',
    memberRole: 'OCCUPANT',
    moveInDate: '',
    note: '',
  });

  const [rentals, setRentals] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [rentalsList, tenantsList] = await Promise.all([
          roomRentalApi.getAll('ACTIVE'),
          tenantApi.getAll(),
        ]);
        setRentals(rentalsList);
        setTenants(tenantsList);
      } catch (err) {
        console.error('Failed to load members form options', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        rentalId: initialData.rentalId ?? '',
        tenantId: initialData.tenantId ?? '',
        memberRole: initialData.memberRole ?? 'OCCUPANT',
        moveInDate: initialData.moveInDate ?? '',
        note: initialData.note ?? '',
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        moveInDate: toLocalDateString(new Date()),
      }));
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

    if (!validateRequired(formData.rentalId)) newErrors.rentalId = 'Vui lòng chọn lượt thuê phòng';
    if (!validateRequired(formData.tenantId)) newErrors.tenantId = 'Vui lòng chọn thành viên khách thuê';
    if (!validateRequired(formData.moveInDate)) newErrors.moveInDate = 'Ngày chuyển vào không được trống';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      rentalId: parseInt(formData.rentalId, 10),
      tenantId: parseInt(formData.tenantId, 10),
      note: formData.note || null,
    });
  };

  if (loadingOptions) return <Loading />;

  return (
    <form onSubmit={handleFormSubmit}>
      <Select
        label="Chọn lượt thuê phòng trọ"
        name="rentalId"
        value={formData.rentalId}
        onChange={handleChange}
        options={rentals.map(r => ({ value: r.id, label: `Phòng ${r.roomNumber} - Đại diện: ${r.representativeTenantName}` }))}
        required
        placeholder="Chọn phòng đang hoạt động"
        error={errors.rentalId}
        disabled={!!initialData}
      />
      <Select
        label="Chọn khách thuê"
        name="tenantId"
        value={formData.tenantId}
        onChange={handleChange}
        options={tenants.map(t => ({ value: t.id, label: `${t.fullName} (${t.phone})` }))}
        required
        placeholder="Chọn khách thuê thành viên"
        error={errors.tenantId}
        disabled={!!initialData}
      />
      <div>
        <Select
          label="Vai trò lưu trú"
          name="memberRole"
          value={formData.memberRole}
          onChange={handleChange}
          options={roleOptions}
          required
          disabled={true}
        />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '16px', fontStyle: 'italic' }}>
          * Người đại diện được gán tự động khi lập hợp đồng. Thành viên thêm thủ công mặc định là Thành viên ở cùng.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <Input
          label="Ngày chuyển vào"
          name="moveInDate"
          type="date"
          value={formData.moveInDate}
          onChange={handleChange}
          required
          error={errors.moveInDate}
        />
      </div>
      <Input
        label="Ghi chú thành viên"
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder="Ghi chú thêm về việc lưu trú..."
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu lại</Button>
      </div>
    </form>
  );
}
