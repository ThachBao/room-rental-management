import React, { useState, useRef } from 'react';
import { toPng, toBlob } from 'html-to-image';
import Badge from '../../components/common/Badge';
import { INVOICE_STATUS, INVOICE_STATUS_LABELS, INVOICE_STATUS_BADGES } from '../../constants/invoiceStatus';
import { PAYMENT_METHOD, PAYMENT_METHOD_LABELS } from '../../constants/paymentMethod';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateTime, toLocalISOString } from '../../utils/formatDate';
import { numberToWordsVietnamese } from '../../utils/numberToWordsVietnamese';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import { uploadApi } from '../../api/uploadApi';
import { invoiceApi } from '../../api/invoiceApi';
import { paymentApi } from '../../api/paymentApi';
import { ExternalLink, CheckCircle, Banknote, Download, Copy, Trash2, Check, Printer } from 'lucide-react';

export default function InvoiceDetail({ invoice, onClose, onStatusChange, onDelete }) {
  if (!invoice) return null;

  const invoiceDocRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(invoice.receiptImageUrl || '');
  const [status, setStatus] = useState(invoice.status);
  const [actionLoading, setActionLoading] = useState(false);

  // Admin direct payment state
  const [showPayForm, setShowPayForm] = useState(false);
  const [payMethod, setPayMethod] = useState(PAYMENT_METHOD.CASH);
  const [payDate, setPayDate] = useState(toLocalISOString(new Date()));
  const [payNote, setPayNote] = useState(`Thu tiền trực tiếp phòng ${invoice.roomNumber}`);

  const role = localStorage.getItem('userRole'); // 'admin' or 'tenant'

  // Dynamic fee items: only include items with amount > 0
  const feeItems = [];

  if ((invoice.rentAmount ?? 0) > 0) {
    feeItems.push({
      name: 'Tiền thuê phòng',
      qty: '1 Tháng',
      unitPrice: invoice.rentAmount,
      amount: invoice.rentAmount,
      isDiscount: false,
    });
  }

  if ((invoice.electricAmount ?? 0) > 0 || (invoice.electricUsage ?? 0) > 0) {
    feeItems.push({
      name: 'Tiền điện sinh hoạt',
      qty: `${invoice.electricUsage ?? 0} kWh`,
      unitPrice: invoice.electricUnitPrice ?? 0,
      amount: invoice.electricAmount ?? 0,
      isDiscount: false,
    });
  }

  if ((invoice.waterAmount ?? 0) > 0 || (invoice.waterUsage ?? 0) > 0) {
    feeItems.push({
      name: 'Tiền nước sinh hoạt',
      qty: `${invoice.waterUsage ?? 0} m³`,
      unitPrice: invoice.waterUnitPrice ?? 0,
      amount: invoice.waterAmount ?? 0,
      isDiscount: false,
    });
  }

  if ((invoice.internetFee ?? 0) > 0) {
    feeItems.push({
      name: 'Phí mạng Internet',
      qty: '1 Tháng',
      unitPrice: invoice.internetFee,
      amount: invoice.internetFee,
      isDiscount: false,
    });
  }

  if ((invoice.trashFee ?? 0) > 0) {
    feeItems.push({
      name: 'Phí thu gom rác thải',
      qty: '1 Tháng',
      unitPrice: invoice.trashFee,
      amount: invoice.trashFee,
      isDiscount: false,
    });
  }

  if ((invoice.parkingFee ?? 0) > 0) {
    feeItems.push({
      name: 'Phí giữ xe máy',
      qty: '1 Tháng',
      unitPrice: invoice.parkingFee,
      amount: invoice.parkingFee,
      isDiscount: false,
    });
  }

  if ((invoice.otherFee ?? 0) > 0) {
    feeItems.push({
      name: 'Chi phí phát sinh khác',
      qty: '1 Lần',
      unitPrice: invoice.otherFee,
      amount: invoice.otherFee,
      isDiscount: false,
    });
  }

  if ((invoice.discountAmount ?? 0) > 0) {
    feeItems.push({
      name: 'Khuyến mãi / Giảm trừ cước',
      qty: '-',
      unitPrice: null,
      amount: invoice.discountAmount,
      isDiscount: true,
    });
  }

  const handleExportImage = async () => {
    if (!invoiceDocRef.current) return;
    try {
      setExporting(true);
      setError(null);
      const dataUrl = await toPng(invoiceDocRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const fileName = `Phieu_Thu_Phong_${invoice.roomNumber || invoice.rentalId}_Thang_${invoice.billingMonth}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export image error:', err);
      setError('Không thể xuất ảnh hóa đơn. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!invoiceDocRef.current) return;
    try {
      setExporting(true);
      setError(null);
      const blob = await toBlob(invoiceDocRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      } else {
        handleExportImage();
      }
    } catch (err) {
      console.error('Copy image error:', err);
      handleExportImage();
    } finally {
      setExporting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const res = await uploadApi.upload(file);
      setReceiptUrl(res.fileUrl);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!receiptUrl) {
      setError('Vui lòng tải lên ảnh chụp giao dịch chuyển khoản');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const updated = await invoiceApi.confirmPayment(invoice.id, receiptUrl);
      setStatus(updated.status);
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      setError(err.message || 'Lỗi khi xác nhận thanh toán');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePayment = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const updated = await invoiceApi.approvePayment(invoice.id);
      setStatus(updated.status);
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      setError(err.message || 'Lỗi khi duyệt thanh toán');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminDirectPayment = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);
      await paymentApi.create({
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        paymentMethod: payMethod,
        paymentDate: payDate ? payDate + ':00' : toLocalISOString(new Date()) + ':00',
        receivedByUserId: parseInt(localStorage.getItem('adminId') || '1', 10),
        note: payNote || 'Thu tiền trực tiếp'
      });
      setStatus(INVOICE_STATUS.PAID);
      setShowPayForm(false);
      if (onStatusChange) onStatusChange({ ...invoice, status: INVOICE_STATUS.PAID, paidAt: new Date().toISOString() });
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu phiếu thu');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="invoice-landscape-wrapper">
      {/* ─── Top Export & Action Toolbar (Not part of exported image) ─── */}
      <div className="invoice-top-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportImage}
            disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, minHeight: '34px' }}
          >
            <Printer size={15} />
            {exporting ? 'Đang xuất ảnh...' : 'In / Xuất ảnh biên lai (.PNG)'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyImage}
            disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '34px' }}
            title="Sao chép ảnh vào bộ nhớ đệm để dán vào Zalo / Messenger"
          >
            {copiedToast ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Copy size={15} />}
            {copiedToast ? 'Đã chép ảnh!' : 'Sao chép ảnh'}
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge
            label={INVOICE_STATUS_LABELS[status] || status}
            variant={INVOICE_STATUS_BADGES[status] || 'secondary'}
          />
        </div>
      </div>

      {/* ─── Printable / Exportable Invoice Receipt (Mẫu 1: Bảng Kế Toán Chuẩn) ─── */}
      <div ref={invoiceDocRef} className="invoice-receipt-paper">
        {/* Receipt Header */}
        <div className="receipt-header">
          <h2 className="receipt-title">PHIẾU THU TIỀN NHÀ</h2>
          <div className="receipt-subtitle">Kỳ thu: Tháng {invoice.billingMonth}</div>
        </div>

        {/* 2-Column Meta Info Grid */}
        <div className="receipt-meta-grid">
          <div>
            <div><strong>Phòng trọ:</strong> Phòng {invoice.roomNumber || invoice.rentalId}</div>
            <div style={{ marginTop: '4px' }}><strong>Khách thuê:</strong> {invoice.representativeTenantName || '---'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Hạn thanh toán:</strong> {formatDate(invoice.dueDate)}</div>
            <div style={{ marginTop: '4px' }}><strong>Mã hóa đơn:</strong> #HD-{String(invoice.id).padStart(5, '0')}</div>
          </div>
        </div>

        {/* Accounting Data Table */}
        <table className="receipt-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>STT</th>
              <th style={{ textAlign: 'left' }}>Khoản mục / Dịch vụ</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Số lượng / Chỉ số</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Đơn giá (VNĐ)</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Thành tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {feeItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '16px' }}>
                  Không có khoản mục phát sinh chi phí.
                </td>
              </tr>
            ) : (
              feeItems.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: item.isDiscount ? '#fff1f2' : 'transparent' }}>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: item.isDiscount ? '#be123c' : '#1e293b' }}>
                    {item.name}
                  </td>
                  <td style={{ textAlign: 'center', color: '#475569' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right', color: '#475569' }}>
                    {item.unitPrice ? formatCurrency(item.unitPrice).replace(' ₫', '') : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: item.isDiscount ? '#be123c' : '#0f172a' }}>
                    {item.isDiscount ? `- ${formatCurrency(item.amount).replace(' ₫', '')}` : formatCurrency(item.amount).replace(' ₫', '')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Total and Words section */}
        <div className="receipt-total-section">
          <div className="receipt-total-row">
            <span>TỔNG CỘNG THANH TOÁN:</span>
            <span className="receipt-total-amount">{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="receipt-words-row">
            <strong>Bằng chữ:</strong> {numberToWordsVietnamese(invoice.totalAmount)}
          </div>
          {invoice.note && (
            <div style={{ marginTop: '8px', fontSize: '0.825rem', color: '#475569' }}>
              <strong>Ghi chú:</strong> {invoice.note}
            </div>
          )}
        </div>

        {/* Signatures */}
        <div className="receipt-signatures">
          <div className="receipt-sign-box">
            <div className="receipt-sign-title">NGƯỜI NỘP TIỀN</div>
            <div className="receipt-sign-hint">(Ký, ghi rõ họ tên)</div>
          </div>
          <div className="receipt-sign-box">
            <div className="receipt-sign-title">NGƯỜI LẬP PHIẾU</div>
            <div className="receipt-sign-hint">(Ký, ghi rõ họ tên)</div>
          </div>
        </div>
      </div>

      {/* ─── Interactive Action Section (Bottom of Modal) ─── */}
      <div style={{ marginTop: '4px' }}>
        {status === 'PENDING_APPROVAL' && (
          <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
              ⏳ Hóa đơn đang chờ duyệt thanh toán
            </span>
            <span style={{ fontSize: '0.825rem' }}>
              {role === 'tenant' 
                ? 'Bạn đã gửi xác nhận chuyển tiền. Vui lòng chờ chủ trọ kiểm tra tài khoản và phê duyệt.'
                : 'Khách thuê đã gửi xác nhận chuyển tiền. Vui lòng kiểm tra tài khoản ngân hàng của bạn.'}
            </span>
          </div>
        )}

        {/* Tenant upload receipt */}
        {role === 'tenant' && (status === 'UNPAID' || status === 'OVERDUE') && (
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--dark)' }}>
              Xác nhận chuyển khoản ngân hàng:
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={uploading} 
                style={{ fontSize: '0.85rem' }}
              />
              {uploading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đang tải ảnh chứng từ lên...</span>}
            </div>

            <Button 
              variant="primary" 
              onClick={handleConfirmPayment} 
              disabled={uploading || actionLoading || !receiptUrl}
              style={{ width: '100%', fontWeight: 700 }}
            >
              {actionLoading ? 'Đang gửi...' : 'Gửi xác nhận chuyển khoản'}
            </Button>
          </div>
        )}

        {/* Admin Approve Pending Payment */}
        {role === 'admin' && status === 'PENDING_APPROVAL' && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
            <Button
              variant="primary"
              onClick={handleApprovePayment}
              disabled={actionLoading}
              style={{ flex: 1, backgroundColor: '#059669', borderColor: '#059669', fontWeight: 700 }}
            >
              {actionLoading ? 'Đang duyệt...' : '✓ Duyệt thanh toán hóa đơn'}
            </Button>
          </div>
        )}

        {/* Admin Direct Collection (Cash / Transfer) */}
        {role === 'admin' && (status === 'UNPAID' || status === 'OVERDUE') && (
          <div style={{ marginBottom: '14px' }}>
            {!showPayForm ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  onClick={() => setShowPayForm(true)}
                  style={{ flex: 1, backgroundColor: '#059669', borderColor: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Banknote size={16} />
                  Xác nhận thu tiền mặt / Thanh toán
                </Button>
                {status === 'UNPAID' && onDelete && (
                  <Button
                    variant="danger"
                    onClick={() => onDelete(invoice)}
                    disabled={actionLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Xóa
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleAdminDirectPayment} style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> Lập phiếu thu tiền
                </h5>
                <div className="responsive-grid-2">
                  <Select
                    label="Hình thức thanh toán"
                    name="payMethod"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    options={Object.entries(PAYMENT_METHOD_LABELS).map(([val, lbl]) => ({ value: val, label: lbl }))}
                    required
                  />
                  <Input
                    label="Ngày nhận tiền"
                    name="payDate"
                    type="datetime-local"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Ghi chú"
                  name="payNote"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Ghi chú thu tiền..."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <Button variant="secondary" size="sm" onClick={() => setShowPayForm(false)} disabled={actionLoading}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={actionLoading}
                    style={{ backgroundColor: '#059669', borderColor: '#059669', fontWeight: 700 }}
                  >
                    {actionLoading ? 'Đang lưu...' : 'Xác nhận đã nhận tiền'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px', padding: '8px 12px', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-sm)' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button variant="secondary" onClick={onClose}>Đóng lại</Button>
        </div>
      </div>
    </div>
  );
}
