import React from 'react';
import Badge from './Badge';

const STATUS_MAP = {
  // Room
  AVAILABLE: { label: 'Còn trống', variant: 'success' },
  OCCUPIED: { label: 'Đang thuê', variant: 'primary' },
  MAINTENANCE: { label: 'Bảo trì', variant: 'warning' },
  INACTIVE: { label: 'Ngưng dùng', variant: 'secondary' },

  // Rental
  ACTIVE: { label: 'Đang hiệu lực', variant: 'success' },
  EXPIRED: { label: 'Hết hạn', variant: 'warning' },
  TERMINATED: { label: 'Đã kết thúc', variant: 'secondary' },

  // Invoice
  UNPAID: { label: 'Chưa thanh toán', variant: 'danger' },
  PAID: { label: 'Đã thanh toán', variant: 'success' },
  OVERDUE: { label: 'Quá hạn', variant: 'danger' },

  // Maintenance
  PENDING: { label: 'Chờ xử lý', variant: 'warning' },
  IN_PROGRESS: { label: 'Đang xử lý', variant: 'primary' },
  DONE: { label: 'Đã hoàn tất', variant: 'success' },

  // Priority
  LOW: { label: 'Thấp', variant: 'secondary' },
  MEDIUM: { label: 'Trung bình', variant: 'warning' },
  HIGH: { label: 'Cao', variant: 'danger' },
};

export default function StatusBadge({ status }) {
  const item = STATUS_MAP[status] || { label: status || '', variant: 'secondary' };
  return <Badge label={item.label} variant={item.variant} />;
}
