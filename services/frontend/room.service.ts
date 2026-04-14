import { apiClient } from './api.client';

export const RoomService = {
    getAll: async () => {
        try {
            const response = await apiClient.get('/room/list');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
};
