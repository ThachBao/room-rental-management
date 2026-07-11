import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { maintenanceApi } from '../../api/maintenanceApi';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Select from '../../components/common/Select';
import MaintenanceRequestForm from './MaintenanceRequestForm';
import ResolveMaintenanceForm from './ResolveMaintenanceForm';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { MAINTENANCE_STATUS } from '../../constants/maintenanceStatus';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { Plus, Edit2, Wrench, Play, CheckCircle2, User, Calendar, AlertTriangle } from 'lucide-react';

const filterStatusOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: MAINTENANCE_STATUS.PENDING, label: 'Chờ xử lý' },
  { value: MAINTENANCE_STATUS.IN_PROGRESS, label: 'Đang xử lý' },
  { value: MAINTENANCE_STATUS.DONE, label: 'Đã hoàn tất' },
];

const priorityOptions = [
  { value: 'ALL', label: 'Tất cả mức độ' },
  { value: 'LOW', label: 'Thấp' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HIGH', label: 'Cao' },
];

export default function MaintenanceRequestsPage() {
  const location = useLocation();
  const initialStatus = location.state?.status || 'ALL';
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    status: initialStatus,
    priority: 'ALL',
  });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const queryFilters = {};
      if (filters.status !== 'ALL') queryFilters.status = filters.status;
      if (filters.priority !== 'ALL') queryFilters.priority = filters.priority;

      const data = await maintenanceApi.getAll(queryFilters);
      setRequests([...data].sort((a, b) => b.id - a.id));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClick = () => {
    setSelectedRequest(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (req) => {
    setSelectedRequest(req);
    setIsFormModalOpen(true);
  };

  const handleStartRepairClick = async (req) => {
    try {
      await maintenanceApi.updateStatus(req.id, {
        status: MAINTENANCE_STATUS.IN_PROGRESS,
        resolvedNote: 'Bắt đầu tiến hành sửa chữa sự cố',
        repairCost: 0,
      });
      showToast('Đã ghi nhận bắt đầu sửa chữa sự cố!');
      fetchRequests();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleResolveClick = (req) => {
    setSelectedRequest(req);
    setIsResolveModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedRequest) {
        await maintenanceApi.update(selectedRequest.id, formData);
        showToast('Cập nhật yêu cầu báo hỏng sửa chữa thành công!');
      } else {
        await maintenanceApi.create(formData);
        showToast('Tạo yêu cầu báo hỏng mới thành công!');
      }
      setIsFormModalOpen(false);
      fetchRequests();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleResolveSubmit = async (resolveData) => {
    try {
      await maintenanceApi.resolve(selectedRequest.id, resolveData);
      showToast('Đã ghi nhận hoàn tất sửa chữa và tất toán chi phí!');
      setIsResolveModalOpen(false);
      fetchRequests();
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
          Ghi nhận báo hỏng mới
        </Button>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={filterStatusOptions}
          />
          <Select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            options={priorityOptions}
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : requests.length === 0 ? (
        <EmptyState
          message="Không tìm thấy yêu cầu sửa chữa nào."
          icon={Wrench}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {requests.map((request) => {
            const isPending = request.status === MAINTENANCE_STATUS.PENDING;
            const isInProgress = request.status === MAINTENANCE_STATUS.IN_PROGRESS;
            
            return (
              <Card key={request.id} style={{ padding: '16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)' }}>
                    Phòng {request.roomNumber}
                  </span>
                  <StatusBadge status={request.status} />
                </div>

                {/* Title & description */}
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--dark)' }}>
                  {request.title}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  {request.description}
                </p>

                {/* Body Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} style={{ color: 'var(--text-light)' }} />
                      <span>Báo bởi: {request.tenantName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />
                      <span>Ưu tiên: <StatusBadge status={request.priority} /></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} style={{ color: 'var(--text-light)' }} />
                    <span>Thời điểm báo: {formatDateTime(request.createdAt)}</span>
                  </div>
                  {request.repairCost > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--danger)' }}>
                      <span>Chi phí: {formatCurrency(request.repairCost)}</span>
                    </div>
                  )}
                  {request.resolvedNote && (
                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}>
                      <strong>Ghi chú:</strong> {request.resolvedNote}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  {(isPending || isInProgress) ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(request)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                      >
                        <Edit2 size={13} />
                        Sửa
                      </Button>
                      {isPending && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartRepairClick(request)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                        >
                          <Play size={13} />
                          Tiến hành
                        </Button>
                      )}
                      {isInProgress && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleResolveClick(request)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                        >
                          <CheckCircle2 size={13} />
                          Hoàn tất
                        </Button>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>Đã hoàn tất xử lý</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Modal (Bottom Sheet on mobile) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedRequest ? 'Cập nhật yêu cầu sửa chữa' : 'Lập phiếu yêu cầu sửa chữa'}
      >
        <MaintenanceRequestForm
          initialData={selectedRequest}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Resolve Modal (Bottom Sheet on mobile) */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Hoàn thành sửa chữa thiết bị"
      >
        <ResolveMaintenanceForm
          request={selectedRequest}
          onSubmit={handleResolveSubmit}
          onCancel={() => setIsResolveModalOpen(false)}
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
