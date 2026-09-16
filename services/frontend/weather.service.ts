import { apiClient } from './api.client';

export const WeatherService = {
    getCurrent: async () => {
        try {
            const response = await apiClient.get('/weather');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
};
