import { httpClient } from './httpClient';

export const roomApi = {
  getAll: (status) => {
    const url = status ? `/api/rooms?status=${status}` : '/api/rooms';
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/rooms/${id}`),
  create: (data) => httpClient.post('/api/rooms', data),
  update: (id, data) => httpClient.put(`/api/rooms/${id}`, data),
  delete: (id) => httpClient.delete(`/api/rooms/${id}`),
};
