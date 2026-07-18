import { apiRequest } from '../utils/apiRequest';

const API_URL = 'http://127.0.0.1:8000/api';

export const homepageService = {
  getSettings: async () => {
    return apiRequest(`${API_URL}/homepage-settings`);
  }
};
