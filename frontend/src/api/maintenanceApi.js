import { httpClient } from './httpClient';

export const maintenanceApi = {
  getAll: (filters) => {
    let url = '/api/maintenance-requests';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.roomId) params.append('roomId', filters.roomId);
      if (filters.rentalId) params.append('rentalId', filters.rentalId);
      if (filters.tenantId) params.append('tenantId', filters.tenantId);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;
    }
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/maintenance-requests/${id}`),
  create: (data) => httpClient.post('/api/maintenance-requests', data),
  update: (id, data) => httpClient.put(`/api/maintenance-requests/${id}`, data),
  updateStatus: (id, data) => httpClient.put(`/api/maintenance-requests/${id}/status`, data),
  resolve: (id, data) => httpClient.put(`/api/maintenance-requests/${id}/resolve`, data),
};
