import { apiClient } from './api.client';

export const AmenityService = {
    list: async () => {
        try {
            const response = await apiClient.get('/amenity/list');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch amenities:', error);
            return { success: false, amenities: [] };
        }
    }
};
