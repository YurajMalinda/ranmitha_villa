import { apiClient } from './api.client';

export const TestimonialService = {
    list: async () => {
        try {
            const response = await apiClient.get('/testimonial/list');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
            return { success: false, testimonials: [] };
        }
    }
};
