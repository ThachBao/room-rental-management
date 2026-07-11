import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { roomRentalApi } from '../../api/roomRentalApi';
import { meterReadingApi } from '../../api/meterReadingApi';
import { validateRequired, validatePositiveNumber } from '../../utils/validateForm';

export default function MeterReadingForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    rentalId: '',
    billingMonth: '',
    oldElectricNumber: '0',
    newElectricNumber: '',
    oldWaterNumber: '0',
    newWaterNumber: '',
  });

  const [rentals, setRentals] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadActiveRentals() {
      try {
        setLoadingOptions(true);
        const list = await roomRentalApi.getAll('ACTIVE');
        setRentals(list);
      } catch (err) {
        console.error('Failed to load active rentals for readings', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadActiveRentals();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        rentalId: initialData.rentalId ?? '',
        billingMonth: initialData.billingMonth ?? '',
        oldElectricNumber: String(initialData.oldElectricNumber ?? 0),
        newElectricNumber: String(initialData.newElectricNumber ?? ''),
        oldWaterNumber: String(initialData.oldWaterNumber ?? 0),
        newWaterNumber: String(initialData.newWaterNumber ?? ''),
      });
    } else {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setFormData((prev) => ({
        ...prev,
        billingMonth: currentMonth,
      }));
    }
  }, [initialData]);

  // Load previous reading when rentalId or billingMonth changes
  const loadPreviousReading = async (rentalIdVal) => {
    if (!rentalIdVal || initialData) return;
    try {
      const readings = await meterReadingApi.getAll({ rentalId: rentalIdVal });
      if (readings && readings.length > 0) {
        // Sort by billingMonth descending to get latest
        const sorted = [...readings].sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));
        const latest = sorted[0];
        setFormData(prev => ({
          ...prev,
          oldElectricNumber: String(latest.newElectricNumber),
          oldWaterNumber: String(latest.newWaterNumber),
          newElectricNumber: '',
          newWaterNumber: '',
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          oldElectricNumber: '0',
          oldWaterNumber: '0',
          newElectricNumber: '',
          newWaterNumber: '',
        }));
      }
    } catch (e) {
      console.error('Error fetching previous reading', e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'rentalId') {
      loadPreviousReading(value);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateRequired(formData.rentalId)) newErrors.rentalId = 'Vui lòng chọn lượt thuê chốt số';
    if (!validateRequired(formData.billingMonth)) newErrors.billingMonth = 'Tháng chốt số không được để trống';
    if (!validateRequired(formData.oldElectricNumber) || !validatePositiveNumber(formData.oldElectricNumber)) newErrors.oldElectricNumber = 'Chỉ số điện cũ phải lớn hơn hoặc bằng 0';
    if (!validateRequired(formData.newElectricNumber) || !validatePositiveNumber(formData.newElectricNumber)) newErrors.newElectricNumber = 'Chỉ số điện mới không được trống';
    if (!validateRequired(formData.oldWaterNumber) || !validatePositiveNumber(formData.oldWaterNumber)) newErrors.oldWaterNumber = 'Chỉ số nước cũ phải lớn hơn hoặc bằng 0';
    if (!validateRequired(formData.newWaterNumber) || !validatePositiveNumber(formData.newWaterNumber)) newErrors.newWaterNumber = 'Chỉ số nước mới không được trống';

    const oldElec = parseInt(formData.oldElectricNumber, 10);
    const newElec = parseInt(formData.newElectricNumber, 10);
    const oldWater = parseInt(formData.oldWaterNumber, 10);
    const newWater = parseInt(formData.newWaterNumber, 10);

    if (newElec < oldElec) newErrors.newElectricNumber = 'Chỉ số điện mới không được nhỏ hơn chỉ số cũ';
    if (newWater < oldWater) newErrors.newWaterNumber = 'Chỉ số nước mới không được nhỏ hơn chỉ số cũ';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      rentalId: parseInt(formData.rentalId, 10),
      billingMonth: formData.billingMonth,
      oldElectricNumber: oldElec,
      newElectricNumber: newElec,
      oldWaterNumber: oldWater,
      newWaterNumber: newWater,
    });
  };

  if (loadingOptions) return <Loading />;

  return (
    <form onSubmit={handleFormSubmit}>
      <Select
        label="Phòng trọ cần chốt số"
        name="rentalId"
        value={formData.rentalId}
        onChange={handleChange}
        options={rentals.map(r => ({ value: r.id, label: `Phòng ${r.roomNumber} (${r.representativeTenantName})` }))}
        required
        placeholder="Chọn lượt thuê phòng hoạt động"
        error={errors.rentalId}
        disabled={!!initialData}
      />
      <Input
        label="Tháng chốt chỉ số"
        name="billingMonth"
        type="month"
        value={formData.billingMonth}
        onChange={handleChange}
        required
        error={errors.billingMonth}
        disabled={!!initialData}
      />
      <div style={{ backgroundColor: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>⚡ Chỉ số điện năng</h4>
        <div className="responsive-grid-2">
          <Input
            label="Chỉ số điện cũ"
            name="oldElectricNumber"
            type="number"
            value={formData.oldElectricNumber}
            onChange={handleChange}
            required
            error={errors.oldElectricNumber}
          />
          <Input
            label="Chỉ số điện mới"
            name="newElectricNumber"
            type="number"
            value={formData.newElectricNumber}
            onChange={handleChange}
            required
            error={errors.newElectricNumber}
          />
        </div>
      </div>

      <div style={{ backgroundColor: '#e0f2fe', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: '#0369a1', fontWeight: 'bold' }}>💧 Chỉ số nước tiêu thụ</h4>
        <div className="responsive-grid-2">
          <Input
            label="Chỉ số nước cũ"
            name="oldWaterNumber"
            type="number"
            value={formData.oldWaterNumber}
            onChange={handleChange}
            required
            error={errors.oldWaterNumber}
          />
          <Input
            label="Chỉ số nước mới"
            name="newWaterNumber"
            type="number"
            value={formData.newWaterNumber}
            onChange={handleChange}
            required
            error={errors.newWaterNumber}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu chỉ số</Button>
      </div>
    </form>
  );
}
