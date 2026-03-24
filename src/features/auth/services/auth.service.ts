import api from '../../../core/services/api.service';
import type { AuthenticateModel, AuthenticateResponse } from './auth.types';

export const authService = {
    login: async (data: AuthenticateModel): Promise<AuthenticateResponse> => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    register: async (data: any) => {
        const response = await api.post('/Auth/register', data);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    requestForgotPass: async (username: string) => {
        const response = await api.post('/Auth/requestForgotPass', { username });
        return response.data;
    }
};
