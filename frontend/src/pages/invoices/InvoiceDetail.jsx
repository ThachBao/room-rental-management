import React, { useState, useRef } from 'react';
import { toPng, toBlob } from 'html-to-image';
import Badge from '../../components/common/Badge';
import { INVOICE_STATUS, INVOICE_STATUS_LABELS, INVOICE_STATUS_BADGES } from '../../constants/invoiceStatus';
import { PAYMENT_METHOD, PAYMENT_METHOD_LABELS } from '../../constants/paymentMethod';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateTime, toLocalISOString } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import { uploadApi } from '../../api/uploadApi';
import { invoiceApi } from '../../api/invoiceApi';
import { paymentApi } from '../../api/paymentApi';
import { ExternalLink, CheckCircle, Banknote, Download, Copy, Share2, Sparkles, Building, Calendar, User, Clock, Trash2, Check } from 'lucide-react';

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

  // Dynamic fee items filter: only show items with amount > 0
  const feeItems = [];

  if ((invoice.rentAmount ?? 0) > 0) {
    feeItems.push({
      label: 'Tiền thuê phòng',
      sub: 'Chi phí thuê phòng cố định theo hợp đồng',
      amount: invoice.rentAmount,
      isDiscount: false,
    });
  }

  if ((invoice.electricAmount ?? 0) > 0 || (invoice.electricUsage ?? 0) > 0) {
    feeItems.push({
      label: 'Tiền điện sử dụng',
      sub: `Chỉ số: ${invoice.electricUsage ?? 0} kWh × ${formatCurrency(invoice.electricUnitPrice ?? 0)}/kWh`,
      amount: invoice.electricAmount ?? 0,
      isDiscount: false,
    });
  }

  if ((invoice.waterAmount ?? 0) > 0 || (invoice.waterUsage ?? 0) > 0) {
    feeItems.push({
      label: 'Tiền nước sử dụng',
      sub: `Chỉ số: ${invoice.waterUsage ?? 0} m³ × ${formatCurrency(invoice.waterUnitPrice ?? 0)}/m³`,
      amount: invoice.waterAmount ?? 0,
      isDiscount: false,
    });
  }

  if ((invoice.internetFee ?? 0) > 0) {
    feeItems.push({
      label: 'Phí mạng Internet',
      sub: null,
      amount: invoice.internetFee,
      isDiscount: false,
    });
  }

  if ((invoice.trashFee ?? 0) > 0) {
    feeItems.push({
      label: 'Phí thu gom rác thải',
      sub: null,
      amount: invoice.trashFee,
      isDiscount: false,
    });
  }

  if ((invoice.parkingFee ?? 0) > 0) {
    feeItems.push({
      label: 'Phí giữ xe máy',
      sub: null,
      amount: invoice.parkingFee,
      isDiscount: false,
    });
  }

  if ((invoice.otherFee ?? 0) > 0) {
    feeItems.push({
      label: 'Chi phí phát sinh khác',
      sub: null,
      amount: invoice.otherFee,
      isDiscount: false,
    });
  }

  if ((invoice.discountAmount ?? 0) > 0) {
    feeItems.push({
      label: 'Khuyến mãi / Giảm trừ cước',
      sub: null,
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

      const fileName = `Hoa_Don_Phong_${invoice.roomNumber || invoice.rentalId}_Thang_${invoice.billingMonth}.png`;
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
        // Fallback to download if ClipboardItem not supported
        handleExportImage();
      }
    } catch (err) {
      console.error('Copy image error:', err);
      // Fallback
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
            <Download size={15} />
            {exporting ? 'Đang xuất ảnh...' : 'Xuất ảnh gửi khách (.PNG)'}
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

      {/* ─── Printable / Exportable Invoice Document (Landscape 2 Columns) ─── */}
      <div ref={invoiceDocRef} className="invoice-document">
        {/* Document Header */}
        <div className="invoice-doc-header">
          <div>
            <div className="invoice-brand-subtitle">HỆ THỐNG QUẢN LÝ NHÀ TRỌ & PHÒNG CHO THUÊ</div>
            <h2 className="invoice-doc-title">HÓA ĐƠN TIỀN NHÀ & TIỆN ÍCH</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Kỳ thanh toán: <strong style={{ color: '#0f172a' }}>Tháng {invoice.billingMonth}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>MÃ HÓA ĐƠN</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
              #HD-{String(invoice.id).padStart(5, '0')}
            </div>
            <div style={{ marginTop: '4px' }}>
              <Badge
                label={INVOICE_STATUS_LABELS[status] || status}
                variant={INVOICE_STATUS_BADGES[status] || 'secondary'}
              />
            </div>
          </div>
        </div>

        {/* 4-Column Metadata Banner */}
        <div className="invoice-meta-banner">
          <div className="invoice-meta-item">
            <span className="meta-label">Phòng trọ</span>
            <span className="meta-val">Phòng {invoice.roomNumber || invoice.rentalId}</span>
          </div>
          <div className="invoice-meta-item">
            <span className="meta-label">Người đại diện</span>
            <span className="meta-val">{invoice.representativeTenantName || '---'}</span>
          </div>
          <div className="invoice-meta-item">
            <span className="meta-label">Hạn thanh toán</span>
            <span className="meta-val" style={{ color: '#b91c1c' }}>{formatDate(invoice.dueDate)}</span>
          </div>
          <div className="invoice-meta-item">
            <span className="meta-label">Thời điểm thanh toán</span>
            <span className="meta-val" style={{ color: invoice.paidAt ? 'var(--success)' : '#64748b' }}>
              {invoice.paidAt ? formatDateTime(invoice.paidAt) : 'Chưa thu tiền'}
            </span>
          </div>
        </div>

        {/* 2-Column Horizontal Body */}
        <div className="invoice-horizontal-grid">
          {/* Left Column: Itemized Service Breakdown */}
          <div className="invoice-items-card">
            <div className="invoice-items-header">
              Chi tiết các khoản phí & tiêu thụ
            </div>
            
            {feeItems.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Không có khoản mục phát sinh chi phí nào.
              </div>
            ) : (
              feeItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`invoice-item-row ${item.isDiscount ? 'discount-row' : ''}`}
                >
                  <div>
                    <div className="invoice-item-name" style={{ color: item.isDiscount ? '#be123c' : '#1e293b' }}>
                      {idx + 1}. {item.label}
                    </div>
                    {item.sub && <div className="invoice-item-sub">{item.sub}</div>}
                  </div>
                  <div
                    className="invoice-item-amount"
                    style={{ color: item.isDiscount ? '#be123c' : '#0f172a' }}
                  >
                    {item.isDiscount ? `- ${formatCurrency(item.amount)}` : formatCurrency(item.amount)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Total Summary & Payment Instructions */}
          <div className="invoice-summary-panel">
            {/* Total Amount Box */}
            <div className="invoice-amount-box">
              <div className="amount-label">TỔNG TIỀN CẦN THANH TOÁN</div>
              <h1 className="amount-num">{formatCurrency(invoice.totalAmount)}</h1>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '6px' }}>
                Hạn chót: {formatDate(invoice.dueDate)}
              </div>
            </div>

            {/* Note if available */}
            {invoice.note && (
              <div className="invoice-note-box">
                <strong style={{ color: '#0f172a' }}>Ghi chú:</strong> {invoice.note}
              </div>
            )}

            {/* Payment advice message */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '0.8rem', color: '#166534', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} /> Hướng dẫn nộp tiền
              </div>
              Quý khách vui lòng thanh toán đúng hạn trước ngày <strong>{formatDate(invoice.dueDate)}</strong> bằng tiền mặt cho quản lý hoặc chuyển khoản ngân hàng.
            </div>

            {/* Receipt image preview if already paid/submitted */}
            {receiptUrl && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '10px 12px', backgroundColor: '#f8fafc' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Chứng từ thanh toán đính kèm:
                </span>
                <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <img src={receiptUrl} alt="Receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <a href={receiptUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                    <ExternalLink size={12} /> Xem ảnh gốc
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Footer */}
        <div className="invoice-footer-msg">
          <span>Xin chân thành cảm ơn quý khách đã tin tưởng và đồng hành cùng nhà trọ!</span>
          <span>Ngày in: {formatDate(new Date())}</span>
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
