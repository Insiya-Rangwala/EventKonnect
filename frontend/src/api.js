import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL}`;

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const MEDIA_BASE_URL = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    : 'http://127.0.0.1:8000';

export default api;
