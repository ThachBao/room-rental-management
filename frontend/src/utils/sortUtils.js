/**
 * Sắp xếp danh sách dữ liệu phía Client.
 * Hỗ trợ sắp xếp chuỗi tiếng Việt chuẩn xác, sắp xếp số phòng thông minh, và các kiểu dữ liệu khác.
 * 
 * @param {Array} dataList - Danh sách cần sắp xếp
 * @param {string} sortBy - Thuộc tính dùng để sắp xếp
 * @param {string} sortDirection - Chiều sắp xếp ('asc' hoặc 'desc')
 * @returns {Array} Danh sách đã được sắp xếp mới
 */
export const sortData = (dataList, sortBy, sortDirection) => {
  if (!dataList || dataList.length === 0) return [];
  
  return [...dataList].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Sắp xếp số phòng thông minh (natural sort) cho các giá trị như P01, P10, P2
    if (sortBy === 'roomNumber') {
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' })
        : bStr.localeCompare(aStr, undefined, { numeric: true, sensitivity: 'base' });
    }

    // Đẩy các giá trị rỗng/null/undefined xuống cuối danh sách
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    // So sánh chuỗi tiếng Việt
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal, 'vi', { sensitivity: 'accent' })
        : bVal.localeCompare(aVal, 'vi', { sensitivity: 'accent' });
    }

    // So sánh số, ngày tháng hoặc boolean
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};
