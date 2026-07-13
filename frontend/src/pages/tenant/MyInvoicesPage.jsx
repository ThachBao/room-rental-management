import React, { useState, useEffect } from 'react';
import { roomRentalApi } from '../../api/roomRentalApi';
import { invoiceApi } from '../../api/invoiceApi';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import InvoiceDetail from '../invoices/InvoiceDetail';
import Loading from '../../components/common/Loading';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { FileText, Calendar, DollarSign, Eye } from 'lucide-react';
import SortControl from '../../components/common/SortControl';
import { sortData } from '../../utils/sortUtils';

export default function MyInvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [sortBy, setSortBy] = useState('billingMonth');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortOptions = [
    { value: 'billingMonth', label: 'Tháng hóa đơn' },
    { value: 'totalAmount', label: 'Tổng tiền' },
    { value: 'id', label: 'Mới nhất' },
  ];
  
  // Modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadTenantInvoices = async () => {
    const demoTenantId = localStorage.getItem('demoTenantId');
    if (!demoTenantId) {
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
        const invoicesList = await invoiceApi.getAll({ rentalId: myActiveRental.id });
        setInvoices(invoicesList);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sortedInvoices = sortData(invoices, sortBy, sortDirection);

  useEffect(() => {
    loadTenantInvoices();
  }, []);

  const handleDetailClick = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  if (loading) return <Loading />;

  return (
    <div>
      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {invoices.length > 0 && (
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

      {sortedInvoices.length === 0 ? (
        <EmptyState
          message="Hiện tại chưa phát sinh hóa đơn tiền phòng nào."
          icon={FileText}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sortedInvoices.map((invoice, idx) => (
            <Card
              key={idx}
              onClick={() => handleDetailClick(invoice)}
              style={{ padding: '16px', cursor: 'pointer' }}
            >
              {/* Card Header: Month & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)' }}>
                  Tháng {invoice.billingMonth}
                </span>
                <StatusBadge status={invoice.status} />
              </div>

              {/* Card Body */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                    <span>Hạn đóng: {formatDate(invoice.dueDate)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={14} style={{ color: 'var(--text-light)' }} />
                    <span>Tổng tiền: <strong style={{ color: invoice.status === 'PAID' ? 'var(--primary)' : 'var(--danger)', fontSize: '15px' }}>{formatCurrency(invoice.totalAmount)}</strong></span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid double trigger
                    handleDetailClick(invoice);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', minHeight: '32px' }}
                >
                  <Eye size={14} />
                  Chi tiết
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invoice Detail Modal (acts as Bottom Sheet on mobile) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Hóa đơn Tháng ${selectedInvoice?.billingMonth || ''}`}
      >
        {selectedInvoice && (
          <InvoiceDetail
            invoice={selectedInvoice}
            onClose={() => setIsDetailOpen(false)}
            onStatusChange={() => {
              loadTenantInvoices();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
