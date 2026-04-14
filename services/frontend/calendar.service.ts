import { apiClient } from './api.client';

export const CalendarService = {
    listBlockedDates: async () => {
        try {
            const response = await apiClient.get('/block/list');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch blocked dates:", error);
            return { success: false, blockedDates: [] };
        }
    }
};
