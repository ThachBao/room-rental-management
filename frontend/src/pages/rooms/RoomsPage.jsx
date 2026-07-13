import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { roomRentalApi } from '../../api/roomRentalApi';
import { rentalMemberApi } from '../../api/rentalMemberApi';
import { utilityRateApi } from '../../api/utilityRateApi';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import RoomForm from './RoomForm';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { ROOM_STATUS } from '../../constants/roomStatus';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { Plus, Edit2, Trash2, Home, Users, Layers, Maximize, Eye, Calendar, Phone, DollarSign, Wrench, ArrowUp, ArrowDown } from 'lucide-react';

const roomNumberCollator = new Intl.Collator('vi', {
  numeric: true,
  sensitivity: 'base',
});

const filterStatusOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: ROOM_STATUS.AVAILABLE, label: 'Còn trống' },
  { value: ROOM_STATUS.OCCUPIED, label: 'Đang thuê' },
  { value: ROOM_STATUS.MAINTENANCE, label: 'Bảo trì' },
  { value: ROOM_STATUS.INACTIVE, label: 'Ngưng dùng' },
];

export default function RoomsPage() {
  const location = useLocation();
  const initialStatus = location.state?.status || 'ALL';
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [sortOrder, setSortOrder] = useState('ASC');

  const sortedRooms = useMemo(() => {
    const direction = sortOrder === 'ASC' ? 1 : -1;

    return [...rooms].sort((a, b) => {
      const roomNumberComparison = roomNumberCollator.compare(
        String(a.roomNumber ?? ''),
        String(b.roomNumber ?? '')
      );

      return roomNumberComparison !== 0
        ? roomNumberComparison * direction
        : (a.id - b.id) * direction;
    });
  }, [rooms, sortOrder]);

  // Modals & Dialogs state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Detail Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [roomDetailLoading, setRoomDetailLoading] = useState(false);
  const [roomRentalDetail, setRoomRentalDetail] = useState(null);
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomRates, setRoomRates] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomApi.getAll(filterStatus === 'ALL' ? null : filterStatus);
      setRooms(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filterStatus]);

  const handleCreateClick = () => {
    setSelectedRoom(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (room) => {
    setSelectedRoom(room);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (room) => {
    setSelectedRoom(room);
    setIsConfirmOpen(true);
  };

  const handleDetailClick = async (room) => {
    setSelectedRoom(room);
    setIsDetailModalOpen(true);
    setRoomRentalDetail(null);
    setRoomMembers([]);
    setRoomRates(null);

    if (room.status === ROOM_STATUS.OCCUPIED) {
      try {
        setRoomDetailLoading(true);
        // 1. Get active rentals
        const activeRentals = await roomRentalApi.getAll('ACTIVE');
        const activeRental = activeRentals.find(r => r.roomId === room.id);
        if (activeRental) {
          setRoomRentalDetail(activeRental);

          // 2. Fetch members and rates in parallel
          const [membersList, ratesList] = await Promise.all([
            rentalMemberApi.getAll(activeRental.id),
            utilityRateApi.getAll(activeRental.id)
          ]);

          setRoomMembers(membersList.filter(m => !m.moveOutDate)); // Only show current members
          if (ratesList && ratesList.length > 0) {
            setRoomRates(ratesList[0]); // Get current active rate
          }
        }
      } catch (err) {
        console.error('Failed to load room occupation details', err);
      } finally {
        setRoomDetailLoading(false);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedRoom) {
        await roomApi.update(selectedRoom.id, formData);
        showToast('Cập nhật thông tin phòng thành công!');
      } else {
        await roomApi.create(formData);
        showToast('Thêm phòng mới thành công!');
      }
      setIsFormModalOpen(false);
      fetchRooms();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await roomApi.delete(selectedRoom.id);
      showToast('Xóa phòng trọ thành công!');
      setIsConfirmOpen(false);
      fetchRooms();
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
          Thêm phòng trọ mới
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

        {/* Room number sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Sắp xếp:</span>
          {[
            { value: 'ASC', label: 'Tăng dần', icon: ArrowUp },
            { value: 'DESC', label: 'Giảm dần', icon: ArrowDown },
          ].map((option) => {
            const isSelected = sortOrder === option.value;
            const SortIcon = option.icon;

            return (
              <button
                key={option.value}
                type={'button'}
                aria-pressed={isSelected}
                onClick={() => setSortOrder(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '6px 12px',
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
                <SortIcon size={13} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : rooms.length === 0 ? (
        <EmptyState
          message="Không tìm thấy thông tin phòng trọ nào khớp với bộ lọc."
          icon={Home}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sortedRooms.map((room) => (
            <Card key={room.id} style={{ padding: '16px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)' }}>
                  Phòng {room.roomNumber}
                </span>
                <StatusBadge status={room.status} />
              </div>

              {/* Body */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} style={{ color: 'var(--text-light)' }} />
                  <span>{room.floor !== null ? `Tầng ${room.floor}` : 'Tầng trệt'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Maximize size={14} style={{ color: 'var(--text-light)' }} />
                  <span>{room.area} m²</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Tối đa {room.maxPeople} người</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{formatCurrency(room.baseRentPrice)}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDetailClick(room)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px', marginRight: 'auto' }}
                >
                  <Eye size={13} />
                  Chi tiết
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditClick(room)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                >
                  <Edit2 size={13} />
                  Sửa
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(room)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                >
                  <Trash2 size={13} />
                  Xóa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedRoom ? 'Cập nhật thông tin phòng trọ' : 'Thêm phòng trọ mới'}
      >
        <RoomForm
          initialData={selectedRoom}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết Phòng ${selectedRoom?.roomNumber}`}
      >
        {selectedRoom && (
          <div>
            <Card title="Thông tin cấu hình phòng" style={{ border: 'none', padding: 0, boxShadow: 'none', marginBottom: '20px' }}>
              <div className="detail-section" style={{ fontSize: '13px' }}>
                <div className="detail-row">
                  <span className="detail-label">Số phòng trọ:</span>
                  <span className="detail-value">Phòng {selectedRoom.roomNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Vị trí tầng:</span>
                  <span className="detail-value">{selectedRoom.floor !== null ? `Tầng ${selectedRoom.floor}` : 'Tầng trệt'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Diện tích phòng:</span>
                  <span className="detail-value">{selectedRoom.area} m²</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tối đa người ở:</span>
                  <span className="detail-value">{selectedRoom.maxPeople} người</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Giá thuê niêm yết:</span>
                  <span className="detail-value" style={{ color: 'var(--primary)' }}>{formatCurrency(selectedRoom.baseRentPrice)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tiền cọc mặc định:</span>
                  <span className="detail-value">{formatCurrency(selectedRoom.defaultDepositAmount)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái phòng:</span>
                  <span className="detail-value"><StatusBadge status={selectedRoom.status} /></span>
                </div>
              </div>
            </Card>

            {selectedRoom.status === ROOM_STATUS.OCCUPIED && (
              <div>
                {roomDetailLoading ? (
                  <Loading />
                ) : (
                  <div>
                    {roomRentalDetail ? (
                      <Card title="Hợp đồng đang thuê" style={{ border: 'none', padding: 0, boxShadow: 'none', marginBottom: '20px' }}>
                        <div className="detail-section" style={{ fontSize: '13px' }}>
                          <div className="detail-row">
                            <span className="detail-label">Khách đại diện:</span>
                            <span className="detail-value">{roomRentalDetail.representativeTenantName}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Giá thuê thực tế:</span>
                            <span className="detail-value" style={{ color: 'var(--primary)' }}>{formatCurrency(roomRentalDetail.monthlyRentPrice)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Tiền cọc đã nộp:</span>
                            <span className="detail-value">{formatCurrency(roomRentalDetail.depositPaidAmount)} / {formatCurrency(roomRentalDetail.depositAmount)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Ngày bắt đầu thuê:</span>
                            <span className="detail-value">{formatDate(roomRentalDetail.startDate)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Ngày hết hạn dự kiến:</span>
                            <span className="detail-value">{formatDate(roomRentalDetail.expectedEndDate)}</span>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '10px 0' }}>
                        Không tải được thông tin hợp đồng hoạt động của phòng.
                      </div>
                    )}

                    {roomMembers.length > 0 && (
                      <Card title="Thành viên đang sinh sống" style={{ border: 'none', padding: 0, boxShadow: 'none', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {roomMembers.map((member) => (
                            <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                              <div>
                                <strong>{member.tenantName}</strong>
                                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>SĐT: {member.tenantPhone || 'Không có'}</div>
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: member.memberRole === 'REPRESENTATIVE' ? 'var(--primary)' : 'var(--text-muted)' }}>
                                {member.memberRole === 'REPRESENTATIVE' ? 'Người đại diện' : 'Thành viên'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {roomRates && (
                      <Card title="Bảng giá dịch vụ áp dụng" style={{ border: 'none', padding: 0, boxShadow: 'none' }}>
                        <div className="detail-section" style={{ fontSize: '13px' }}>
                          <div className="detail-row">
                            <span className="detail-label">Tiền điện:</span>
                            <span className="detail-value">{formatCurrency(roomRates.electricUnitPrice)} / kWh</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Tiền nước:</span>
                            <span className="detail-value">{formatCurrency(roomRates.waterUnitPrice)} / m³</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Internet/Wifi:</span>
                            <span className="detail-value">{formatCurrency(roomRates.internetFee)} / Tháng</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Rác vệ sinh:</span>
                            <span className="detail-value">{formatCurrency(roomRates.trashFee)} / Tháng</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Giữ xe máy:</span>
                            <span className="detail-value">{formatCurrency(roomRates.parkingFee)} / xe / Tháng</span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button variant="primary" onClick={() => setIsDetailModalOpen(false)} style={{ width: '100%', minHeight: '44px', fontWeight: 700 }}>
            Đóng cửa sổ chi tiết
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Bạn có chắc chắn muốn xóa phòng trọ ${selectedRoom?.roomNumber}? Hành động này sẽ không thể khôi phục.`}
        confirmText="Xác nhận xóa"
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
