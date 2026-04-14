'use client'

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const adminApi = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // ensures cookies are sent with every request
});

// Activity Logs
export const getActivityLogs = async () => {
    const response = await adminApi.get('/activity-log/list');
    return response.data;
};

// Notifications
export const getNotifications = async () => {
    const response = await adminApi.get('/notifications/list');
    return response.data;
};

export const markNotificationRead = async (id: string) => {
    const response = await adminApi.put(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsRead = async () => {
    const response = await adminApi.put('/notifications/read-all');
    return response.data;
};

// Handle 401 responses — auto logout
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);
