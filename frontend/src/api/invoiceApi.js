import { httpClient } from './httpClient';

export const invoiceApi = {
  getAll: (filters) => {
    let url = '/api/invoices';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.rentalId) params.append('rentalId', filters.rentalId);
      if (filters.roomId) params.append('roomId', filters.roomId);
      if (filters.billingMonth) params.append('billingMonth', filters.billingMonth);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;
    }
    return httpClient.get(url);
  },
  getById: (id) => httpClient.get(`/api/invoices/${id}`),
  generate: (data) => httpClient.post('/api/invoices', data),
  update: (id, data) => httpClient.put(`/api/invoices/${id}`, data),
  markOverdue: (id) => httpClient.put(`/api/invoices/${id}/mark-overdue`),
  confirmPayment: (id, receiptImageUrl) => httpClient.put(`/api/invoices/${id}/confirm-payment?receiptImageUrl=${encodeURIComponent(receiptImageUrl)}`),
  approvePayment: (id) => httpClient.put(`/api/invoices/${id}/approve-payment`),
  delete: (id) => httpClient.delete(`/api/invoices/${id}`),
};
