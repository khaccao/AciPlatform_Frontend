import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Multi-tenant support
        const dbName = localStorage.getItem('dbName');
        if (dbName) {
            config.headers['dbName'] = dbName;
        }

        const selectedCompanyCode = localStorage.getItem('selectedCompanyCode') || localStorage.getItem('selectedHotelCode') || dbName;
        if (selectedCompanyCode) {
            config.headers['CompanyCode'] = selectedCompanyCode;
            config.headers['companyCode'] = selectedCompanyCode;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
