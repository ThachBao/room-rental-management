import { httpClient } from './httpClient';

export const uploadApi = {
  upload: (file) => httpClient.upload('/api/upload', file),
};
