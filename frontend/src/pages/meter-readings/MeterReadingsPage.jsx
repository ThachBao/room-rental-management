import React, { useState, useEffect } from 'react';
import { meterReadingApi } from '../../api/meterReadingApi';
import { roomRentalApi } from '../../api/roomRentalApi';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Select from '../../components/common/Select';
import MeterReadingForm from './MeterReadingForm';
import Loading from '../../components/common/Loading';
import { getErrorMessage } from '../../utils/errorHandler';

export default function MeterReadingsPage() {
  const [readings, setReadings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    rentalId: 'ALL',
    billingMonth: '',
  });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchRentals = async () => {
    try {
      const data = await roomRentalApi.getAll('ACTIVE');
      setRentals(data);
    } catch (err) {
      console.error('Failed to load rentals for filter', err);
    }
  };

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const queryFilters = {};
      if (filters.rentalId !== 'ALL') queryFilters.rentalId = filters.rentalId;
      if (filters.billingMonth) queryFilters.billingMonth = filters.billingMonth;

      const data = await meterReadingApi.getAll(queryFilters);
      setReadings([...data].sort((a, b) => b.id - a.id));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClick = () => {
    setSelectedReading(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (reading) => {
    setSelectedReading(reading);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedReading) {
        await meterReadingApi.update(selectedReading.id, formData);
        showToast('Cập nhật chỉ số điện nước thành công!');
      } else {
        await meterReadingApi.create(formData);
        showToast('Chốt chỉ số điện nước mới thành công!');
      }
      setIsFormModalOpen(false);
      fetchReadings();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const columns = [
    { header: 'Phòng trọ', key: 'roomNumber', render: (row) => `Phòng ${row.roomNumber}`, style: { fontWeight: 700 } },
    { header: 'Tháng chốt', key: 'billingMonth', style: { fontWeight: 600 } },
    { header: 'Chỉ số điện cũ', key: 'oldElectricNumber' },
    { header: 'Chỉ số điện mới', key: 'newElectricNumber' },
    {
      header: 'Lượng điện dùng',
      key: 'electricUsage',
      render: (row) => (
        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
          {row.electricUsage} kWh
        </span>
      ),
    },
    { header: 'Chỉ số nước cũ', key: 'oldWaterNumber' },
    { header: 'Chỉ số nước mới', key: 'newWaterNumber' },
    {
      header: 'Lượng nước dùng',
      key: 'waterUsage',
      render: (row) => (
        <span style={{ fontWeight: 'bold', color: '#0369a1' }}>
          {row.waterUsage} m³
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" size="sm" onClick={() => handleEditClick(row)}>Sửa chỉ số</Button>
        </div>
      ),
    },
  ];

  const rentalOptions = [
    { value: 'ALL', label: 'Tất cả lượt thuê' },
    ...rentals.map(r => ({ value: r.id, label: `Phòng ${r.roomNumber} (${r.representativeTenantName})` })),
  ];

  return (
    <div>
      <PageHeader
        title="Chỉ Số Điện Nước Hàng Tháng"
        onActionClick={handleCreateClick}
        actionLabel="Chốt số tháng mới"
      >
        <div className="filter-group">
          <Select
            name="rentalId"
            value={filters.rentalId}
            onChange={handleFilterChange}
            options={rentalOptions}
          />
          <input
            type="month"
            name="billingMonth"
            className="form-control"
            value={filters.billingMonth}
            onChange={handleFilterChange}
            style={{ width: '160px', padding: '8px 12px' }}
          />
        </div>
      </PageHeader>

      {loading ? (
        <Loading />
      ) : (
        <DataTable
          columns={columns}
          data={readings}
          emptyMessage="Không tìm thấy dữ liệu chốt số điện nước nào."
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedReading ? 'Sửa thông tin chốt số' : 'Chốt số điện nước phòng trọ'}
      >
        <MeterReadingForm
          initialData={selectedReading}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Toast alert */}
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
