import { httpClient } from './httpClient';

export const tenantApi = {
  getAll: (keyword) => {
    const url = keyword ? `/api/tenants?keyword=${encodeURIComponent(keyword)}` : '/api/tenants';
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/tenants/${id}`),
  create: (data) => httpClient.post('/api/tenants', data),
  update: (id, data) => httpClient.put(`/api/tenants/${id}`, data),
  delete: (id) => httpClient.delete(`/api/tenants/${id}`),
};
