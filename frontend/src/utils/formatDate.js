export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  
  // Tránh lệch múi giờ: Nếu là định dạng YYYY-MM-DD, tách chuỗi trực tiếp
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  }
  
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`;
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateStr;
  }
};

export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-';
  try {
    let datePart = '';
    let timePart = '';
    if (dateTimeStr.includes('T')) {
      [datePart, timePart] = dateTimeStr.split('T');
    } else if (dateTimeStr.includes(' ')) {
      [datePart, timePart] = dateTimeStr.split(' ');
    }
    
    if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split('-');
      const timeClean = timePart ? timePart.substring(0, 8) : '00:00:00';
      return `${day}-${month}-${year} ${timeClean}`;
    }

    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return dateTimeStr;
  }
};

export const toLocalDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().substring(0, 10);
};

export const toLocalISOString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().substring(0, 16);
};

