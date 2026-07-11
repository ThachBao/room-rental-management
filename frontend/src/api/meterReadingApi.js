import { httpClient } from './httpClient';

export const meterReadingApi = {
  getAll: (filters) => {
    let url = '/api/meter-readings';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.rentalId) params.append('rentalId', filters.rentalId);
      if (filters.roomId) params.append('roomId', filters.roomId);
      if (filters.billingMonth) params.append('billingMonth', filters.billingMonth);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;
    }
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/meter-readings/${id}`),
  create: (data) => httpClient.post('/api/meter-readings', data),
  update: (id, data) => httpClient.put(`/api/meter-readings/${id}`, data),
};
