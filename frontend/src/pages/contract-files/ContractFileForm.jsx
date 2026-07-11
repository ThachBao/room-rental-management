import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { roomRentalApi } from '../../api/roomRentalApi';
import { formatDate } from '../../utils/formatDate';
import { validateRequired, validatePositiveNumber } from '../../utils/validateForm';

const fileTypeOptions = [
  { value: 'PDF', label: 'Tài liệu PDF' },
  { value: 'JPG', label: 'Hình ảnh JPG' },
  { value: 'PNG', label: 'Hình ảnh PNG' },
];

export default function ContractFileForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    rentalId: '',
    fileName: '',
    fileUrl: '',
    fileType: 'PDF',
    fileSize: '1048576', // Default 1MB in bytes
    uploadedByUserId: '1', // Default landlord user id
    note: '',
  });

  const [rentals, setRentals] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const list = await roomRentalApi.getAll('ACTIVE');
        setRentals(list);
      } catch (err) {
        console.error('Failed to load rentals for contract files', err);
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
        fileName: initialData.fileName ?? '',
        fileUrl: initialData.fileUrl ?? '',
        fileType: initialData.fileType ?? 'PDF',
        fileSize: String(initialData.fileSize ?? 1048576),
        uploadedByUserId: String(initialData.uploadedByUserId ?? 1),
        note: initialData.note ?? '',
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

    if (!validateRequired(formData.rentalId)) newErrors.rentalId = 'Vui lòng chọn lượt thuê liên kết';
    if (!validateRequired(formData.fileName)) newErrors.fileName = 'Tên tài liệu không được để trống';
    if (!validateRequired(formData.fileUrl)) newErrors.fileUrl = 'Đường dẫn tệp tin là bắt buộc';
    if (!validateRequired(formData.fileSize) || !validatePositiveNumber(formData.fileSize)) newErrors.fileSize = 'Dung lượng tệp phải lớn hơn 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      rentalId: parseInt(formData.rentalId, 10),
      fileSize: parseInt(formData.fileSize, 10),
      uploadedByUserId: parseInt(formData.uploadedByUserId, 10),
      note: formData.note || null,
    });
  };

  if (loadingOptions) return <Loading />;

  return (
    <form onSubmit={handleFormSubmit}>
      <Select
        label="Hợp đồng phòng liên kết"
        name="rentalId"
        value={formData.rentalId}
        onChange={handleChange}
        options={rentals.map(r => ({ value: r.id, label: `Phòng ${r.roomNumber} (${r.representativeTenantName}) - Bắt đầu: ${formatDate(r.startDate)}` }))}
        required
        placeholder="Chọn lượt thuê liên kết"
        error={errors.rentalId}
        disabled={!!initialData}
      />
      <Input
        label="Tên tài liệu / Hợp đồng"
        name="fileName"
        value={formData.fileName}
        onChange={handleChange}
        placeholder="Ví dụ: HopDong_Phong101.pdf"
        required
        error={errors.fileName}
      />
      <Input
        label="Đường dẫn liên kết tệp (URL)"
        name="fileUrl"
        value={formData.fileUrl}
        onChange={handleChange}
        placeholder="https://storage.example.com/contracts/..."
        required
        error={errors.fileUrl}
      />
      <div className="responsive-grid-2">
        <Select
          label="Định dạng tài liệu"
          name="fileType"
          value={formData.fileType}
          onChange={handleChange}
          options={fileTypeOptions}
          required
        />
        <Input
          label="Dung lượng file (Bytes)"
          name="fileSize"
          type="number"
          value={formData.fileSize}
          onChange={handleChange}
          required
          error={errors.fileSize}
        />
      </div>
      <Input
        label="Ghi chú hồ sơ"
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder="Ghi chú đính kèm..."
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu hồ sơ</Button>
      </div>
    </form>
  );
}
