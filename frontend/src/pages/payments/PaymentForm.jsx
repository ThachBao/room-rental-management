import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { invoiceApi } from '../../api/invoiceApi';
import { PAYMENT_METHOD } from '../../constants/paymentMethod';
import { validateRequired } from '../../utils/validateForm';
import { formatCurrency } from '../../utils/formatCurrency';
import { toLocalISOString } from '../../utils/formatDate';

const methodOptions = [
  { value: PAYMENT_METHOD.CASH, label: 'Tiền mặt' },
  { value: PAYMENT_METHOD.BANK_TRANSFER, label: 'Chuyển khoản' },
  { value: PAYMENT_METHOD.MOMO, label: 'Ví MoMo' },
  { value: PAYMENT_METHOD.ZALOPAY, label: 'Ví ZaloPay' },
  { value: PAYMENT_METHOD.OTHER, label: 'Phương thức khác' },
];

export default function PaymentForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    paymentMethod: PAYMENT_METHOD.BANK_TRANSFER,
    paymentDate: '',
    receivedByUserId: '1',
    note: '',
  });

  const [invoices, setInvoices] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadUnpaidInvoices() {
      try {
        setLoadingOptions(true);
        const list = await invoiceApi.getAll();
        const unpaidList = list.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE');
        setInvoices(unpaidList);
      } catch (err) {
        console.error('Failed to load unpaid invoices for payment', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadUnpaidInvoices();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      paymentDate: toLocalISOString(new Date()),
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Autofill amount when invoice is selected
    if (name === 'invoiceId' && value) {
      const selectedInvoice = invoices.find(i => i.id === parseInt(value, 10));
      if (selectedInvoice) {
        setFormData(prev => ({
          ...prev,
          invoiceId: value,
          amount: String(selectedInvoice.totalAmount),
          note: `Thu tiền phòng tháng ${selectedInvoice.billingMonth} phòng ${selectedInvoice.roomNumber}`,
        }));
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.invoiceId) newErrors.invoiceId = 'Vui lòng chọn hóa đơn cần thu tiền';
    if (!formData.paymentDate) newErrors.paymentDate = 'Vui lòng nhập ngày lập phiếu';
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền thanh toán phải lớn hơn 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      invoiceId: parseInt(formData.invoiceId, 10),
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      paymentDate: formData.paymentDate + ':00',
      receivedByUserId: parseInt(formData.receivedByUserId, 10),
      note: formData.note || null,
    });
  };

  if (loadingOptions) return <Loading />;

  return (
    <form onSubmit={handleFormSubmit}>
      <Select
        label="Hóa đơn cần thu tiền"
        name="invoiceId"
        value={formData.invoiceId}
        onChange={handleChange}
        options={invoices.map(i => ({ value: i.id, label: `Phòng ${i.roomNumber} (Tháng ${i.billingMonth}) - Phải thu: ${formatCurrency(i.totalAmount)}` }))}
        required
        placeholder="Chọn hóa đơn chưa thanh toán"
        error={errors.invoiceId}
      />
      {formData.amount && (
        <div style={{ backgroundColor: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Số tiền thực tế cần thu (phải khớp 100%):</span>
          <h3 style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
            {formatCurrency(parseFloat(formData.amount))}
          </h3>
        </div>
      )}
      <div className="responsive-grid-2">
        <Select
          label="Phương thức nộp tiền"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          options={methodOptions}
          required
        />
        <Input
          label="Thời điểm lập phiếu thu"
          name="paymentDate"
          type="datetime-local"
          value={formData.paymentDate}
          onChange={handleChange}
          required
          error={errors.paymentDate}
        />
      </div>
      <Input
        label="Ghi chú đóng tiền"
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder="Mã giao dịch ngân hàng, tên người chuyển khoản..."
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lập phiếu thu</Button>
      </div>
    </form>
  );
}
