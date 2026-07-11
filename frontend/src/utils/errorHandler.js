export const getErrorMessage = (error) => {
  if (!error) return 'Đã xảy ra lỗi không xác định.';
  if (error.message) {
    if (error.message.includes('Failed to fetch')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.';
    }
    return error.message;
  }
  if (typeof error === 'string') return error;
  return 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
};
