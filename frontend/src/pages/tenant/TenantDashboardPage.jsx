import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomRentalApi } from '../../api/roomRentalApi';
import { invoiceApi } from '../../api/invoiceApi';
import { maintenanceApi } from '../../api/maintenanceApi';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { Wrench, Receipt, FileText, Bell, ChevronRight, User, AlertCircle } from 'lucide-react';

export default function TenantDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenantName, setTenantName] = useState('');
  
  const [stats, setStats] = useState({
    roomNumber: 'Chưa có',
    unpaidCount: 0,
    unpaidAmount: 0,
    pendingMaintenance: 0,
    activeRental: null,
    latestMaintenance: null
  });

  useEffect(() => {
    async function loadTenantDashboard() {
      const demoTenantId = localStorage.getItem('demoTenantId');
      const storedName = localStorage.getItem('demoTenantName') || 'Khách thuê trọ';
      setTenantName(storedName);

      if (!demoTenantId) {
        setError('Không tìm thấy thông tin định danh khách thuê.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch active rentals
        const rentals = await roomRentalApi.getAll('ACTIVE');
        const myActiveRental = rentals && rentals.length > 0 ? rentals[0] : null;

        if (myActiveRental) {
          // 2. Fetch invoices for this rental
          const invoices = await invoiceApi.getAll({ rentalId: myActiveRental.id });
          const unpaidInvoices = invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE');
          const unpaidSum = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

          // 3. Fetch maintenance requests for this rental
          const maintenance = await maintenanceApi.getAll({ rentalId: myActiveRental.id });
          const pendingCount = maintenance.filter(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS').length;
          
          // Sort by id descending to get the latest
          const sortedMaintenance = [...maintenance].sort((a, b) => b.id - a.id);
          const latestMaintenance = sortedMaintenance[0] || null;

          setStats({
            roomNumber: `Phòng ${myActiveRental.roomNumber}`,
            unpaidCount: unpaidInvoices.length,
            unpaidAmount: unpaidSum,
            pendingMaintenance: pendingCount,
            activeRental: myActiveRental,
            latestMaintenance: latestMaintenance
          });
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadTenantDashboard();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <style>{`
        .tenant-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 10px;
          background-color: var(--light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          cursor: pointer;
          gap: 10px;
          box-shadow: var(--shadow-sm);
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tenant-action-btn:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
          background-color: var(--primary-light);
        }
        .tenant-card {
          background-color: var(--light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 18px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
        }
        .tenant-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
        .tenant-welcome-banner {
          background: linear-gradient(135deg, var(--primary) 0%, #15803d 100%);
          color: var(--light);
          padding: 24px 20px;
          border-radius: var(--radius-lg);
          margin-bottom: 20px;
          box-shadow: var(--shadow-md);
          position: relative;
          overflow: hidden;
        }
        .tenant-welcome-banner::before {
          content: '';
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          top: -20px;
          right: -20px;
        }
        .tenant-welcome-banner::after {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          bottom: -10px;
          right: 50px;
        }
      `}</style>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Premium Welcome Banner */}
      <div className="tenant-welcome-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              color: 'var(--light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 900,
              boxShadow: 'inset 0 0 10px rgba(255,255,255,0.1)'
            }}
          >
            {tenantName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: 'var(--light)' }}>
              Xin chào, {tenantName}!
            </h2>
            <span style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.18)', color: 'var(--light)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 700, marginTop: '6px' }}>
              {stats.roomNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Access Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div className="tenant-action-btn" onClick={() => navigate('/tenant/maintenance')}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={20} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Báo hỏng</span>
        </div>

        <div className="tenant-action-btn" onClick={() => navigate('/tenant/bills')}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={20} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Hóa đơn</span>
        </div>

        <div className="tenant-action-btn" onClick={() => navigate('/tenant/contracts')}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Hợp đồng</span>
        </div>
      </div>

      {/* Main Room Card */}
      <div className="tenant-card" onClick={() => navigate('/tenant/my-room')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PHÒNG ĐANG THUÊ</span>
          <ChevronRight size={16} style={{ color: 'var(--text-light)' }} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--primary)' }}>
          {stats.roomNumber}
        </h3>
        {stats.activeRental ? (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div>Giá thuê: <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(stats.activeRental.monthlyRentPrice)}</strong> / tháng</div>
            <div>Ngày bắt đầu: <span style={{ color: 'var(--text-main)' }}>{formatDate(stats.activeRental.startDate)}</span></div>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Bạn chưa được gán vào hợp đồng nào.</p>
        )}
      </div>

      {/* Unpaid Bills Summary Card */}
      <div className="tenant-card" onClick={() => navigate('/tenant/bills')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>HÓA ĐƠN CHƯA ĐÓNG</span>
          <ChevronRight size={16} style={{ color: 'var(--text-light)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 950, margin: 0, color: stats.unpaidCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {formatCurrency(stats.unpaidAmount)}
          </h3>
          {stats.unpaidCount > 0 && (
            <span style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontSize: '11px', fontWeight: 850, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              {stats.unpaidCount} hóa đơn
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          {stats.unpaidCount > 0
            ? 'Vui lòng kiểm tra chi tiết và thanh toán sớm để đảm bảo các dịch vụ.'
            : 'Tuyệt vời! Bạn đã hoàn thành tất cả các khoản thanh toán.'}
        </p>
      </div>

      {/* Latest Maintenance Card */}
      {stats.latestMaintenance && (
        <div className="tenant-card" onClick={() => navigate('/tenant/maintenance')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>SỰ CỐ MỚI NHẤT</span>
            <ChevronRight size={16} style={{ color: 'var(--text-light)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
              {stats.latestMaintenance.title}
            </h4>
            <StatusBadge status={stats.latestMaintenance.status} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
            {stats.latestMaintenance.description}
          </p>
        </div>
      )}

      {/* Soft card for notifications / rules */}
      <div
        style={{
          backgroundColor: '#f9fafb',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid var(--border-color)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: '12px'
        }}
      >
        <Bell size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--dark)' }}>Nội quy phòng trọ:</strong>
          <ul style={{ paddingLeft: '16px', marginTop: '6px', marginBottom: 0, lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <li>Hạn đóng tiền phòng hàng tháng là trước ngày 10.</li>
            <li>Đảm bảo quy định an toàn PCCC, không đun nấu khu vực cấm.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
