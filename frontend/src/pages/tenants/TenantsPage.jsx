import React, { useState, useEffect } from 'react';
import { tenantApi } from '../../api/tenantApi';
import { userApi } from '../../api/userApi';
import { roomRentalApi } from '../../api/roomRentalApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import TenantForm from './TenantForm';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { Plus, Edit2, Trash2, Search, User, Phone, IdCard, Home, Calendar, Eye, Shield, CheckCircle } from 'lucide-react';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Modals & Dialogs state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Detail Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tenantRental, setTenantRental] = useState(null);
  const [tenantUser, setTenantUser] = useState(null);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantApi.getAll(searchKeyword.trim() ? searchKeyword : null);
      setTenants([...data].sort((a, b) => b.id - a.id));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTenants();
    }, 300); // Debounce search calls

    return () => clearTimeout(delayDebounceFn);
  }, [searchKeyword]);

  const handleCreateClick = () => {
    setSelectedTenant(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (tenant) => {
    setSelectedTenant(tenant);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (tenant) => {
    setSelectedTenant(tenant);
    setIsConfirmOpen(true);
  };

  const handleDetailClick = async (tenant) => {
    setSelectedTenant(tenant);
    setIsDetailModalOpen(true);
    setTenantRental(null);
    setTenantUser(null);

    try {
      setDetailLoading(true);
      // 1. Fetch user if linked
      if (tenant.userId) {
        const u = await userApi.getById(tenant.userId);
        setTenantUser(u);
      }
      
      // 2. Fetch active rentals and find if they are representative
      const activeRentals = await roomRentalApi.getAll('ACTIVE');
      const activeRental = activeRentals.find(r => r.representativeTenantId === tenant.id);
      if (activeRental) {
        setTenantRental(activeRental);
      }
    } catch (err) {
      console.error('Failed to load tenant details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedTenant) {
        await tenantApi.update(selectedTenant.id, formData);
        showToast('Cập nhật khách thuê thành công!');
      } else {
        await tenantApi.create(formData);
        showToast('Thêm khách thuê mới thành công!');
      }
      setIsFormModalOpen(false);
      fetchTenants();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await tenantApi.delete(selectedTenant.id);
      showToast('Xóa thông tin khách thuê thành công!');
      setIsConfirmOpen(false);
      fetchTenants();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div>
      {/* Search and Action Bar */}
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button
          onClick={handleCreateClick}
          variant="primary"
          style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
        >
          <Plus size={20} />
          Thêm người thuê mới
        </Button>

        {/* Search input with icon */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên hoặc SĐT..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : tenants.length === 0 ? (
        <EmptyState
          message="Không tìm thấy khách thuê trọ nào."
          icon={User}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tenants.map((tenant) => (
            <Card key={tenant.id} style={{ padding: '16px' }}>
              {/* Header: Name and avatar character */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  {tenant.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--dark)' }}>
                    {tenant.fullName}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tenant.phone}</span>
                </div>
              </div>

              {/* Body details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {tenant.identityNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IdCard size={14} style={{ color: 'var(--text-light)' }} />
                    <span>CCCD: {tenant.identityNumber}</span>
                  </div>
                )}
                {tenant.dateOfBirth && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                    <span>Sinh ngày: {formatDate(tenant.dateOfBirth)}</span>
                  </div>
                )}
                {tenant.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Home size={14} style={{ color: 'var(--text-light)' }} />
                    <span>Địa chỉ: {tenant.address}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDetailClick(tenant)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px', marginRight: 'auto' }}
                >
                  <Eye size={13} />
                  Chi tiết
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditClick(tenant)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                >
                  <Edit2 size={13} />
                  Sửa
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(tenant)}
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
        title={selectedTenant ? 'Cập nhật khách thuê' : 'Thêm khách thuê trọ mới'}
      >
        <TenantForm
          initialData={selectedTenant}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết Hồ sơ - ${selectedTenant?.fullName}`}
      >
        {selectedTenant && (
          <div>
            <Card title="Hồ sơ cá nhân khách thuê" style={{ border: 'none', padding: 0, boxShadow: 'none', marginBottom: '20px' }}>
              <div className="detail-section" style={{ fontSize: '13px' }}>
                <div className="detail-row">
                  <span className="detail-label">Họ và tên:</span>
                  <span className="detail-value">{selectedTenant.fullName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Số điện thoại liên hệ:</span>
                  <span className="detail-value">{selectedTenant.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Số CCCD / Hộ chiếu:</span>
                  <span className="detail-value">{selectedTenant.identityNumber || 'Chưa cung cấp'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ngày tháng năm sinh:</span>
                  <span className="detail-value">{selectedTenant.dateOfBirth ? formatDate(selectedTenant.dateOfBirth) : 'Chưa cung cấp'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Địa chỉ đăng ký HKTT:</span>
                  <span className="detail-value">{selectedTenant.address || 'Chưa cung cấp'}</span>
                </div>
                {selectedTenant.emergencyContactName && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Người liên hệ khẩn cấp:</span>
                      <span className="detail-value">{selectedTenant.emergencyContactName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">SĐT liên hệ khẩn cấp:</span>
                      <span className="detail-value">{selectedTenant.emergencyContactPhone || 'Chưa cung cấp'}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {detailLoading ? (
              <Loading />
            ) : (
              <div>
                {/* Account status */}
                <Card title="Tài khoản đăng nhập hệ thống" style={{ border: 'none', padding: 0, boxShadow: 'none', marginBottom: '20px' }}>
                  {tenantUser ? (
                    <div className="detail-section" style={{ fontSize: '13px' }}>
                      <div className="detail-row">
                        <span className="detail-label">Số điện thoại đăng nhập:</span>
                        <span className="detail-value" style={{ fontWeight: 'bold' }}>{tenantUser.phone}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Trạng thái hoạt động:</span>
                        <span className="detail-value">
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: 'var(--radius-full)', 
                            fontSize: '11px', 
                            fontWeight: 'bold',
                            backgroundColor: tenantUser.enabled ? 'var(--success-light)' : 'var(--danger-light)', 
                            color: tenantUser.enabled ? 'var(--success)' : 'var(--danger)' 
                          }}>
                            {tenantUser.enabled ? 'Đang hoạt động' : 'Bị khóa'}
                          </span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-sm)' }}>
                      Không có tài khoản đăng nhập liên kết.
                    </div>
                  )}
                </Card>

                {/* Current room contract */}
                <Card title="Phòng trọ đang lưu trú" style={{ border: 'none', padding: 0, boxShadow: 'none' }}>
                  {tenantRental ? (
                    <div className="detail-section" style={{ fontSize: '13px' }}>
                      <div className="detail-row">
                        <span className="detail-label">Số phòng đang thuê:</span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Phòng {tenantRental.roomNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Vai trò lưu trú:</span>
                        <span className="detail-value" style={{ fontWeight: 600 }}>Người đại diện hợp đồng</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Ngày bắt đầu thuê:</span>
                        <span className="detail-value">{formatDate(tenantRental.startDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Giá thuê theo hợp đồng:</span>
                        <span className="detail-value">{formatCurrency(tenantRental.monthlyRentPrice)}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-sm)' }}>
                      Hiện tại không đứng tên đại diện hợp đồng thuê phòng nào.
                    </div>
                  )}
                </Card>
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
        message={`Bạn có chắc chắn muốn xóa khách thuê ${selectedTenant?.fullName}? Hành động này sẽ không thể khôi phục.`}
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
