import React, { useState, useEffect } from 'react';
import { rentalMemberApi } from '../../api/rentalMemberApi';
import { roomRentalApi } from '../../api/roomRentalApi';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import RentalMemberForm from './RentalMemberForm';
import Loading from '../../components/common/Loading';
import { formatDate, toLocalDateString } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';

const roleLabels = {
  REPRESENTATIVE: 'Người đại diện',
  OCCUPANT: 'Thành viên ở cùng',
};

const roleBadges = {
  REPRESENTATIVE: 'primary',
  OCCUPANT: 'secondary',
};

export default function RentalMembersPage() {
  const [members, setMembers] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRentalId, setFilterRentalId] = useState('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isMoveOutModalOpen, setIsMoveOutModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Move-out details
  const [moveOutData, setMoveOutData] = useState({
    moveOutDate: toLocalDateString(new Date()),
    note: '',
  });

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchActiveRentals = async () => {
    try {
      const list = await roomRentalApi.getAll('ACTIVE');
      setActiveRentals(list);
    } catch (err) {
      console.error('Failed to load active rentals', err);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await rentalMemberApi.getAll(filterRentalId === 'ALL' ? null : filterRentalId);
      setMembers([...data].sort((a, b) => b.id - a.id));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRentals();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [filterRentalId]);

  const handleCreateClick = () => {
    setSelectedMember(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (member) => {
    setSelectedMember(member);
    setIsFormModalOpen(true);
  };

  const handleMoveOutClick = (member) => {
    setSelectedMember(member);
    setMoveOutData({
      moveOutDate: toLocalDateString(new Date()),
      note: 'Rời khỏi phòng trọ',
    });
    setIsMoveOutModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedMember) {
        await rentalMemberApi.update(selectedMember.id, formData);
        showToast('Cập nhật thông tin thành viên thành công!');
      } else {
        await rentalMemberApi.create(formData);
        showToast('Thêm thành viên phòng thành công!');
      }
      setIsFormModalOpen(false);
      fetchMembers();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleMoveOutSubmit = async (e) => {
    e.preventDefault();
    try {
      await rentalMemberApi.moveOut(selectedMember.id, moveOutData);
      showToast('Cập nhật ngày dọn ra cho thành viên thành công!');
      setIsMoveOutModalOpen(false);
      fetchMembers();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const columns = [
    { header: 'Phòng trọ', key: 'roomNumber', render: (row) => `Phòng ${row.roomNumber}`, style: { fontWeight: 700 } },
    { header: 'Tên thành viên', key: 'tenantName', style: { fontWeight: 600 } },
    {
      header: 'Vai trò',
      key: 'memberRole',
      render: (row) => (
        <Badge
          label={roleLabels[row.memberRole] || row.memberRole}
          variant={roleBadges[row.memberRole] || 'secondary'}
        />
      ),
    },
    { header: 'Ngày chuyển vào', key: 'moveInDate', render: (row) => formatDate(row.moveInDate) },
    {
      header: 'Ngày chuyển ra',
      key: 'moveOutDate',
      render: (row) => row.moveOutDate ? (
        <span style={{ color: 'var(--danger)', fontWeight: 500 }}>{formatDate(row.moveOutDate)}</span>
      ) : (
        <span style={{ color: 'var(--success)' }}>Đang sinh sống</span>
      ),
    },
    { header: 'Ghi chú', key: 'note' },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (row) => {
        const canMoveOut = !row.moveOutDate;
        return (
          <div className="table-actions">
            <Button variant="secondary" size="sm" onClick={() => handleEditClick(row)}>Sửa</Button>
            {canMoveOut && (
              <Button variant="danger" size="sm" onClick={() => handleMoveOutClick(row)}>Báo chuyển ra</Button>
            )}
          </div>
        );
      },
    },
  ];

  const rentalOptions = [
    { value: 'ALL', label: 'Tất cả phòng đang ở' },
    ...activeRentals.map(r => ({ value: r.id, label: `Phòng ${r.roomNumber} (${r.representativeTenantName})` })),
  ];

  return (
    <div>
      <PageHeader
        title="Quản Lý Thành Viên Phòng"
        onActionClick={handleCreateClick}
        actionLabel="Thêm thành viên"
      >
        <div className="filter-group">
          <Select
            name="filterRentalId"
            value={filterRentalId}
            onChange={(e) => setFilterRentalId(e.target.value)}
            options={rentalOptions}
          />
        </div>
      </PageHeader>

      {loading ? (
        <Loading />
      ) : (
        <DataTable
          columns={columns}
          data={members}
          emptyMessage="Không tìm thấy thành viên phòng nào."
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedMember ? 'Cập nhật thành viên phòng' : 'Thêm thành viên phòng mới'}
      >
        <RentalMemberForm
          initialData={selectedMember}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Move Out Modal */}
      <Modal
        isOpen={isMoveOutModalOpen}
        onClose={() => setIsMoveOutModalOpen(false)}
        title="Báo thành viên chuyển ra"
      >
        <form onSubmit={handleMoveOutSubmit}>
          <div style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
            Đăng ký ngày chuyển đi cho khách <strong>{selectedMember?.tenantName}</strong> rời khỏi phòng <strong>{selectedMember?.roomNumber}</strong>.
          </div>
          <Input
            label="Ngày dọn ra thực tế"
            name="moveOutDate"
            type="date"
            required
            value={moveOutData.moveOutDate}
            onChange={(e) => setMoveOutData(prev => ({ ...prev, moveOutDate: e.target.value }))}
          />
          <Input
            label="Lý do / Ghi chú chuyển đi"
            name="note"
            value={moveOutData.note}
            onChange={(e) => setMoveOutData(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Lý do chuyển đi..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setIsMoveOutModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="danger">Xác nhận chuyển ra</Button>
          </div>
        </form>
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
