import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { ROOM_STATUS } from '../../constants/roomStatus';
import { validateRequired, validatePositiveNumber, validateStrictlyPositiveNumber } from '../../utils/validateForm';

const statusOptions = [
  { value: ROOM_STATUS.AVAILABLE, label: 'Còn trống' },
  { value: ROOM_STATUS.OCCUPIED, label: 'Đang thuê' },
  { value: ROOM_STATUS.MAINTENANCE, label: 'Đang bảo trì' },
  { value: ROOM_STATUS.INACTIVE, label: 'Ngưng sử dụng' },
];

export default function RoomForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    area: '',
    maxPeople: '',
    baseRentPrice: '',
    defaultDepositAmount: '',
    description: '',
    status: ROOM_STATUS.AVAILABLE,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        roomNumber: initialData.roomNumber ?? '',
        floor: initialData.floor ?? '',
        area: initialData.area ?? '',
        maxPeople: initialData.maxPeople ?? '',
        baseRentPrice: initialData.baseRentPrice ?? '',
        defaultDepositAmount: initialData.defaultDepositAmount ?? '',
        description: initialData.description ?? '',
        status: initialData.status ?? ROOM_STATUS.AVAILABLE,
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

    if (!validateRequired(formData.roomNumber)) newErrors.roomNumber = 'Mã số phòng không được để trống';
    if (!validateRequired(formData.area) || !validateStrictlyPositiveNumber(formData.area)) newErrors.area = 'Diện tích phòng phải lớn hơn 0';
    if (!validateRequired(formData.maxPeople) || !validateStrictlyPositiveNumber(formData.maxPeople)) newErrors.maxPeople = 'Số người ở tối đa phải từ 1 trở lên';
    if (!validateRequired(formData.baseRentPrice) || !validatePositiveNumber(formData.baseRentPrice)) newErrors.baseRentPrice = 'Giá thuê mặc định phải lớn hơn hoặc bằng 0';
    if (!validateRequired(formData.defaultDepositAmount) || !validatePositiveNumber(formData.defaultDepositAmount)) newErrors.defaultDepositAmount = 'Tiền cọc mặc định phải lớn hơn hoặc bằng 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      floor: formData.floor ? parseInt(formData.floor, 10) : null,
      area: parseFloat(formData.area),
      maxPeople: parseInt(formData.maxPeople, 10),
      baseRentPrice: parseFloat(formData.baseRentPrice),
      defaultDepositAmount: parseFloat(formData.defaultDepositAmount),
    });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Input
        label="Số phòng"
        name="roomNumber"
        value={formData.roomNumber}
        onChange={handleChange}
        required
        error={errors.roomNumber}
      />
      <div className="responsive-grid-2">
        <Input
          label="Tầng"
          name="floor"
          type="number"
          value={formData.floor}
          onChange={handleChange}
          placeholder="Ví dụ: 1"
          error={errors.floor}
        />
        <Input
          label="Diện tích (m²)"
          name="area"
          type="number"
          step="0.01"
          value={formData.area}
          onChange={handleChange}
          required
          error={errors.area}
        />
      </div>
      <div className="responsive-grid-2">
        <Input
          label="Số người ở tối đa"
          name="maxPeople"
          type="number"
          value={formData.maxPeople}
          onChange={handleChange}
          required
          error={errors.maxPeople}
        />
        <Select
          label="Trạng thái phòng"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          required
        />
      </div>
      <div className="responsive-grid-2">
        <Input
          label="Giá thuê gốc (VNĐ)"
          name="baseRentPrice"
          type="number"
          value={formData.baseRentPrice}
          onChange={handleChange}
          required
          error={errors.baseRentPrice}
        />
        <Input
          label="Tiền đặt cọc mặc định (VNĐ)"
          name="defaultDepositAmount"
          type="number"
          value={formData.defaultDepositAmount}
          onChange={handleChange}
          required
          error={errors.defaultDepositAmount}
        />
      </div>
      <Input
        label="Mô tả / Tiện nghi phòng"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Mô tả chi tiết phòng trọ..."
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu thông tin</Button>
      </div>
    </form>
  );
}
