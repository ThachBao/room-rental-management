import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { tenantApi } from '../../api/tenantApi';
import { roomRentalApi } from '../../api/roomRentalApi';
import { invoiceApi } from '../../api/invoiceApi';
import { maintenanceApi } from '../../api/maintenanceApi';
import { paymentApi } from '../../api/paymentApi';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import { getErrorMessage } from '../../utils/errorHandler';
import { formatCurrency } from '../../utils/formatCurrency';
import { Home, Users, Key, AlertCircle, Wrench, DollarSign, Layers, DoorOpen, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalTenants: 0,
    activeRentals: 0,
    unpaidInvoices: 0,
    pendingMaintenance: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminName = localStorage.getItem('adminName') || 'Chủ trọ';

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [rooms, tenants, rentals, invoices, maintenance, payments] = await Promise.all([
          roomApi.getAll(),
          tenantApi.getAll(),
          roomRentalApi.getAll(),
          invoiceApi.getAll(),
          maintenanceApi.getAll(),
          paymentApi.getAll()
        ]);

        const totalRooms = rooms.length;
        const availableRooms = rooms.filter(r => r.status === 'AVAILABLE').length;
        const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
        const totalTenants = tenants.length;
        const activeRentals = rentals.filter(r => r.status === 'ACTIVE').length;
        const unpaidInvoices = invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').length;
        const pendingMaintenance = maintenance.filter(m => m.status === 'PENDING').length;
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        setStats({
          totalRooms,
          availableRooms,
          occupiedRooms,
          totalTenants,
          activeRentals,
          unpaidInvoices,
          pendingMaintenance,
          totalRevenue,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <style>{`
        .dashboard-stat-card {
          background-color: var(--light);
          padding: 16px 14px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
          align-items: center;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
        }
        .dashboard-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
        .dashboard-revenue-card {
          background: linear-gradient(135deg, var(--primary) 0%, #15803d 100%);
          color: var(--light);
          padding: 24px 20px;
          border-radius: var(--radius-lg);
          margin-bottom: 20px;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-md);
        }
        .dashboard-revenue-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -6px rgba(21, 128, 61, 0.35);
        }
        .dashboard-tip-card {
          background-color: var(--light);
          border-left: 4px solid var(--primary);
          padding: 16px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          margin-top: 8px;
        }
      `}</style>

      {/* Greeting Banner */}
      <div style={{ marginBottom: '20px', padding: '4px 2px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--dark)' }}>
          Xin chào, {adminName}!
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
          Dưới đây là tổng quan tình hình hoạt động của nhà trọ hôm nay.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Revenue Card (Total Income) */}
      <div className="dashboard-revenue-card" onClick={() => navigate('/admin/payments')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} style={{ color: 'var(--light)' }} />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TỔNG DOANH THU THỰC TẾ ĐÃ THU</span>
            <p style={{ fontSize: '11px', margin: 0, opacity: 0.7 }}>Bấm để xem lịch sử thanh toán</p>
          </div>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0, color: 'var(--light)', fontFamily: 'var(--font-heading)' }}>
          {formatCurrency(stats.totalRevenue)}
        </h2>
      </div>

      {/* Dashboard Metrics Grid (2 columns on mobile) */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        <div className="dashboard-stat-card" onClick={() => navigate('/admin/rooms')}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DoorOpen size={20} />
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>TỔNG PHÒNG</p>
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0' }}>{stats.totalRooms}</h4>
          </div>
        </div>

        <div className="dashboard-stat-card" onClick={() => navigate('/admin/rooms', { state: { status: 'AVAILABLE' } })}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DoorOpen size={20} />
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>CÒN TRỐNG</p>
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--success)' }}>{stats.availableRooms}</h4>
          </div>
        </div>

        <div className="dashboard-stat-card" onClick={() => navigate('/admin/rooms', { state: { status: 'OCCUPIED' } })}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DoorOpen size={20} />
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>ĐANG THUÊ</p>
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--danger)' }}>{stats.occupiedRooms}</h4>
          </div>
        </div>

        <div className="dashboard-stat-card" onClick={() => navigate('/admin/tenants')}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={20} />
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>NGƯỜI THUÊ</p>
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0' }}>{stats.totalTenants}</h4>
          </div>
        </div>

        <div className="dashboard-stat-card" onClick={() => navigate('/admin/rentals')}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ClipboardList size={20} />
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>HỢP ĐỒNG</p>
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0' }}>{stats.activeRentals}</h4>
          </div>
        </div>

        <div className="dashboard-stat-card" onClick={() => navigate('/admin/invoices', { state: { status: 'UNPAID' } })}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>NỢ HÓA ĐƠN</p>
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--warning)' }}>{stats.unpaidInvoices}</h4>
          </div>
        </div>
      </div>

      <div className="dashboard-stat-card" style={{ marginBottom: '20px' }} onClick={() => navigate('/admin/maintenance', { state: { status: 'PENDING' } })}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Wrench size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>BÁO HỎNG CHỜ XỬ LÝ</p>
          <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: stats.pendingMaintenance > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
            {stats.pendingMaintenance} yêu cầu
          </h4>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Xem ngay &rsaquo;</span>
      </div>

      <div className="dashboard-tip-card">
        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--dark)' }}>Quản lý chuyên nghiệp</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', lineHeight: 1.5, margin: 0 }}>
          Hệ thống cung cấp đầy đủ các tính năng lập hợp đồng, chốt chỉ số điện nước, tự động tính tiền hóa đơn dựa trên đơn giá dịch vụ và theo dõi thanh toán công nợ. Hãy bấm vào các số liệu thống kê ở trên để xem nhanh danh sách tương ứng.
        </p>
      </div>
    </div>
  );
}
