import { httpClient } from './httpClient';

export const reportApi = {
  getDashboardOverview: () => httpClient.get('/api/reports/dashboard'),
  getMonthlyRevenue: (year) => httpClient.get(`/api/reports/revenue${year ? `?year=${year}` : ''}`),
};
