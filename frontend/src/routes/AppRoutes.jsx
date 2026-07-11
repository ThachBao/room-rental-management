import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import TenantLoginPage from '../pages/auth/TenantLoginPage';
import AuthLayout from '../components/layout/AuthLayout';
import AdminMobileLayout from '../components/layout/AdminMobileLayout';
import TenantMobileLayout from '../components/layout/TenantMobileLayout';

// Admin Page Imports
import DashboardPage from '../pages/dashboard/DashboardPage';
import RoomsPage from '../pages/rooms/RoomsPage';
import TenantsPage from '../pages/tenants/TenantsPage';
import RoomRentalsPage from '../pages/room-rentals/RoomRentalsPage';
import RentalMembersPage from '../pages/rental-members/RentalMembersPage';
import ContractFilesPage from '../pages/contract-files/ContractFilesPage';
import UtilityRatesPage from '../pages/utility-rates/UtilityRatesPage';
import MeterReadingsPage from '../pages/meter-readings/MeterReadingsPage';
import InvoicesPage from '../pages/invoices/InvoicesPage';
import PaymentsPage from '../pages/payments/PaymentsPage';
import MaintenanceRequestsPage from '../pages/maintenance/MaintenanceRequestsPage';
import UsersPage from '../pages/users/UsersPage';
import AdminProfilePage from '../pages/dashboard/AdminProfilePage';

// Tenant Page Imports
import TenantDashboardPage from '../pages/tenant/TenantDashboardPage';
import MyRoomPage from '../pages/tenant/MyRoomPage';
import MyInvoicesPage from '../pages/tenant/MyInvoicesPage';
import MyPaymentsPage from '../pages/tenant/MyPaymentsPage';
import MyMaintenancePage from '../pages/tenant/MyMaintenancePage';
import MyContractsPage from '../pages/tenant/MyContractsPage';
import TenantProfilePage from '../pages/tenant/TenantProfilePage';

// Route Guards & Layout Bindings
function RootRoute() {
  const role = localStorage.getItem('userRole');
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === 'tenant') {
    return <Navigate to="/tenant/home" replace />;
  }
  return <Navigate to="/admin/login" replace />;
}

function AdminRoute({ children, title }) {
  const role = localStorage.getItem('userRole');
  if (role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminMobileLayout title={title}>{children}</AdminMobileLayout>;
}

function TenantRoute({ children, title }) {
  const role = localStorage.getItem('userRole');
  const tenantId = localStorage.getItem('demoTenantId');
  if (role !== 'tenant' || !tenantId) {
    return <Navigate to="/tenant/login" replace />;
  }
  return <TenantMobileLayout title={title}>{children}</TenantMobileLayout>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirection */}
      <Route path="/" element={<RootRoute />} />

      {/* Login Screen Paths */}
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AuthLayout><AdminLoginPage /></AuthLayout>} />
      <Route path="/tenant/login" element={<AuthLayout><TenantLoginPage /></AuthLayout>} />

      {/* Admin Panel Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute title="Tổng quan"><DashboardPage /></AdminRoute>} />
      <Route path="/admin/rooms" element={<AdminRoute title="Phòng trọ"><RoomsPage /></AdminRoute>} />
      <Route path="/admin/tenants" element={<AdminRoute title="Người thuê"><TenantsPage /></AdminRoute>} />
      <Route path="/admin/rentals" element={<AdminRoute title="Thuê phòng"><RoomRentalsPage /></AdminRoute>} />
      <Route path="/admin/room-rentals" element={<Navigate to="/admin/rentals" replace />} />
      
      {/* Admin Subsections map to admin/profile menu, but keep direct routing */}
      <Route path="/admin/rental-members" element={<AdminRoute title="Thành viên phòng"><RentalMembersPage /></AdminRoute>} />
      <Route path="/admin/contract-files" element={<AdminRoute title="Hồ sơ hợp đồng"><ContractFilesPage /></AdminRoute>} />
      <Route path="/admin/utility-rates" element={<AdminRoute title="Đơn giá dịch vụ"><UtilityRatesPage /></AdminRoute>} />
      <Route path="/admin/meter-readings" element={<AdminRoute title="Chỉ số điện nước"><MeterReadingsPage /></AdminRoute>} />
      <Route path="/admin/payments" element={<AdminRoute title="Lịch sử thanh toán"><PaymentsPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute title="Quản lý tài khoản"><UsersPage /></AdminRoute>} />

      <Route path="/admin/invoices" element={<AdminRoute title="Hóa đơn"><InvoicesPage /></AdminRoute>} />
      <Route path="/admin/maintenance" element={<AdminRoute title="Báo hỏng"><MaintenanceRequestsPage /></AdminRoute>} />
      <Route path="/admin/maintenance-requests" element={<Navigate to="/admin/maintenance" replace />} />
      <Route path="/admin/profile" element={<AdminRoute title="Cá nhân"><AdminProfilePage /></AdminRoute>} />

      {/* Tenant Portal Routes */}
      <Route path="/tenant/dashboard" element={<Navigate to="/tenant/home" replace />} />
      <Route path="/tenant/home" element={<TenantRoute title="Trang chủ"><TenantDashboardPage /></TenantRoute>} />
      <Route path="/tenant/my-room" element={<TenantRoute title="Phòng của tôi"><MyRoomPage /></TenantRoute>} />
      <Route path="/tenant/bills" element={<TenantRoute title="Hóa đơn"><MyInvoicesPage /></TenantRoute>} />
      <Route path="/tenant/my-invoices" element={<Navigate to="/tenant/bills" replace />} />
      <Route path="/tenant/payments" element={<TenantRoute title="Thanh toán"><MyPaymentsPage /></TenantRoute>} />
      <Route path="/tenant/my-payments" element={<Navigate to="/tenant/payments" replace />} />
      <Route path="/tenant/maintenance" element={<TenantRoute title="Báo hỏng"><MyMaintenancePage /></TenantRoute>} />
      <Route path="/tenant/my-maintenance" element={<Navigate to="/tenant/maintenance" replace />} />
      <Route path="/tenant/contracts" element={<TenantRoute title="Hợp đồng của tôi"><MyContractsPage /></TenantRoute>} />
      <Route path="/tenant/my-contracts" element={<Navigate to="/tenant/contracts" replace />} />
      <Route path="/tenant/profile" element={<TenantRoute title="Thông tin cá nhân"><TenantProfilePage /></TenantRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
