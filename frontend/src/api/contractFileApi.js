import { httpClient } from './httpClient';

export const contractFileApi = {
  getAll: (rentalId) => {
    const url = rentalId ? `/api/contract-files?rentalId=${rentalId}` : '/api/contract-files';
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/contract-files/${id}`),
  create: (data) => httpClient.post('/api/contract-files', data),
  update: (id, data) => httpClient.put(`/api/contract-files/${id}`, data),
  delete: (id) => httpClient.delete(`/api/contract-files/${id}`),
};
