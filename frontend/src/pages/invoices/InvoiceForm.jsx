import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { roomRentalApi } from '../../api/roomRentalApi';
import { meterReadingApi } from '../../api/meterReadingApi';
import { validateRequired, validatePositiveNumber } from '../../utils/validateForm';
import { toLocalDateString } from '../../utils/formatDate';

export default function InvoiceForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    rentalId: '',
    billingMonth: '',
    dueDate: '',
    otherFee: '0',
    discountAmount: '0',
    note: '',
    oldElectricNumber: '0',
    newElectricNumber: '',
    oldWaterNumber: '0',
    newWaterNumber: '',
  });

  const [rentals, setRentals] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingMeter, setLoadingMeter] = useState(false);
  const [existingReading, setExistingReading] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadActiveRentals() {
      try {
        setLoadingOptions(true);
        const list = await roomRentalApi.getAll('ACTIVE');
        setRentals(list);
      } catch (err) {
        console.error('Failed to load active rentals for invoices', err);
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
        dueDate: initialData.dueDate ?? '',
        otherFee: String(initialData.otherFee ?? 0),
        discountAmount: String(initialData.discountAmount ?? 0),
        note: initialData.note ?? '',
        oldElectricNumber: String(initialData.electricUsage ? (initialData.meterReading?.oldElectricNumber ?? 0) : 0),
        newElectricNumber: String(initialData.electricUsage ? (initialData.meterReading?.newElectricNumber ?? 0) : 0),
        oldWaterNumber: String(initialData.waterUsage ? (initialData.meterReading?.oldWaterNumber ?? 0) : 0),
        newWaterNumber: String(initialData.waterUsage ? (initialData.meterReading?.newWaterNumber ?? 0) : 0),
      });
    } else {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const fiveDaysLater = new Date();
      fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
      const dueDateStr = toLocalDateString(fiveDaysLater);

      setFormData((prev) => ({
        ...prev,
        billingMonth: currentMonth,
        dueDate: dueDateStr,
      }));
    }
  }, [initialData]);

  // Load meter readings history to fetch or pre-fill old index
  const loadMeterReadingHistory = async (rentalId, billingMonth) => {
    if (!rentalId || !billingMonth) return;
    try {
      setLoadingMeter(true);
      const list = await meterReadingApi.getAll({ rentalId });
      
      // 1. Check if a reading already exists for this exact month
      const existing = list.find(r => r.billingMonth === billingMonth);
      if (existing) {
        setExistingReading(existing);
        setFormData(prev => ({
          ...prev,
          oldElectricNumber: String(existing.oldElectricNumber),
          newElectricNumber: String(existing.newElectricNumber),
          oldWaterNumber: String(existing.oldWaterNumber),
          newWaterNumber: String(existing.newWaterNumber),
        }));
      } else {
        setExistingReading(null);
        // 2. Find the latest reading before this month
        const priorList = list.filter(r => r.billingMonth < billingMonth);
        const sortedPrior = [...priorList].sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));
        const latestPrior = sortedPrior[0];
        
        if (latestPrior) {
          setFormData(prev => ({
            ...prev,
            oldElectricNumber: String(latestPrior.newElectricNumber),
            newElectricNumber: '',
            oldWaterNumber: String(latestPrior.newWaterNumber),
            newWaterNumber: '',
          }));
        } else {
          // Brand new rental, old index starts at 0
          setFormData(prev => ({
            ...prev,
            oldElectricNumber: '0',
            newElectricNumber: '',
            oldWaterNumber: '0',
            newWaterNumber: '',
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load meter reading history', err);
    } finally {
      setLoadingMeter(false);
    }
  };

  useEffect(() => {
    if (!initialData && formData.rentalId && formData.billingMonth) {
      loadMeterReadingHistory(formData.rentalId, formData.billingMonth);
    }
  }, [formData.rentalId, formData.billingMonth, initialData]);

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

    if (!initialData && !validateRequired(formData.rentalId)) newErrors.rentalId = 'Vui lòng chọn hợp đồng thuê';
    if (!initialData && !validateRequired(formData.billingMonth)) newErrors.billingMonth = 'Tháng lập hóa đơn không được để trống';
    if (!validateRequired(formData.dueDate)) newErrors.dueDate = 'Hạn thanh toán là bắt buộc';
    if (!validatePositiveNumber(formData.otherFee)) newErrors.otherFee = 'Chi phí phát sinh không hợp lệ';
    if (!validatePositiveNumber(formData.discountAmount)) newErrors.discountAmount = 'Số tiền giảm trừ không hợp lệ';

    if (!initialData) {
      if (!validateRequired(formData.oldElectricNumber) || !validatePositiveNumber(formData.oldElectricNumber)) {
        newErrors.oldElectricNumber = 'Chỉ số điện cũ bắt buộc và phải là số dương';
      }
      if (!validateRequired(formData.newElectricNumber) || !validatePositiveNumber(formData.newElectricNumber)) {
        newErrors.newElectricNumber = 'Chỉ số điện mới bắt buộc và phải là số dương';
      } else if (parseInt(formData.newElectricNumber, 10) < parseInt(formData.oldElectricNumber, 10)) {
        newErrors.newElectricNumber = 'Chỉ số mới không được nhỏ hơn chỉ số cũ';
      }

      if (!validateRequired(formData.oldWaterNumber) || !validatePositiveNumber(formData.oldWaterNumber)) {
        newErrors.oldWaterNumber = 'Chỉ số nước cũ bắt buộc và phải là số dương';
      }
      if (!validateRequired(formData.newWaterNumber) || !validatePositiveNumber(formData.newWaterNumber)) {
        newErrors.newWaterNumber = 'Chỉ số nước mới bắt buộc và phải là số dương';
      } else if (parseInt(formData.newWaterNumber, 10) < parseInt(formData.oldWaterNumber, 10)) {
        newErrors.newWaterNumber = 'Chỉ số mới không được nhỏ hơn chỉ số cũ';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      dueDate: formData.dueDate,
      otherFee: parseFloat(formData.otherFee || 0),
      discountAmount: parseFloat(formData.discountAmount || 0),
      note: formData.note || null,
    };

    if (!initialData) {
      submitData.rentalId = parseInt(formData.rentalId, 10);
      submitData.billingMonth = formData.billingMonth;
      
      // Packaging meter reading info
      submitData.meterReading = {
        id: existingReading?.id || null,
        oldElectricNumber: parseInt(formData.oldElectricNumber, 10),
        newElectricNumber: parseInt(formData.newElectricNumber, 10),
        oldWaterNumber: parseInt(formData.oldWaterNumber, 10),
        newWaterNumber: parseInt(formData.newWaterNumber, 10),
      };
    }

    onSubmit(submitData);
  };

  if (loadingOptions) return <Loading />;

  return (
    <form onSubmit={handleFormSubmit}>
      <Select
        label="Phòng trọ áp dụng"
        name="rentalId"
        value={formData.rentalId}
        onChange={handleChange}
        options={rentals.map(r => ({ value: r.id, label: `Phòng ${r.roomNumber} (${r.representativeTenantName})` }))}
        required={!initialData}
        placeholder="Chọn hợp đồng thuê phòng"
        error={errors.rentalId}
        disabled={!!initialData}
      />
      
      <div className="responsive-grid-2">
        <Input
          label="Tháng tính tiền"
          name="billingMonth"
          type="month"
          value={formData.billingMonth}
          onChange={handleChange}
          required={!initialData}
          error={errors.billingMonth}
          disabled={!!initialData}
        />
        <Input
          label="Hạn thanh toán hóa đơn"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          required
          error={errors.dueDate}
        />
      </div>

      {!initialData && (
        <div style={{ padding: '12px', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-hover)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚡ Chỉ số điện & nước tháng {formData.billingMonth || 'này'}
          </h4>
          
          {loadingMeter ? (
            <div style={{ padding: '10px 0', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              Đang truy vấn số điện nước cũ từ lịch sử...
            </div>
          ) : (
            <>
              {/* Electricity readings */}
              <div className="responsive-grid-2" style={{ marginBottom: '8px' }}>
                <Input
                  label="Chỉ số ĐIỆN CŨ"
                  name="oldElectricNumber"
                  type="number"
                  placeholder="Nhập số điện cũ"
                  value={formData.oldElectricNumber}
                  onChange={handleChange}
                  error={errors.oldElectricNumber}
                  required
                />
                <Input
                  label="Chỉ số ĐIỆN MỚI"
                  name="newElectricNumber"
                  type="number"
                  placeholder="Nhập số điện mới"
                  value={formData.newElectricNumber}
                  onChange={handleChange}
                  error={errors.newElectricNumber}
                  required
                />
              </div>

              {/* Water readings */}
              <div className="responsive-grid-2">
                <Input
                  label="Chỉ số NƯỚC CŨ"
                  name="oldWaterNumber"
                  type="number"
                  placeholder="Nhập số nước cũ"
                  value={formData.oldWaterNumber}
                  onChange={handleChange}
                  error={errors.oldWaterNumber}
                  required
                />
                <Input
                  label="Chỉ số NƯỚC MỚI"
                  name="newWaterNumber"
                  type="number"
                  placeholder="Nhập số nước mới"
                  value={formData.newWaterNumber}
                  onChange={handleChange}
                  error={errors.newWaterNumber}
                  required
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="responsive-grid-2">
        <Input
          label="Chi phí phát sinh khác (VNĐ)"
          name="otherFee"
          type="number"
          value={formData.otherFee}
          onChange={handleChange}
          error={errors.otherFee}
        />
        <Input
          label="Số tiền giảm trừ (VNĐ)"
          name="discountAmount"
          type="number"
          value={formData.discountAmount}
          onChange={handleChange}
          error={errors.discountAmount}
        />
      </div>

      <Input
        label="Ghi chú hóa đơn"
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder="Ghi chú đóng tiền, tiền giặt ủi, tiền sửa đồ..."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu hóa đơn</Button>
      </div>
    </form>
  );
}
