import React, { useState } from 'react';
import Badge from '../../components/common/Badge';
import { INVOICE_STATUS, INVOICE_STATUS_LABELS, INVOICE_STATUS_BADGES } from '../../constants/invoiceStatus';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import { uploadApi } from '../../api/uploadApi';
import { invoiceApi } from '../../api/invoiceApi';
import { ExternalLink } from 'lucide-react';

export default function InvoiceDetail({ invoice, onClose, onStatusChange, onDelete }) {
  if (!invoice) return null;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(invoice.receiptImageUrl || '');
  const [status, setStatus] = useState(invoice.status);
  const [actionLoading, setActionLoading] = useState(false);

  const role = localStorage.getItem('userRole'); // 'admin' or 'tenant'

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

  return (
    <div className="invoice-preview-card">
      <div className="invoice-preview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="invoice-title">HÓA ĐƠN TIỀN NHÀ</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tháng tính tiền: <strong>{invoice.billingMonth}</strong>
          </span>
        </div>
        <Badge
          label={INVOICE_STATUS_LABELS[status] || status}
          variant={INVOICE_STATUS_BADGES[status] || 'secondary'}
        />
      </div>

      <div className="responsive-grid-2" style={{ marginBottom: '24px', fontSize: '0.9rem' }}>
        <div>
          <p style={{ marginBottom: '6px' }}><strong>Phòng trọ:</strong> Phòng {invoice.roomNumber}</p>
          <p><strong>Khách thuê đại diện:</strong> {invoice.representativeTenantName}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ marginBottom: '6px' }}><strong>Hạn thanh toán:</strong> {formatDate(invoice.dueDate)}</p>
          {invoice.paidAt && <p><strong>Thời điểm thanh toán:</strong> {formatDateTime(invoice.paidAt)}</p>}
        </div>
      </div>

      <div className="detail-section">
        <h4 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px', fontWeight: 'bold' }}>
          Chi tiết dịch vụ tiêu thụ
        </h4>
        
        <div className="detail-row">
          <span className="detail-label">1. Tiền thuê phòng (cố định)</span>
          <span className="detail-value">{formatCurrency(invoice.rentAmount)}</span>
        </div>

        <div className="detail-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="detail-label">2. Tiền điện sử dụng</span>
            <span className="detail-value">{formatCurrency(invoice.electricAmount)}</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Chỉ số: {invoice.electricUsage} kWh (Đơn giá: {formatCurrency(invoice.electricUnitPrice)}/kWh)
          </span>
        </div>

        <div className="detail-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="detail-label">3. Tiền nước sử dụng</span>
            <span className="detail-value">{formatCurrency(invoice.waterAmount)}</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Chỉ số: {invoice.waterUsage} m³ (Đơn giá: {formatCurrency(invoice.waterUnitPrice)}/m³)
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">4. Phí mạng Internet</span>
          <span className="detail-value">{formatCurrency(invoice.internetFee)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">5. Phí thu gom rác thải</span>
          <span className="detail-value">{formatCurrency(invoice.trashFee)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">6. Phí dịch vụ gửi xe</span>
          <span className="detail-value">{formatCurrency(invoice.parkingFee)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">7. Chi phí phát sinh khác</span>
          <span className="detail-value">{formatCurrency(invoice.otherFee)}</span>
        </div>

        <div className="detail-row" style={{ color: 'var(--danger)' }}>
          <span className="detail-label" style={{ color: 'var(--danger)' }}>8. Khuyến mãi / Giảm trừ cước</span>
          <span className="detail-value">- {formatCurrency(invoice.discountAmount)}</span>
        </div>

        <div className="invoice-total-row">
          <span>Tổng tiền thanh toán</span>
          <span>{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>

      {invoice.note && (
        <div style={{ backgroundColor: 'var(--secondary-light)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '24px' }}>
          <strong>Ghi chú:</strong> {invoice.note}
        </div>
      )}

      {/* Payment Confirmation / Approval Section */}
      <div style={{ marginTop: '24px', borderTop: '1px dashed var(--border-color)', paddingTop: '20px' }}>
        {status === 'PENDING_APPROVAL' && (
          <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⏳ Chờ duyệt thanh toán
            </span>
            <span style={{ fontSize: '0.85rem' }}>
              {role === 'tenant' 
                ? 'Bạn đã gửi xác nhận chuyển tiền. Vui lòng chờ chủ trọ kiểm tra tài khoản và phê duyệt.'
                : 'Khách thuê đã gửi xác nhận chuyển tiền. Vui lòng kiểm tra tài khoản ngân hàng của bạn.'}
            </span>
          </div>
        )}

        {receiptUrl && (
          <div style={{ marginBottom: '16px' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Ảnh chụp hóa đơn chuyển tiền:
            </span>
            <div style={{ position: 'relative', width: '120px', height: '160px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--secondary-light)' }}>
              <img src={receiptUrl} alt="Receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <a href={receiptUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {role === 'tenant' && (status === 'UNPAID' || status === 'OVERDUE') && (
          <div style={{ backgroundColor: 'var(--secondary-light)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Xác nhận đã chuyển khoản:
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={uploading} 
                style={{ fontSize: '0.8rem' }}
              />
              {uploading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đang tải ảnh lên...</span>}
            </div>

            <Button 
              variant="primary" 
              onClick={handleConfirmPayment} 
              disabled={uploading || actionLoading || !receiptUrl}
              style={{ width: '100%' }}
            >
              {actionLoading ? 'Đang gửi...' : 'Gửi xác nhận chuyển tiền'}
            </Button>
          </div>
        )}

        {role === 'admin' && status === 'PENDING_APPROVAL' && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <Button
              variant="primary"
              onClick={handleApprovePayment}
              disabled={actionLoading}
              style={{ flex: 1 }}
            >
              {actionLoading ? 'Đang duyệt...' : 'Duyệt thanh toán'}
            </Button>
          </div>
        )}

        {role === 'admin' && status === 'UNPAID' && onDelete && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <Button
              variant="danger"
              onClick={() => onDelete(invoice)}
              disabled={actionLoading}
              style={{ flex: 1 }}
            >
              Xóa hóa đơn
            </Button>
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '8px' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onClose}>Đóng lại</Button>
      </div>
    </div>
  );
}
