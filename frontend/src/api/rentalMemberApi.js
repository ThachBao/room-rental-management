import { httpClient } from './httpClient';

export const rentalMemberApi = {
  getAll: (rentalId) => {
    const url = rentalId ? `/api/rental-members?rentalId=${rentalId}` : '/api/rental-members';
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/rental-members/${id}`),
  create: (data) => httpClient.post('/api/rental-members', data),
  update: (id, data) => httpClient.put(`/api/rental-members/${id}`, data),
  moveOut: (id, data) => httpClient.put(`/api/rental-members/${id}/move-out`, data),
};
