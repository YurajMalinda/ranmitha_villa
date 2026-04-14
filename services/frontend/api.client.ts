import axios from 'axios';

const API_Base = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
    baseURL: API_Base,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add interceptors here if needed in the future
