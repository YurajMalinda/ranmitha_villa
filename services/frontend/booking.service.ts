import { apiClient } from './api.client';
import { BookingPayload, ConfirmationPayload } from '@/types/api';

export const BookingService = {
    checkAvailability: async (payload: BookingPayload) => {
        try {
            const response = await apiClient.post('/booking/temporary', payload);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    searchRooms: async (checkIn: string, checkOut: string, guests: number) => {
        try {
            const response = await apiClient.post('/booking/search', {
                check_in_date: checkIn,
                check_out_date: checkOut,
                guests
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    releaseTemporary: async (bookingId: string, holdToken: string) => {
        try {
            const response = await apiClient.post('/booking/release', { bookingId, holdToken });
            return response.data;
        } catch {
            // fire-and-forget — don't surface this error to the user
        }
    },

    confirmBooking: async (payload: ConfirmationPayload) => {
        try {
            const response = await apiClient.post('/booking/confirm', payload);
            return response.data;
        } catch (error) {
            console.error("Booking confirmation failed:", error);
            throw error;
        }
    }
};
