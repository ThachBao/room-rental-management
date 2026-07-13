import React, { useState, useEffect } from 'react';
import { utilityRateApi } from '../../api/utilityRateApi';
import { roomRentalApi } from '../../api/roomRentalApi';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Select from '../../components/common/Select';
import UtilityRateForm from './UtilityRateForm';
import Loading from '../../components/common/Loading';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/errorHandler';
import SortControl from '../../components/common/SortControl';
import { sortData } from '../../utils/sortUtils';

export default function UtilityRatesPage() {
  const [rates, setRates] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRentalId, setFilterRentalId] = useState('ALL');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortOptions = [
    { value: 'id', label: 'Mới nhất' },
    { value: 'effectiveFromMonth', label: 'Tháng hiệu lực' },
  ];

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);

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

  const fetchRates = async () => {
    try {
      setLoading(true);
      const data = await utilityRateApi.getAll(filterRentalId === 'ALL' ? null : filterRentalId);
      setRates(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortedRates = sortData(rates, sortBy, sortDirection);

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    fetchRates();
  }, [filterRentalId]);

  const handleCreateClick = () => {
    setSelectedRate(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (rate) => {
    setSelectedRate(rate);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedRate) {
        // Prepare payload for update
        const payload = { ...formData };
        delete payload.rentalIds;
        delete payload.isMultiple;
        await utilityRateApi.update(selectedRate.id, payload);
        showToast('Cập nhật đơn giá thành công!');
      } else if (formData.isMultiple && formData.rentalIds && formData.rentalIds.length > 0) {
        let successCount = 0;
        let failCount = 0;

        for (const rId of formData.rentalIds) {
          try {
            const payload = {
              ...formData,
              rentalId: rId
            };
            delete payload.rentalIds;
            delete payload.isMultiple;
            await utilityRateApi.create(payload);
            successCount++;
          } catch (err) {
            // Log and count failure (e.g. rate already exists for this room in this month)
            console.error(`Failed to apply utility rate for rental ${rId}:`, err);
            failCount++;
          }
        }

        if (successCount > 0) {
          showToast(`Thiết lập đơn giá cho ${successCount} phòng thành công!${failCount > 0 ? ` (Bỏ qua ${failCount} phòng đã có đơn giá tháng này)` : ''}`);
        } else {
          showToast('Tất cả các phòng được chọn đều đã có đơn giá dịch vụ cho tháng này.', 'warning');
        }
      } else {
        const payload = { ...formData };
        delete payload.rentalIds;
        delete payload.isMultiple;
        await utilityRateApi.create(payload);
        showToast('Thiết lập cấu hình đơn giá mới thành công!');
      }
      setIsFormModalOpen(false);
      fetchRates();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const columns = [
    { header: 'Phòng trọ áp dụng', key: 'rentalId', render: (row) => `Phòng ${row.roomNumber || row.rentalId}`, style: { fontWeight: 700 } },
    { header: 'Đơn giá điện', key: 'electricUnitPrice', render: (row) => `${formatCurrency(row.electricUnitPrice)} / kWh` },
    { header: 'Đơn giá nước', key: 'waterUnitPrice', render: (row) => `${formatCurrency(row.waterUnitPrice)} / m³` },
    { header: 'Phí Internet', key: 'internetFee', render: (row) => formatCurrency(row.internetFee) },
    { header: 'Phí rác', key: 'trashFee', render: (row) => formatCurrency(row.trashFee) },
    { header: 'Giữ xe', key: 'parkingFee', render: (row) => formatCurrency(row.parkingFee) },
    {
      header: 'Thời hạn hiệu lực',
      key: 'effectiveFromMonth',
      render: (row) => `${row.effectiveFromMonth} ➔ ${row.effectiveToMonth || 'Không xác định'}`,
    },
    { header: 'Ghi chú', key: 'note' },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" size="sm" onClick={() => handleEditClick(row)}>Sửa đơn giá</Button>
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
        title="Quản Lý Đơn Giá Dịch Vụ"
        onActionClick={handleCreateClick}
        actionLabel="Cấu hình đơn giá"
      >
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <Select
            name="filterRentalId"
            value={filterRentalId}
            onChange={(e) => setFilterRentalId(e.target.value)}
            options={rentalOptions}
          />
          <SortControl
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
            options={sortOptions}
          />
        </div>
      </PageHeader>

      {loading ? (
        <Loading />
      ) : (
        <DataTable
          columns={columns}
          data={sortedRates}
          emptyMessage="Không tìm thấy đơn giá dịch vụ nào."
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedRate ? 'Cập nhật cấu hình đơn giá dịch vụ' : 'Cấu hình đơn giá dịch vụ phòng trọ'}
      >
        <UtilityRateForm
          initialData={selectedRate}
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
