import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../api/paymentApi';
import { invoiceApi } from '../../api/invoiceApi';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Select from '../../components/common/Select';
import PaymentForm from './PaymentForm';
import Loading from '../../components/common/Loading';
import { formatPaymentMethod } from '../../constants/labels';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import SortControl from '../../components/common/SortControl';
import { sortData } from '../../utils/sortUtils';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterInvoiceId, setFilterInvoiceId] = useState('ALL');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortOptions = [
    { value: 'id', label: 'Mới nhất' },
    { value: 'paymentDate', label: 'Ngày thanh toán' },
    { value: 'amount', label: 'Số tiền nộp' },
  ];

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchInvoices = async () => {
    try {
      const data = await invoiceApi.getAll();
      setInvoices(data);
    } catch (err) {
      console.error('Failed to load invoices for filter', err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const queryFilters = {};
      if (filterInvoiceId !== 'ALL') queryFilters.invoiceId = filterInvoiceId;
      
      const data = await paymentApi.getAll(queryFilters);
      setPayments(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortedPayments = sortData(payments, sortBy, sortDirection);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filterInvoiceId]);

  const handleCreateClick = () => {
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      await paymentApi.create(formData);
      showToast('Lập phiếu thu và thanh toán hóa đơn thành công!');
      setIsFormModalOpen(false);
      fetchPayments();
      fetchInvoices(); // Refresh filter options
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const columns = [
    { header: 'Hóa đơn liên kết', key: 'invoiceId', render: (row) => `HĐ phòng ${row.invoiceId}`, style: { fontWeight: 700 } },
    { header: 'Số tiền thực thu', key: 'amount', render: (row) => <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(row.amount)}</span> },
    { header: 'Hình thức nộp', key: 'paymentMethod', render: (row) => formatPaymentMethod(row.paymentMethod) },
    { header: 'Thời điểm nộp', key: 'paymentDate', render: (row) => formatDateTime(row.paymentDate) },
    { header: 'Người thu tiền', key: 'receivedByUserName' },
    { header: 'Ghi chú đóng tiền', key: 'note' },
  ];

  const invoiceOptions = [
    { value: 'ALL', label: 'Tất cả hóa đơn' },
    ...invoices.map(i => ({ value: i.id, label: `Phòng ${i.roomNumber} (Tháng ${i.billingMonth})` })),
  ];

  return (
    <div>
      <PageHeader
        title="Lịch Sử Thu Tiền Phòng"
        onActionClick={handleCreateClick}
        actionLabel="Lập phiếu thu tiền"
      >
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <Select
            name="filterInvoiceId"
            value={filterInvoiceId}
            onChange={(e) => setFilterInvoiceId(e.target.value)}
            options={invoiceOptions}
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
          data={sortedPayments}
          emptyMessage="Chưa ghi nhận phiếu thu tiền phòng nào."
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Lập phiếu thu tiền phòng"
      >
        <PaymentForm
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
