import { apiClient } from './api.client';

export const TourService = {
    listTours: async () => {
        try {
            const response = await apiClient.get('/tour/list');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch tours:", error);
            return { success: false, tours: [] };
        }
    }
};
