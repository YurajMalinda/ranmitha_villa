import { apiClient } from './api.client';

export const CurrencyService = {
    getRates: async () => {
        try {
            const response = await apiClient.get('/currency/rates');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
};
