import { httpClient } from './httpClient';

export const roomRentalApi = {
  getAll: (status) => {
    const url = status ? `/api/room-rentals?status=${status}` : '/api/room-rentals';
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/room-rentals/${id}`),
  create: (data) => httpClient.post('/api/room-rentals', data),
  update: (id, data) => httpClient.put(`/api/room-rentals/${id}`, data),
  terminate: (id, data) => httpClient.put(`/api/room-rentals/${id}/terminate`, data),
};
