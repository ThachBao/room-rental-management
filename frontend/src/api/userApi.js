import { httpClient } from './httpClient';

export const userApi = {
  getAll: () => httpClient.get('/api/users'),
  getById: (id) => httpClient.get(`/api/users/${id}`),
  create: (data) => httpClient.post('/api/users', data),
  update: (id, data) => httpClient.put(`/api/users/${id}`, data),
  delete: (id) => httpClient.delete(`/api/users/${id}`),
  toggleStatus: (id) => httpClient.put(`/api/users/${id}/toggle-status`),
  login: (phone, password) => httpClient.post('/api/users/login', { phone, password }),
};
