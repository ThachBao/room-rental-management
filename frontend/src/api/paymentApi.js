import { httpClient } from './httpClient';

export const paymentApi = {
  getAll: (filters) => {
    let url = '/api/payments';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.invoiceId) params.append('invoiceId', filters.invoiceId);
      if (filters.receivedByUserId) params.append('receivedByUserId', filters.receivedByUserId);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;
    }
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/payments/${id}`),
  create: (data) => httpClient.post('/api/payments', data),
};
