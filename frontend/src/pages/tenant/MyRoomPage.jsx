import React, { useState, useEffect } from 'react';
import { roomRentalApi } from '../../api/roomRentalApi';
import { rentalMemberApi } from '../../api/rentalMemberApi';
import { utilityRateApi } from '../../api/utilityRateApi';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import { Home, Calendar, ShieldCheck, DollarSign, Layers, Maximize } from 'lucide-react';

export default function MyRoomPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rentalDetail, setRentalDetail] = useState(null);
  const [members, setMembers] = useState([]);
  const [rates, setRates] = useState([]);

  useEffect(() => {
    async function loadRoomDetails() {
      const demoTenantId = localStorage.getItem('demoTenantId');
      if (!demoTenantId) {
        setError('Không tìm thấy thông tin định danh khách thuê.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const rentals = await roomRentalApi.getAll('ACTIVE');
        const myActiveRental = rentals && rentals.length > 0 ? rentals[0] : null;

        if (myActiveRental) {
          setRentalDetail(myActiveRental);
          
          // Load members of this room
          const membersList = await rentalMemberApi.getAll(myActiveRental.id);
          setMembers(membersList);

          // Load utility rates of this room
          try {
            const ratesList = await utilityRateApi.getAll(myActiveRental.id);
            setRates(ratesList);
          } catch (err) {
            console.error('Failed to load utility rates', err);
          }
        } else {
          setRentalDetail(null);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadRoomDetails();
  }, []);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
        ⚠️ {error}
      </div>
    );
  }

  if (!rentalDetail) {
    return (
      <EmptyState
        message="Bạn chưa được gán vào phòng trọ nào. Vui lòng liên hệ chủ trọ để làm hợp đồng thuê."
        icon={Home}
      />
    );
  }

  return (
    <div>
      {/* Visual room card */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #15803d 100%)',
          color: 'var(--light)',
          padding: '24px 20px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'inline-flex', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <Home size={32} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--light)' }}>
          Phòng {rentalDetail.roomNumber}
        </h2>
        <span style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.25)', color: 'var(--light)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, marginTop: '8px', textTransform: 'uppercase' }}>
          Hợp đồng đang hiệu lực
        </span>
      </div>

      {/* Detail Fields Card */}
      <Card title="Chi tiết hợp đồng">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Mã số phòng:</span>
            <strong style={{ color: 'var(--dark)' }}>Phòng {rentalDetail.roomNumber}</strong>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Khách đại diện:</span>
            <strong style={{ color: 'var(--dark)' }}>{rentalDetail.representativeTenantName}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Giá thuê phòng:</span>
            <strong style={{ color: 'var(--primary)' }}>{formatCurrency(rentalDetail.monthlyRentPrice)} <span style={{ fontWeight: 'normal', fontSize: '12px', color: 'var(--text-muted)' }}>/ tháng</span></strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Tiền cọc thực đóng:</span>
            <strong style={{ color: 'var(--dark)' }}>{formatCurrency(rentalDetail.depositPaidAmount)}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ngày bắt đầu thuê:</span>
            <strong style={{ color: 'var(--dark)' }}>{formatDate(rentalDetail.startDate)}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Dự kiến kết thúc:</span>
            <strong style={{ color: 'var(--dark)' }}>{formatDate(rentalDetail.expectedEndDate)}</strong>
          </div>
        </div>
        
        {rentalDetail.depositNote && (
          <div style={{ backgroundColor: '#f9fafb', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', marginTop: '16px', color: 'var(--text-muted)' }}>
            <strong>Ghi chú cọc:</strong> {rentalDetail.depositNote}
          </div>
        )}
      </Card>

      {/* Utility rates list */}
      {rates.length > 0 && (
        <Card title="Đơn giá dịch vụ áp dụng">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Đơn giá điện:</span>
              <strong style={{ color: 'var(--dark)' }}>{formatCurrency(rates[0].electricUnitPrice)} <span style={{ fontWeight: 'normal', fontSize: '12px', color: 'var(--text-muted)' }}>/ kWh</span></strong>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Đơn giá nước:</span>
              <strong style={{ color: 'var(--dark)' }}>{formatCurrency(rates[0].waterUnitPrice)} <span style={{ fontWeight: 'normal', fontSize: '12px', color: 'var(--text-muted)' }}>/ m³</span></strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Phí Internet:</span>
              <strong style={{ color: 'var(--dark)' }}>{formatCurrency(rates[0].internetFee)} <span style={{ fontWeight: 'normal', fontSize: '12px', color: 'var(--text-muted)' }}>/ tháng</span></strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Phí vệ sinh / rác:</span>
              <strong style={{ color: 'var(--dark)' }}>{formatCurrency(rates[0].trashFee)} <span style={{ fontWeight: 'normal', fontSize: '12px', color: 'var(--text-muted)' }}>/ tháng</span></strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Phí giữ xe:</span>
              <strong style={{ color: 'var(--dark)' }}>{formatCurrency(rates[0].parkingFee)} <span style={{ fontWeight: 'normal', fontSize: '12px', color: 'var(--text-muted)' }}>/ xe / tháng</span></strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Áp dụng từ tháng:</span>
              <strong style={{ color: 'var(--dark)' }}>Tháng {rates[0].effectiveFromMonth}</strong>
            </div>
          </div>
          {rates[0].note && (
            <div style={{ backgroundColor: '#f9fafb', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', marginTop: '16px', color: 'var(--text-muted)' }}>
              <strong>Ghi chú đơn giá:</strong> {rates[0].note}
            </div>
          )}
        </Card>
      )}

      {/* Members list (Mobile Card list view instead of table) */}
      <Card title="Thành viên trong phòng">
        {members.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Chưa có thành viên nào khác trong phòng.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {members.map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: idx === members.length - 1 ? 'none' : '1px solid var(--border-color)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--dark)' }}>{row.tenantName}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Dọn vào: {formatDate(row.moveInDate)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <Badge
                    label={row.memberRole === 'REPRESENTATIVE' ? 'Người đại diện' : 'Thành viên'}
                    variant={row.memberRole === 'REPRESENTATIVE' ? 'primary' : 'secondary'}
                  />
                  {row.moveOutDate ? (
                    <span style={{ fontSize: '11px', color: 'var(--danger)' }}>Rời đi: {formatDate(row.moveOutDate)}</span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 500 }}>Đang ở</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
