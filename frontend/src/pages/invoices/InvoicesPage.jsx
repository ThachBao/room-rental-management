import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { invoiceApi } from '../../api/invoiceApi';
import { roomRentalApi } from '../../api/roomRentalApi';
import { meterReadingApi } from '../../api/meterReadingApi';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Select from '../../components/common/Select';
import InvoiceForm from './InvoiceForm';
import InvoiceDetail from './InvoiceDetail';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { INVOICE_STATUS } from '../../constants/invoiceStatus';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { Plus, Eye, Edit2, AlertTriangle, FileText, Calendar, User, DollarSign, Trash2 } from 'lucide-react';

const filterStatusOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: INVOICE_STATUS.PENDING_APPROVAL, label: 'Chờ duyệt thanh toán' },
  { value: INVOICE_STATUS.UNPAID, label: 'Chưa thanh toán' },
  { value: INVOICE_STATUS.PAID, label: 'Đã thanh toán' },
  { value: INVOICE_STATUS.OVERDUE, label: 'Quá hạn' },
];

export default function InvoicesPage() {
  const location = useLocation();
  const initialStatus = location.state?.status || 'ALL';
  const [invoices, setInvoices] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    status: initialStatus,
    rentalId: 'ALL',
    billingMonth: '',
  });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const queryFilters = {};
      if (filters.status !== 'ALL') queryFilters.status = filters.status;
      if (filters.rentalId !== 'ALL') queryFilters.rentalId = filters.rentalId;
      if (filters.billingMonth) queryFilters.billingMonth = filters.billingMonth;

      const data = await invoiceApi.getAll(queryFilters);
      setInvoices([...data].sort((a, b) => b.id - a.id));
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
    fetchInvoices();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClick = () => {
    setSelectedInvoice(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (invoice) => {
    setSelectedInvoice(invoice);
    setIsFormModalOpen(true);
  };

  const handleDetailClick = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleMarkOverdueClick = async (invoice) => {
    try {
      await invoiceApi.markOverdue(invoice.id);
      showToast('Đã đánh dấu hóa đơn là quá hạn thành công!');
      fetchInvoices();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDeleteClick = async (invoice) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hóa đơn của phòng ${invoice.roomNumber} kỳ tháng ${invoice.billingMonth} không?`)) {
      try {
        await invoiceApi.delete(invoice.id);
        showToast('Xóa hóa đơn thành công!');
        fetchInvoices();
        setIsDetailModalOpen(false);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedInvoice) {
        await invoiceApi.update(selectedInvoice.id, formData);
        showToast('Cập nhật thông tin hóa đơn thành công!');
      } else {
        // If creating a new invoice, save/update the meter readings first
        if (formData.meterReading) {
          const mr = formData.meterReading;
          const payload = {
            rentalId: formData.rentalId,
            billingMonth: formData.billingMonth,
            oldElectricNumber: mr.oldElectricNumber,
            newElectricNumber: mr.newElectricNumber,
            oldWaterNumber: mr.oldWaterNumber,
            newWaterNumber: mr.newWaterNumber
          };
          
          if (mr.id) {
            await meterReadingApi.update(mr.id, payload);
          } else {
            await meterReadingApi.create(payload);
          }
        }

        // Prepare invoice generation payload
        const invoicePayload = {
          rentalId: formData.rentalId,
          billingMonth: formData.billingMonth,
          dueDate: formData.dueDate,
          otherFee: formData.otherFee,
          discountAmount: formData.discountAmount,
          note: formData.note
        };

        await invoiceApi.generate(invoicePayload);
        showToast('Khởi tạo hóa đơn tháng và chốt số điện nước thành công!');
      }
      setIsFormModalOpen(false);
      fetchInvoices();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const rentalOptions = [
    { value: 'ALL', label: 'Tất cả lượt thuê' },
    ...rentals.map(r => ({ value: r.id, label: `Phòng ${r.roomNumber} (${r.representativeTenantName})` })),
  ];

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
          Khởi tạo hóa đơn thu tiền
        </Button>

        {/* Filter inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={filterStatusOptions}
          />
          <input
            type="month"
            name="billingMonth"
            className="form-control"
            value={filters.billingMonth}
            onChange={handleFilterChange}
            style={{ width: '100%', minHeight: '42px' }}
          />
        </div>
        <Select
          name="rentalId"
          value={filters.rentalId}
          onChange={handleFilterChange}
          options={rentalOptions}
        />
      </div>

      {loading ? (
        <Loading />
      ) : invoices.length === 0 ? (
        <EmptyState
          message="Không tìm thấy hóa đơn tiền nhà nào."
          icon={FileText}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {invoices.map((invoice) => (
            <Card key={invoice.id} style={{ padding: '16px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)' }}>
                  Phòng {invoice.roomNumber}
                </span>
                <StatusBadge status={invoice.status} />
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Cư dân: {invoice.representativeTenantName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Kỳ hóa đơn: Tháng {invoice.billingMonth} (Hạn đóng: {formatDate(invoice.dueDate)})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Tổng tiền thu: <strong style={{ color: invoice.status === 'PAID' ? 'var(--primary)' : 'var(--danger)', fontSize: '15px' }}>{formatCurrency(invoice.totalAmount)}</strong></span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDetailClick(invoice)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                >
                  <Eye size={13} />
                  Chi tiết
                </Button>
                {invoice.status === INVOICE_STATUS.UNPAID && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditClick(invoice)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                    >
                      <Edit2 size={13} />
                      Sửa
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleMarkOverdueClick(invoice)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                    >
                      <AlertTriangle size={13} />
                      Báo trễ
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(invoice)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px' }}
                    >
                      <Trash2 size={13} />
                      Xóa
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal (Bottom Sheet on mobile) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedInvoice ? 'Sửa thông tin hóa đơn chưa thanh toán' : 'Khởi tạo hóa đơn thu tiền mới'}
      >
        <InvoiceForm
          initialData={selectedInvoice}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Detail Modal (Bottom Sheet on mobile) */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết hóa đơn tiền phòng & dịch vụ"
      >
        <InvoiceDetail
          invoice={selectedInvoice}
          onClose={() => setIsDetailModalOpen(false)}
          onStatusChange={() => {
            fetchInvoices();
            showToast('Cập nhật trạng thái hóa đơn thành công');
          }}
          onDelete={handleDeleteClick}
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
