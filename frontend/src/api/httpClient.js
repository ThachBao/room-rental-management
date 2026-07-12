const handleResponse = async (response) => {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    localStorage.removeItem('demoTenantId');
    localStorage.removeItem('demoTenantName');
    
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/login';
    } else if (window.location.pathname.startsWith('/tenant')) {
      window.location.href = '/tenant/login';
    } else {
      window.location.href = '/';
    }
    return null;
  }

  if (!response.ok) {
    let errorMessage = `Yêu cầu thất bại với mã trạng thái ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.message) {
        errorMessage = data.message;
      }
    } catch (e) {
      // response might not be json
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return await response.json();
};

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const getFullUrl = (url) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  let baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    if (import.meta.env.DEV) {
      baseUrl = '';
    } else {
      baseUrl = 'https://room-rental-management-hnu4.onrender.com';
    }
  }
  if (!baseUrl) return url;
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanUrl}`;
};

export const httpClient = {
  get: async (url) => {
    try {
      const response = await fetch(getFullUrl(url), {
        headers: getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  post: async (url, body) => {
    try {
      const response = await fetch(getFullUrl(url), {
        method: 'POST',
        headers: getHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  put: async (url, body) => {
    try {
      const response = await fetch(getFullUrl(url), {
        method: 'PUT',
        headers: getHeaders({
          'Content-Type': 'application/json',
        }),
        body: body ? JSON.stringify(body) : undefined,
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  delete: async (url) => {
    try {
      const response = await fetch(getFullUrl(url), {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  upload: async (url, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(getFullUrl(url), {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
};
