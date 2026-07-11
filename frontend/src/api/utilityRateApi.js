import { httpClient } from './httpClient';

export const utilityRateApi = {
  getAll: (rentalId) => {
    const url = rentalId ? `/api/rental-utility-rates?rentalId=${rentalId}` : '/api/rental-utility-rates';
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/rental-utility-rates/${id}`),
  create: (data) => httpClient.post('/api/rental-utility-rates', data),
  update: (id, data) => httpClient.put(`/api/rental-utility-rates/${id}`, data),
};
