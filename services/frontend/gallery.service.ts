import { apiClient } from './api.client';

export const GalleryService = {
    list: async () => {
        try {
            const response = await apiClient.get('/gallery/list');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch gallery:', error);
            return { success: false, images: [] };
        }
    }
};
