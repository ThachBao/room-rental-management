import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import UserForm from './UserForm';
import Loading from '../../components/common/Loading';
import { getErrorMessage } from '../../utils/errorHandler';
import SortControl from '../../components/common/SortControl';
import { sortData } from '../../utils/sortUtils';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortOptions = [
    { value: 'id', label: 'Mới nhất' },
    { value: 'fullName', label: 'Họ tên' },
    { value: 'phone', label: 'Số điện thoại' },
  ];

  // Modals & Dialogs state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const currentAdminId = localStorage.getItem('adminId');
  const currentUser = users.find(u => String(u.id) === currentAdminId);
  const isCurrentUserRoot = currentUser ? !!currentUser.root : false;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = sortData(users, sortBy, sortDirection);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateClick = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleToggleStatusClick = async (user) => {
    try {
      await userApi.toggleStatus(user.id);
      showToast(
        user.enabled
          ? `Đã khóa tài khoản của ${user.fullName} thành công!`
          : `Đã mở khóa tài khoản của ${user.fullName} thành công!`
      );
      fetchUsers();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedUser) {
        await userApi.update(selectedUser.id, formData);
        showToast('Cập nhật thông tin tài khoản thành công!');
      } else {
        await userApi.create(formData);
        showToast('Tạo tài khoản mới thành công!');
      }
      setIsFormModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await userApi.delete(selectedUser.id);
      showToast('Xóa tài khoản người dùng thành công!');
      setIsConfirmOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const columns = [
    { header: 'Họ và tên chủ tài khoản', key: 'fullName', style: { fontWeight: 700 } },
    { header: 'Số điện thoại đăng nhập', key: 'phone' },
    {
      header: 'Vai trò',
      key: 'userRole',
      render: (row) => (
        <Badge
          label={row.userRole === 'LANDLORD' ? 'Chủ trọ / Quản lý' : 'Khách thuê'}
          variant={row.userRole === 'LANDLORD' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      header: 'Trạng thái',
      key: 'enabled',
      render: (row) => (
        <Badge
          label={row.enabled ? 'Đang hoạt động' : 'Đã bị khóa'}
          variant={row.enabled ? 'success' : 'danger'}
        />
      ),
    },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (row) => {
        const isSelf = String(row.id) === currentAdminId;
        const isRoot = !!row.root;

        const canEdit = isCurrentUserRoot || isSelf || row.userRole !== 'LANDLORD';
        const canDeleteOrLock = !isSelf && !isRoot && (isCurrentUserRoot || row.userRole !== 'LANDLORD');
        
        return (
          <div className="table-actions">
            {canEdit && (
              <Button variant="secondary" size="sm" onClick={() => handleEditClick(row)}>Sửa</Button>
            )}
            {canDeleteOrLock && (
              <>
                <Button
                  variant={row.enabled ? 'warning' : 'success'}
                  size="sm"
                  onClick={() => handleToggleStatusClick(row)}
                >
                  {row.enabled ? 'Khóa' : 'Mở khóa'}
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteClick(row)}>Xóa</Button>
              </>
            )}
            {isSelf && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Tài khoản của bạn</span>}
            {!isSelf && isRoot && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Quản trị tối cao (Root)</span>}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản Lý Tài Khoản Người Dùng"
        onActionClick={handleCreateClick}
        actionLabel="Thêm tài khoản"
      >
        <div className="filter-group">
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
          data={sortedUsers}
          emptyMessage="Không tìm thấy tài khoản người dùng nào."
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedUser ? 'Cập nhật tài khoản người dùng' : 'Thêm tài khoản người dùng mới'}
      >
        <UserForm
          initialData={selectedUser}
          isCurrentUserRoot={isCurrentUserRoot}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Bạn có chắc chắn muốn xóa tài khoản của ${selectedUser?.fullName}?`}
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
