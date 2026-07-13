import React, { useState, useEffect } from 'react';
import { contractFileApi } from '../../api/contractFileApi';
import { roomRentalApi } from '../../api/roomRentalApi';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import Select from '../../components/common/Select';
import ContractFileForm from './ContractFileForm';
import Loading from '../../components/common/Loading';
import { getErrorMessage } from '../../utils/errorHandler';
import SortControl from '../../components/common/SortControl';
import { sortData } from '../../utils/sortUtils';

export default function ContractFilesPage() {
  const [files, setFiles] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRentalId, setFilterRentalId] = useState('ALL');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortOptions = [
    { value: 'id', label: 'Mới nhất' },
    { value: 'fileName', label: 'Tên tệp tin' },
    { value: 'fileType', label: 'Loại định dạng' },
  ];

  // Modals & Dialogs state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await contractFileApi.getAll(filterRentalId === 'ALL' ? null : filterRentalId);
      setFiles(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortedFiles = sortData(files, sortBy, sortDirection);

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [filterRentalId]);

  const handleCreateClick = () => {
    setSelectedFile(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (file) => {
    setSelectedFile(file);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (file) => {
    setSelectedFile(file);
    setIsConfirmOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedFile) {
        await contractFileApi.update(selectedFile.id, formData);
        showToast('Cập nhật thông tin tài liệu thành công!');
      } else {
        await contractFileApi.create(formData);
        showToast('Đính kèm tài liệu mới thành công!');
      }
      setIsFormModalOpen(false);
      fetchFiles();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await contractFileApi.delete(selectedFile.id);
      showToast('Gỡ bỏ tài liệu đính kèm thành công!');
      setIsConfirmOpen(false);
      fetchFiles();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const columns = [
    { header: 'Phòng trọ liên kết', key: 'rentalId', render: (row) => `Phòng ${row.roomNumber || row.rentalId}`, style: { fontWeight: 700 } },
    {
      header: 'Tên tệp tin',
      key: 'fileName',
      render: (row) => (
        <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: 'var(--primary)' }}>
          {row.fileName}
        </a>
      ),
    },
    {
      header: 'Loại tài liệu',
      key: 'fileType',
      render: (row) => (
        <Badge
          label={row.fileType}
          variant={row.fileType === 'PDF' ? 'danger' : 'primary'}
        />
      ),
    },
    { header: 'Dung lượng', key: 'fileSize', render: (row) => `${(row.fileSize / 1024).toFixed(1)} KB` },
    { header: 'Ghi chú đính kèm', key: 'note' },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" size="sm" onClick={() => handleEditClick(row)}>Sửa</Button>
          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(row)}>Xóa</Button>
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
        title="Quản Lý Hồ Sơ Hợp Đồng"
        onActionClick={handleCreateClick}
        actionLabel="Đính kèm tài liệu"
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
          data={sortedFiles}
          emptyMessage="Không tìm thấy tệp hồ sơ đính kèm nào."
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedFile ? 'Cập nhật thông tin tài liệu đính kèm' : 'Đính kèm tài liệu hợp đồng mới'}
      >
        <ContractFileForm
          initialData={selectedFile}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Bạn có chắc chắn muốn gỡ bỏ tệp tài liệu ${selectedFile?.fileName}?`}
        confirmText="Xác nhận gỡ bỏ"
        cancelText="Hủy bỏ"
      />

      {/* Toast alert */}
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
