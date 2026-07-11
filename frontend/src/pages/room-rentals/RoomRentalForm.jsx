import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { roomApi } from '../../api/roomApi';
import { tenantApi } from '../../api/tenantApi';
import { validateRequired, validatePositiveNumber } from '../../utils/validateForm';

export default function RoomRentalForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    roomId: '',
    representativeTenantId: '',
    startDate: '',
    expectedEndDate: '',
    monthlyRentPrice: '',
    depositAmount: '',
    depositPaidAmount: '',
    depositPaidAt: '',
    depositNote: '',
  });

  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [roomsList, tenantsList] = await Promise.all([
          roomApi.getAll(),
          tenantApi.getAll(),
        ]);
        
        // When creating, filter only AVAILABLE rooms. When editing, include the current room even if OCCUPIED.
        const filteredRooms = roomsList.filter(r => r.status === 'AVAILABLE' || (initialData && r.id === initialData.roomId));
        setRooms(filteredRooms);
        setTenants(tenantsList);
      } catch (err) {
        console.error('Failed to load form options', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        roomId: initialData.roomId ?? '',
        representativeTenantId: initialData.representativeTenantId ?? '',
        startDate: initialData.startDate ?? '',
        expectedEndDate: initialData.expectedEndDate ?? '',
        monthlyRentPrice: initialData.monthlyRentPrice ?? '',
        depositAmount: initialData.depositAmount ?? '',
        depositPaidAmount: initialData.depositPaidAmount ?? '',
        depositPaidAt: initialData.depositPaidAt ? initialData.depositPaidAt.substring(0, 16) : '',
        depositNote: initialData.depositNote ?? '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Automatically fill defaults if room is selected
    if (name === 'roomId' && value) {
      const selectedRoom = rooms.find(r => r.id === parseInt(value, 10));
      if (selectedRoom) {
        setFormData(prev => ({
          ...prev,
          roomId: value,
          monthlyRentPrice: selectedRoom.baseRentPrice,
          depositAmount: selectedRoom.defaultDepositAmount,
          depositPaidAmount: selectedRoom.defaultDepositAmount,
        }));
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateRequired(formData.roomId)) newErrors.roomId = 'Vui lòng chọn phòng trọ';
    if (!validateRequired(formData.representativeTenantId)) newErrors.representativeTenantId = 'Vui lòng chọn khách đại diện';
    if (!validateRequired(formData.startDate)) newErrors.startDate = 'Ngày bắt đầu thuê không được trống';
    if (!validateRequired(formData.monthlyRentPrice) || !validatePositiveNumber(formData.monthlyRentPrice)) newErrors.monthlyRentPrice = 'Giá thuê phải lớn hơn hoặc bằng 0';
    if (!validateRequired(formData.depositAmount) || !validatePositiveNumber(formData.depositAmount)) newErrors.depositAmount = 'Tiền đặt cọc phải lớn hơn hoặc bằng 0';
    if (formData.expectedEndDate && formData.startDate && new Date(formData.expectedEndDate) < new Date(formData.startDate)) {
      newErrors.expectedEndDate = 'Ngày kết thúc dự kiến không được nhỏ hơn ngày bắt đầu thuê';
    }
    if (formData.depositPaidAmount && parseFloat(formData.depositPaidAmount) > parseFloat(formData.depositAmount)) {
      newErrors.depositPaidAmount = 'Tiền cọc đã trả không được lớn hơn tổng tiền cọc thỏa thuận';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      roomId: parseInt(formData.roomId, 10),
      representativeTenantId: parseInt(formData.representativeTenantId, 10),
      monthlyRentPrice: parseFloat(formData.monthlyRentPrice),
      depositAmount: parseFloat(formData.depositAmount),
      depositPaidAmount: formData.depositPaidAmount ? parseFloat(formData.depositPaidAmount) : 0,
      depositPaidAt: formData.depositPaidAt ? formData.depositPaidAt + ':00' : null,
      expectedEndDate: formData.expectedEndDate || null,
      depositNote: formData.depositNote || null,
    });
  };

  if (loadingOptions) return <Loading />;

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="responsive-grid-2">
        <Select
          label="Phòng trọ"
          name="roomId"
          value={formData.roomId}
          onChange={handleChange}
          options={rooms.map(r => ({ value: r.id, label: `Phòng ${r.roomNumber} - Tầng ${r.floor ?? 'Trệt'} (${r.area}m²)` }))}
          required
          placeholder="Chọn phòng"
          error={errors.roomId}
          disabled={!!initialData}
        />
        <Select
          label="Khách thuê đại diện"
          name="representativeTenantId"
          value={formData.representativeTenantId}
          onChange={handleChange}
          options={tenants.map(t => ({ value: t.id, label: `${t.fullName} (${t.phone})` }))}
          required
          placeholder="Chọn người đại diện"
          error={errors.representativeTenantId}
          disabled={!!initialData}
        />
      </div>
      <div className="responsive-grid-2">
        <Input
          label="Ngày bắt đầu thuê"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
          error={errors.startDate}
        />
        <Input
          label="Ngày kết thúc dự kiến"
          name="expectedEndDate"
          type="date"
          value={formData.expectedEndDate}
          onChange={handleChange}
          error={errors.expectedEndDate}
        />
      </div>
      <div className="responsive-grid-2">
        <Input
          label="Giá thuê thực tế (VNĐ / Tháng)"
          name="monthlyRentPrice"
          type="number"
          value={formData.monthlyRentPrice}
          onChange={handleChange}
          required
          error={errors.monthlyRentPrice}
        />
        <Input
          label="Tổng tiền đặt cọc thỏa thuận (VNĐ)"
          name="depositAmount"
          type="number"
          value={formData.depositAmount}
          onChange={handleChange}
          required
          error={errors.depositAmount}
        />
      </div>
      <div className="responsive-grid-2">
        <Input
          label="Tiền cọc đã nhận thực tế (VNĐ)"
          name="depositPaidAmount"
          type="number"
          value={formData.depositPaidAmount}
          onChange={handleChange}
          error={errors.depositPaidAmount}
        />
        <Input
          label="Thời điểm đóng cọc"
          name="depositPaidAt"
          type="datetime-local"
          value={formData.depositPaidAt}
          onChange={handleChange}
        />
      </div>
      <Input
        label="Ghi chú đặt cọc"
        name="depositNote"
        value={formData.depositNote}
        onChange={handleChange}
        placeholder="Ghi chú về biên lai đóng cọc, tài sản bàn giao..."
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu hợp đồng</Button>
      </div>
    </form>
  );
}
