// Bản dịch & Định dạng nhãn trạng thái hệ thống Quản lý nhà trọ sang Tiếng Việt

export const formatRoomStatus = (status) => {
  switch (status) {
    case 'AVAILABLE': return 'Còn trống';
    case 'OCCUPIED': return 'Đang thuê';
    case 'MAINTENANCE': return 'Đang bảo trì';
    case 'INACTIVE': return 'Ngưng sử dụng';
    default: return status || 'Không rõ';
  }
};

export const formatRentalStatus = (status) => {
  switch (status) {
    case 'ACTIVE': return 'Đang hiệu lực';
    case 'EXPIRED': return 'Hết hạn';
    case 'TERMINATED': return 'Đã kết thúc';
    default: return status || 'Không rõ';
  }
};

export const formatInvoiceStatus = (status) => {
  switch (status) {
    case 'UNPAID': return 'Chưa thanh toán';
    case 'PAID': return 'Đã thanh toán';
    case 'OVERDUE': return 'Quá hạn';
    default: return status || 'Không rõ';
  }
};

export const formatMaintenanceStatus = (status) => {
  switch (status) {
    case 'PENDING': return 'Chờ xử lý';
    case 'IN_PROGRESS': return 'Đang xử lý';
    case 'DONE': return 'Đã hoàn tất';
    default: return status || 'Không rõ';
  }
};

export const formatMaintenancePriority = (priority) => {
  switch (priority) {
    case 'LOW': return 'Thấp';
    case 'MEDIUM': return 'Trung bình';
    case 'HIGH': return 'Cao';
    default: return priority || 'Bình thường';
  }
};

export const formatPaymentMethod = (method) => {
  switch (method) {
    case 'CASH': return 'Tiền mặt';
    case 'BANK_TRANSFER': return 'Chuyển khoản';
    case 'MOMO': return 'Ví MoMo';
    case 'ZALOPAY': return 'Ví ZaloPay';
    case 'OTHER': return 'Khác';
    default: return method || 'Khác';
  }
};
