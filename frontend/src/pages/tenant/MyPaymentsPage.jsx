import React, { useState, useEffect } from 'react';
import { roomRentalApi } from '../../api/roomRentalApi';
import { invoiceApi } from '../../api/invoiceApi';
import { paymentApi } from '../../api/paymentApi';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { formatPaymentMethod } from '../../constants/labels';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { CreditCard, Calendar, User, FileText } from 'lucide-react';
import SortControl from '../../components/common/SortControl';
import { sortData } from '../../utils/sortUtils';

export default function MyPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [sortBy, setSortBy] = useState('paymentDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortOptions = [
    { value: 'paymentDate', label: 'Ngày thanh toán' },
    { value: 'amount', label: 'Số tiền' },
  ];

  useEffect(() => {
    async function loadTenantPayments() {
      const demoTenantId = localStorage.getItem('demoTenantId');
      if (!demoTenantId) {
        setError('Không tìm thấy thông tin định danh khách thuê.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Get active rental
        const rentals = await roomRentalApi.getAll('ACTIVE');
        const myActiveRental = rentals && rentals.length > 0 ? rentals[0] : null;

        if (myActiveRental) {
          // 2. Fetch invoices for this rental to get their IDs
          const invoicesList = await invoiceApi.getAll({ rentalId: myActiveRental.id });
          const invoiceIds = invoicesList.map(i => i.id);
          const invoiceMap = invoicesList.reduce((acc, inv) => {
            acc[inv.id] = inv.billingMonth;
            return acc;
          }, {});

          // 3. Fetch all payments
          const allPayments = await paymentApi.getAll();
          
          // 4. Filter payments matching the tenant's invoice IDs
          const tenantPayments = allPayments.filter(p => invoiceIds.includes(p.invoiceId));
          
          // Attach billingMonth
          const mapped = tenantPayments.map(p => ({
            ...p,
            billingMonth: invoiceMap[p.invoiceId] || ''
          }));
          
          setPayments(mapped);
        } else {
          setPayments([]);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadTenantPayments();
  }, []);

  const sortedPayments = sortData(payments, sortBy, sortDirection);

  if (loading) return <Loading />;

  return (
    <div>
      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {payments.length > 0 && (
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

      {sortedPayments.length === 0 ? (
        <EmptyState
          message="Hiện tại chưa ghi nhận giao dịch thanh toán nào."
          icon={CreditCard}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sortedPayments.map((payment, idx) => (
            <Card key={idx} style={{ padding: '16px' }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Hóa đơn Tháng {payment.billingMonth}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--success)' }}>
                  +{formatCurrency(payment.amount)}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Thời gian: {formatDateTime(payment.paymentDate)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Hình thức: <strong>{formatPaymentMethod(payment.paymentMethod)}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Người nhận: {payment.receivedByUserName || 'Chủ trọ'}</span>
                </div>
                {payment.note && (
                  <div style={{ backgroundColor: '#f9fafb', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px', marginTop: '6px', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    <strong>Ghi chú:</strong> {payment.note}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
