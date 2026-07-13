import React, { useState, useEffect } from 'react';
import { roomRentalApi } from '../../api/roomRentalApi';
import { rentalMemberApi } from '../../api/rentalMemberApi';
import { utilityRateApi } from '../../api/utilityRateApi';
import { contractFileApi } from '../../api/contractFileApi';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import RoomRentalForm from './RoomRentalForm';
import TerminateRentalForm from './TerminateRentalForm';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { RENTAL_STATUS } from '../../constants/rentalStatus';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { Plus, Edit2, LogOut, ClipboardList, User, Calendar, DollarSign, Eye, FileText, Download } from 'lucide-react';
import SortControl from '../../components/common/SortControl';
import { sortData } from '../../utils/sortUtils';

const filterStatusOptions = [
  { value: 'ALL', label: 'Tất cả hợp đồng' },
  { value: RENTAL_STATUS.ACTIVE, label: 'Đang hiệu lực' },
  { value: RENTAL_STATUS.EXPIRED, label: 'Hết hạn' },
  { value: RENTAL_STATUS.TERMINATED, label: 'Đã kết thúc' },
];

export default function RoomRentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(RENTAL_STATUS.ACTIVE);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortOptions = [
    { value: 'id', label: 'Mới nhất' },
    { value: 'monthlyRentPrice', label: 'Giá thuê thực tế' },
    { value: 'startDate', label: 'Ngày bắt đầu thuê' },
    { value: 'expectedEndDate', label: 'Ngày hết hạn hợp đồng' },
    { value: 'depositAmount', label: 'Tiền đặt cọc' },
  ];

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  // Detail Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rentalMembers, setRentalMembers] = useState([]);
  const [rentalRates, setRentalRates] = useState(null);
  const [rentalFiles, setRentalFiles] = useState([]);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const data = await roomRentalApi.getAll(filterStatus === 'ALL' ? null : filterStatus);
      
      let filteredData = data;
      if (filterStatus === RENTAL_STATUS.ACTIVE) {
        filteredData = data.filter(r => r.status === RENTAL_STATUS.ACTIVE);
      } else if (filterStatus === RENTAL_STATUS.EXPIRED) {
        filteredData = data.filter(r => r.status === RENTAL_STATUS.EXPIRED);
      }

      setRentals(filteredData);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortedRentals = sortData(rentals, sortBy, sortDirection);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchRentals();
  }, [filterStatus]);

  const handleCreateClick = () => {
    setSelectedRental(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (rental) => {
    setSelectedRental(rental);
    setIsFormModalOpen(true);
  };

  const handleTerminateClick = (rental) => {
    setSelectedRental(rental);
    setIsTerminateModalOpen(true);
  };

  const handleDetailClick = async (rental) => {
    setSelectedRental(rental);
    setIsDetailModalOpen(true);
    setRentalMembers([]);
    setRentalRates(null);
    setRentalFiles([]);
    
    try {
      setDetailLoading(true);
      const [membersList, ratesList, filesList] = await Promise.all([
        rentalMemberApi.getAll(rental.id),
        utilityRateApi.getAll(rental.id),
        contractFileApi.getAll(rental.id)
      ]);
      setRentalMembers(membersList.filter(m => !m.moveOutDate));
      if (ratesList && ratesList.length > 0) {
        setRentalRates(ratesList[0]);
      }
      setRentalFiles(filesList);
    } catch (err) {
      console.error('Failed to load rental details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedRental) {
        await roomRentalApi.update(selectedRental.id, formData);
        showToast('Cập nhật hợp đồng thuê thành công!');
      } else {
        await roomRentalApi.create(formData);
        showToast('Tạo hợp đồng thuê mới thành công!');
      }
      setIsFormModalOpen(false);
      fetchRentals();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleTerminateSubmit = async (terminateData) => {
    try {
      await roomRentalApi.terminate(selectedRental.id, terminateData);
      showToast('Trả phòng và quyết toán hợp đồng thành công!');
      setIsTerminateModalOpen(false);
      fetchRentals();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div>
      {/* Search and Filters */}
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button
          onClick={handleCreateClick}
          variant="primary"
          style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
        >
          <Plus size={20} />
          Lập hợp đồng thuê mới
        </Button>

        {/* Filter Scrollable row */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
          {filterStatusOptions.map((opt) => {
            const isSelected = filterStatus === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--light)',
                  color: isSelected ? 'var(--primary-hover)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <SortControl
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
          options={sortOptions}
        />
      </div>

      {loading ? (
        <Loading />
      ) : sortedRentals.length === 0 ? (
        <EmptyState
          message="Không tìm thấy lượt thuê phòng nào phù hợp."
          icon={ClipboardList}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sortedRentals.map((rental) => (
            <Card key={rental.id} style={{ padding: '16px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)' }}>
                  Phòng {rental.roomNumber}
                </span>
                <StatusBadge status={rental.status} />
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Đại diện: <strong>{rental.representativeTenantName}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Kỳ thuê: {formatDate(rental.startDate)} ➔ {formatDate(rental.expectedEndDate)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Giá thuê: <strong style={{ color: 'var(--dark)' }}>{formatCurrency(rental.monthlyRentPrice)}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Đặt cọc: {formatCurrency(rental.depositPaidAmount)} / {formatCurrency(rental.depositAmount)}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDetailClick(rental)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px', marginRight: 'auto' }}
                >
                  <Eye size={13} />
                  Chi tiết
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditClick(rental)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                >
                  <Edit2 size={13} />
                  Sửa
                </Button>
                {(rental.status === RENTAL_STATUS.ACTIVE || rental.status === RENTAL_STATUS.EXPIRED) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleTerminateClick(rental)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                  >
                    <LogOut size={13} />
                    Trả phòng
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedRental ? 'Cập nhật hợp đồng thuê phòng' : 'Tạo hợp đồng thuê phòng mới'}
      >
        <RoomRentalForm
          initialData={selectedRental}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Terminate Modal */}
      <Modal
        isOpen={isTerminateModalOpen}
        onClose={() => setIsTerminateModalOpen(false)}
        title="Chấm dứt hợp đồng & Trả phòng"
      >
        <TerminateRentalForm
          rental={selectedRental}
          onSubmit={handleTerminateSubmit}
          onCancel={() => setIsTerminateModalOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết Hợp đồng - Phòng ${selectedRental?.roomNumber}`}
      >
        {selectedRental && (
          <div>
            <Card title="Thông tin hợp đồng" style={{ border: 'none', padding: 0, boxShadow: 'none', marginBottom: '20px' }}>
              <div className="detail-section" style={{ fontSize: '13px' }}>
                <div className="detail-row">
                  <span className="detail-label">Phòng trọ áp dụng:</span>
                  <span className="detail-value">Phòng {selectedRental.roomNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Người đại diện:</span>
                  <span className="detail-value">{selectedRental.representativeTenantName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Giá thuê tháng thực tế:</span>
                  <span className="detail-value" style={{ color: 'var(--primary)' }}>{formatCurrency(selectedRental.monthlyRentPrice)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tiền đặt cọc thỏa thuận:</span>
                  <span className="detail-value">{formatCurrency(selectedRental.depositAmount)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tiền cọc thực tế đã nhận:</span>
                  <span className="detail-value">{formatCurrency(selectedRental.depositPaidAmount)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ngày ký / Bắt đầu ở:</span>
                  <span className="detail-value">{formatDate(selectedRental.startDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ngày hết hạn dự kiến:</span>
                  <span className="detail-value">{formatDate(selectedRental.expectedEndDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái hợp đồng:</span>
                  <span className="detail-value"><StatusBadge status={selectedRental.status} /></span>
                </div>
              </div>
            </Card>

            {detailLoading ? (
              <Loading />
            ) : (
              <div>
                {/* Members list */}
                <Card title="Thành viên đang ở cùng" style={{ border: 'none', padding: 0, boxShadow: 'none', marginBottom: '20px' }}>
                  {rentalMembers.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', padding: '4px 0' }}>
                      Chưa đăng ký thành viên ở cùng nào ngoài người đại diện.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {rentalMembers.map((member) => (
                        <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                          <div>
                            <strong>{member.tenantName}</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>SĐT: {member.tenantPhone || 'Không có'}</div>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Thành viên
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Applied rates */}
                {rentalRates ? (
                  <Card title="Đơn giá dịch vụ áp dụng" style={{ border: 'none', padding: 0, boxShadow: 'none', marginBottom: '20px' }}>
                    <div className="detail-section" style={{ fontSize: '13px' }}>
                      <div className="detail-row">
                        <span className="detail-label">Đơn giá điện:</span>
                        <span className="detail-value">{formatCurrency(rentalRates.electricUnitPrice)} / kWh</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Đơn giá nước:</span>
                        <span className="detail-value">{formatCurrency(rentalRates.waterUnitPrice)} / m³</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phí Internet:</span>
                        <span className="detail-value">{formatCurrency(rentalRates.internetFee)} / Tháng</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phí vệ sinh/Rác:</span>
                        <span className="detail-value">{formatCurrency(rentalRates.trashFee)} / Tháng</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phí giữ xe máy:</span>
                        <span className="detail-value">{formatCurrency(rentalRates.parkingFee)} / xe / Tháng</span>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div style={{ color: 'var(--warning)', fontSize: '12px', marginBottom: '20px', padding: '8px 12px', backgroundColor: 'var(--warning-light)', borderRadius: 'var(--radius-sm)' }}>
                    ⚠️ Phòng này chưa được thiết lập bảng đơn giá dịch vụ điện nước.
                  </div>
                )}

                {/* Contract files list */}
                <Card title="Tài liệu & Hồ sơ đính kèm" style={{ border: 'none', padding: 0, boxShadow: 'none' }}>
                  {rentalFiles.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', padding: '4px 0' }}>
                      Chưa upload tệp tài liệu hợp đồng nào.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {rentalFiles.map((file) => (
                        <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={16} style={{ color: 'var(--primary)' }} />
                            <div>
                              <strong>{file.fileName}</strong>
                              <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Loại: {file.fileType}</div>
                            </div>
                          </div>
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                            <Download size={12} />
                            Tải về
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button variant="primary" onClick={() => setIsDetailModalOpen(false)} style={{ width: '100%', minHeight: '44px', fontWeight: 700 }}>
            Đóng chi tiết hợp đồng
          </Button>
        </div>
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
