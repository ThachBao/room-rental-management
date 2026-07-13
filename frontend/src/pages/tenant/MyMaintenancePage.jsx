import React, { useState, useEffect } from 'react';
import { roomRentalApi } from '../../api/roomRentalApi';
import { maintenanceApi } from '../../api/maintenanceApi';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { Wrench, Plus, Calendar, AlertTriangle, MessageSquare, DollarSign } from 'lucide-react';
import SortControl from '../../components/common/SortControl';
import { sortData } from '../../utils/sortUtils';

const priorityOptions = [
  { value: 'LOW', label: 'Thấp' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HIGH', label: 'Cao' },
];

export default function MyMaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeRental, setActiveRental] = useState(null);
  const [demoTenantId, setDemoTenantId] = useState(null);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortOptions = [
    { value: 'id', label: 'Mới nhất' },
    { value: 'createdAt', label: 'Ngày tạo yêu cầu' },
  ];

  // Modal form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [formErrors, setFormErrors] = useState({});

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadMaintenanceData = async () => {
    const tenantIdVal = localStorage.getItem('demoTenantId');
    setDemoTenantId(tenantIdVal);

    if (!tenantIdVal) {
      setError('Không tìm thấy thông tin định danh khách thuê.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get active rental
      const rentals = await roomRentalApi.getAll('ACTIVE');
      const myActiveRental = rentals && rentals.length > 0 ? rentals[0] : null;

      if (myActiveRental) {
        setActiveRental(myActiveRental);
        const data = await maintenanceApi.getAll({ rentalId: myActiveRental.id });
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sortedRequests = sortData(requests, sortBy, sortDirection);

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const handleCreateClick = () => {
    if (!activeRental) {
      showToast('Bạn chưa liên kết hợp đồng phòng hoạt động nên không thể báo hỏng.', 'error');
      return;
    }
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề sự cố';
    if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả chi tiết sự cố';

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    try {
      const payload = {
        roomId: activeRental.roomId,
        rentalId: activeRental.id,
        tenantId: parseInt(demoTenantId, 10),
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
      };

      await maintenanceApi.create(payload);
      showToast('Gửi yêu cầu báo hỏng thành công!');
      setIsFormOpen(false);
      loadMaintenanceData();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading && sortedRequests.length === 0) return <Loading />;

  return (
    <div>
      {/* Floating Action Button or Top Action Button */}
      <div style={{ marginBottom: '16px' }}>
        <Button
          onClick={handleCreateClick}
          variant="primary"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '44px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700
          }}
        >
          <Plus size={20} />
          Gửi yêu cầu báo hỏng mới
        </Button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {requests.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SortControl
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
            options={sortOptions}
          />
        </div>
      )}

      {sortedRequests.length === 0 ? (
        <EmptyState
          message="Chưa có yêu cầu báo hỏng sửa chữa nào được gửi."
          icon={Wrench}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sortedRequests.map((request, idx) => (
            <Card key={idx} style={{ padding: '16px' }}>
              {/* Card Header: Title & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--dark)' }}>
                  {request.title}
                </h4>
                <StatusBadge status={request.status} />
              </div>

              {/* Description */}
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                {request.description}
              </p>

              {/* Card Footer Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    <span>Gửi lúc: {formatDateTime(request.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Ưu tiên: <StatusBadge status={request.priority} /></span>
                  </div>
                </div>

                {request.repairCost && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontWeight: 600 }}>
                    <DollarSign size={13} />
                    <span>Chi phí sửa chữa: {formatCurrency(request.repairCost)}</span>
                  </div>
                )}

                {request.resolvedNote && (
                  <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px', marginTop: '4px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <MessageSquare size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Phản hồi:</strong> {request.resolvedNote}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Maintenance Modal (Bottom Sheet on mobile) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Báo cáo sự cố thiết bị"
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px', color: 'var(--primary-hover)', fontWeight: 500 }}>
            Báo hỏng cho phòng: <strong>Phòng {activeRental?.roomNumber}</strong>.
          </div>
          
          <div className="responsive-grid-2-1">
            <Input
              label="Tiêu đề sự cố"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Rò nước nhà vệ sinh, Hỏng điều hòa..."
              required
              error={formErrors.title}
            />
            <Select
              label="Mức độ cấp bách"
              name="priority"
              value={formData.priority}
              onChange={handleFormChange}
              options={priorityOptions}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả sự cố & Vị trí xảy ra *</label>
            <textarea
              name="description"
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Mô tả kỹ để chủ trọ chuẩn bị dụng cụ vật tư thay thế phù hợp..."
              required
              style={{ resize: 'none' }}
            />
            {formErrors.description && <div className="form-error-msg">{formErrors.description}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} style={{ flex: 1 }}>Hủy</Button>
            <Button type="submit" variant="primary" style={{ flex: 2 }}>Gửi yêu cầu</Button>
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
