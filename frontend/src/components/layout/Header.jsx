import React from 'react';
import { useLocation } from 'react-router-dom';

const routeTitleMap = {
  '/': { title: 'Dashboard', subtitle: 'Tổng quan tình hình nhà trọ' },
  '/rooms': { title: 'Quản Lý Phòng', subtitle: 'Danh sách phòng trọ, trạng thái và giá thuê' },
  '/tenants': { title: 'Quản Lý Khách Thuê', subtitle: 'Thông tin cá nhân, liên hệ của người thuê' },
  '/room-rentals': { title: 'Lượt Thuê Phòng', subtitle: 'Thông tin hợp đồng thuê phòng và đặt cọc' },
  '/rental-members': { title: 'Thành Viên Phòng', subtitle: 'Khách đại diện và thành viên ở cùng' },
  '/contract-files': { title: 'Tài Liệu Đính Kèm', subtitle: 'Hợp đồng thuê phòng, ảnh CCCD và giấy tờ' },
  '/utility-rates': { title: 'Đơn Giá Tiện Ích', subtitle: 'Cấu hình giá điện, nước, internet áp dụng' },
  '/meter-readings': { title: 'Chỉ Số Điện Nước', subtitle: 'Ghi nhận số điện nước và điện năng tiêu thụ hàng tháng' },
  '/invoices': { title: 'Hóa Đơn Hàng Tháng', subtitle: 'Tính toán hóa đơn phòng và ghi nhận trạng thái' },
  '/payments': { title: 'Thanh Toán Hóa Đơn', subtitle: 'Lập phiếu thu tiền và phương thức thanh toán' },
  '/maintenance': { title: 'Yêu Cầu Sửa Chữa', subtitle: 'Tiếp nhận báo hỏng và lịch sử sửa chữa' },
};

export default function Header() {
  const location = useLocation();
  const currentRoute = routeTitleMap[location.pathname] || { title: 'Room Rental Management', subtitle: 'Hệ thống quản lý nhà trọ' };

  return (
    <header className="main-header">
      <div className="header-title-section">
        <h1 className="header-title">{currentRoute.title}</h1>
        <span className="header-subtitle">{currentRoute.subtitle}</span>
      </div>
      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem' }}>👤</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quản trị viên</span>
        </div>
      </div>
    </header>
  );
}
