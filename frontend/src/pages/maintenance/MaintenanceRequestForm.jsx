import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { roomRentalApi } from '../../api/roomRentalApi';
import { rentalMemberApi } from '../../api/rentalMemberApi';
import { MAINTENANCE_PRIORITY } from '../../constants/maintenanceStatus';
import { validateRequired } from '../../utils/validateForm';

const priorityOptions = [
  { value: MAINTENANCE_PRIORITY.LOW, label: 'Thấp' },
  { value: MAINTENANCE_PRIORITY.MEDIUM, label: 'Trung bình' },
  { value: MAINTENANCE_PRIORITY.HIGH, label: 'Cao' },
];

export default function MaintenanceRequestForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    roomId: '',
    rentalId: '',
    tenantId: '',
    title: '',
    description: '',
    priority: MAINTENANCE_PRIORITY.MEDIUM,
  });

  const [rentals, setRentals] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadActiveRentals() {
      try {
        setLoadingOptions(true);
        const list = await roomRentalApi.getAll('ACTIVE');
        setRentals(list);
      } catch (err) {
        console.error('Failed to load active rentals for maintenance', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadActiveRentals();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        roomId: initialData.roomId ?? '',
        rentalId: initialData.rentalId ?? '',
        tenantId: initialData.tenantId ?? '',
        title: initialData.title ?? '',
        description: initialData.description ?? '',
        priority: initialData.priority ?? MAINTENANCE_PRIORITY.MEDIUM,
      });
      
      // Load members for the current rental ID
      if (initialData.rentalId) {
        loadRentalMembers(initialData.rentalId);
      }
    }
  }, [initialData]);

  const loadRentalMembers = async (rentalIdVal) => {
    try {
      setLoadingMembers(true);
      const members = await rentalMemberApi.getAll(rentalIdVal);
      // Filter out members who already moved out
      const activeMembers = members.filter(m => !m.moveOutDate);
      setTenants(activeMembers);
    } catch (e) {
      console.error('Failed to load members for rental', e);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'rentalId') {
      if (value) {
        const selectedRental = rentals.find(r => r.id === parseInt(value, 10));
        if (selectedRental) {
          setFormData(prev => ({
            ...prev,
            rentalId: value,
            roomId: selectedRental.roomId,
            tenantId: '', // Reset tenant selection
          }));
          loadRentalMembers(value);
        }
      } else {
        setFormData(prev => ({ ...prev, rentalId: '', roomId: '', tenantId: '' }));
        setTenants([]);
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.rentalId) newErrors.rentalId = 'Vui lòng chọn lượt thuê phòng';
    if (!formData.tenantId) newErrors.tenantId = 'Vui lòng chọn khách báo hỏng';
    if (!validateRequired(formData.title)) newErrors.title = 'Tiêu đề không được để trống';
    if (!validateRequired(formData.description)) newErrors.description = 'Mô tả chi tiết sự cố là bắt buộc';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      roomId: parseInt(formData.roomId, 10),
      rentalId: parseInt(formData.rentalId, 10),
      tenantId: parseInt(formData.tenantId, 10),
    });
  };

  if (loadingOptions) return <Loading />;

  return (
    <form onSubmit={handleFormSubmit}>
      <Select
        label="Hợp đồng thuê phòng báo sự cố"
        name="rentalId"
        value={formData.rentalId}
        onChange={handleChange}
        options={rentals.map(r => ({ value: r.id, label: `Phòng ${r.roomNumber} - Đại diện: ${r.representativeTenantName}` }))}
        required
        placeholder="Chọn hợp đồng thuê đang hoạt động"
        error={errors.rentalId}
        disabled={!!initialData}
      />
      
      <Select
        label="Người báo sự cố (khách trong phòng)"
        name="tenantId"
        value={formData.tenantId}
        onChange={handleChange}
        options={tenants.map(t => ({ value: t.tenantId, label: `${t.tenantName} (${roleOptionsLabel(t.memberRole)})` }))}
        required
        placeholder={loadingMembers ? "Đang tải thành viên phòng..." : "Chọn thành viên báo cáo"}
        error={errors.tenantId}
        disabled={loadingMembers || tenants.length === 0 || !!initialData}
      />

      <div className="responsive-grid-2-1">
        <Input
          label="Tiêu đề sự cố"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ví dụ: Rò nước, Hỏng bóng đèn..."
          required
          error={errors.title}
        />
        <Select
          label="Mức độ ưu tiên"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={priorityOptions}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Mô tả sự cố & Vị trí hỏng hóc *</label>
        <textarea
          name="description"
          className="form-control"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả kỹ tình trạng hỏng hóc thiết bị..."
          required
        />
        {errors.description && <div className="form-error-msg">{errors.description}</div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lập yêu cầu</Button>
      </div>
    </form>
  );
}

function roleOptionsLabel(role) {
  return role === 'REPRESENTATIVE' ? 'Đại diện' : 'Thành viên';
}
