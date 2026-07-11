import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { roomRentalApi } from '../../api/roomRentalApi';
import { validateRequired, validatePositiveNumber } from '../../utils/validateForm';

export default function UtilityRateForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    rentalId: '',
    electricUnitPrice: '3500',
    waterUnitPrice: '15000',
    internetFee: '100000',
    trashFee: '20000',
    parkingFee: '50000',
    effectiveFromMonth: '',
    effectiveToMonth: '',
    note: '',
    createdByUserId: '1',
  });

  const [rentals, setRentals] = useState([]);
  const [selectedRentalIds, setSelectedRentalIds] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const list = await roomRentalApi.getAll('ACTIVE');
        setRentals(list);
      } catch (err) {
        console.error('Failed to load active rentals for utility rates', err);
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
        electricUnitPrice: String(initialData.electricUnitPrice ?? 3500),
        waterUnitPrice: String(initialData.waterUnitPrice ?? 15000),
        internetFee: String(initialData.internetFee ?? 100000),
        trashFee: String(initialData.trashFee ?? 20000),
        parkingFee: String(initialData.parkingFee ?? 50000),
        effectiveFromMonth: initialData.effectiveFromMonth ?? '',
        effectiveToMonth: initialData.effectiveToMonth ?? '',
        note: initialData.note ?? '',
        createdByUserId: String(initialData.createdByUserId ?? 1),
      });
      setSelectedRentalIds([initialData.rentalId]);
    } else {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setFormData((prev) => ({
        ...prev,
        effectiveFromMonth: currentMonth,
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

    if (!initialData && selectedRentalIds.length === 0) {
      newErrors.rentalIds = 'Vui lòng chọn ít nhất một phòng trọ áp dụng';
    }
    if (!validateRequired(formData.electricUnitPrice) || !validatePositiveNumber(formData.electricUnitPrice)) newErrors.electricUnitPrice = 'Đơn giá điện không được trống';
    if (!validateRequired(formData.waterUnitPrice) || !validatePositiveNumber(formData.waterUnitPrice)) newErrors.waterUnitPrice = 'Đơn giá nước không được trống';
    if (!validateRequired(formData.effectiveFromMonth)) newErrors.effectiveFromMonth = 'Tháng bắt đầu hiệu lực không được trống';
    if (formData.effectiveToMonth && formData.effectiveFromMonth && formData.effectiveToMonth < formData.effectiveFromMonth) {
      newErrors.effectiveToMonth = 'Tháng kết thúc hiệu lực không được nhỏ hơn tháng bắt đầu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      rentalIds: selectedRentalIds,
      isMultiple: !initialData,
      electricUnitPrice: parseFloat(formData.electricUnitPrice),
      waterUnitPrice: parseFloat(formData.waterUnitPrice),
      internetFee: formData.internetFee ? parseFloat(formData.internetFee) : 0,
      trashFee: formData.trashFee ? parseFloat(formData.trashFee) : 0,
      parkingFee: formData.parkingFee ? parseFloat(formData.parkingFee) : 0,
      effectiveToMonth: formData.effectiveToMonth || null,
      createdByUserId: parseInt(formData.createdByUserId, 10),
      note: formData.note || null,
    });
  };

  if (loadingOptions) return <Loading />;

  return (
    <form onSubmit={handleFormSubmit}>
      {initialData ? (
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Phòng trọ áp dụng (Đang sửa)</label>
          <div style={{ padding: '10px 12px', backgroundColor: '#f3f4f6', borderRadius: 'var(--radius-sm)', fontSize: '13.5px', color: 'var(--dark)' }}>
            Phòng {initialData.roomNumber || initialData.rentalId} ({initialData.representativeTenantName || 'Hợp đồng hiện tại'})
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>
            Chọn các phòng trọ áp dụng *
          </label>
          
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: '#f9fafb' }}>
            {/* Header select-all */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                id="selectAllRentals"
                checked={rentals.length > 0 && selectedRentalIds.length === rentals.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRentalIds(rentals.map(r => r.id));
                  } else {
                    setSelectedRentalIds([]);
                  }
                  if (errors.rentalIds) setErrors(prev => ({ ...prev, rentalIds: null }));
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="selectAllRentals" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dark)', cursor: 'pointer' }}>
                Chọn tất cả ({rentals.length} phòng đang thuê)
              </label>
            </div>
            
            {/* Scrollable list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
              {rentals.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                  Không có phòng trọ nào đang hoạt động.
                </div>
              ) : (
                rentals.map((r) => {
                  const isChecked = selectedRentalIds.includes(r.id);
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id={`rental-${r.id}`}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRentalIds(prev => [...prev, r.id]);
                          } else {
                            setSelectedRentalIds(prev => prev.filter(id => id !== r.id));
                          }
                          if (errors.rentalIds) setErrors(prev => ({ ...prev, rentalIds: null }));
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor={`rental-${r.id}`} style={{ fontSize: '13px', color: 'var(--dark)', cursor: 'pointer' }}>
                        Phòng {r.roomNumber} - {r.representativeTenantName}
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {errors.rentalIds && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>
              {errors.rentalIds}
            </div>
          )}
        </div>
      )}

      <div className="responsive-grid-2">
        <Input
          label="Đơn giá điện (VNĐ / kWh)"
          name="electricUnitPrice"
          type="number"
          value={formData.electricUnitPrice}
          onChange={handleChange}
          required
          error={errors.electricUnitPrice}
        />
        <Input
          label="Đơn giá nước (VNĐ / m³)"
          name="waterUnitPrice"
          type="number"
          value={formData.waterUnitPrice}
          onChange={handleChange}
          required
          error={errors.waterUnitPrice}
        />
      </div>

      <div className="responsive-grid-3">
        <Input
          label="Phí mạng Internet / Tháng"
          name="internetFee"
          type="number"
          value={formData.internetFee}
          onChange={handleChange}
        />
        <Input
          label="Phí thu gom rác / Tháng"
          name="trashFee"
          type="number"
          value={formData.trashFee}
          onChange={handleChange}
        />
        <Input
          label="Phí giữ xe máy / Tháng"
          name="parkingFee"
          type="number"
          value={formData.parkingFee}
          onChange={handleChange}
        />
      </div>

      <div className="responsive-grid-2">
        <Input
          label="Hiệu lực từ tháng"
          name="effectiveFromMonth"
          type="month"
          value={formData.effectiveFromMonth}
          onChange={handleChange}
          required
          error={errors.effectiveFromMonth}
        />
        <Input
          label="Hiệu lực đến tháng"
          name="effectiveToMonth"
          type="month"
          value={formData.effectiveToMonth}
          onChange={handleChange}
          error={errors.effectiveToMonth}
        />
      </div>

      <Input
        label="Ghi chú cấu hình"
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder="Ghi chú về đơn giá dịch vụ..."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu đơn giá</Button>
      </div>
    </form>
  );
}
