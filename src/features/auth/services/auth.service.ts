import api from '../../../core/services/api.service';
import type { AuthenticateModel, AuthenticateResponse, UsernameCheckResponse } from './auth.types';

export const authService = {
    checkUsername: async (username: string): Promise<UsernameCheckResponse> => {
        const response = await api.get(`/Auth/username-check?username=${username}`);
        return response.data;
    },

    login: async (data: AuthenticateModel): Promise<AuthenticateResponse> => {
        // When logging in, we might need to set the dbName header for this specific request
        // if it's not already in localStorage
        const response = await api.post('/Auth/login', data, {
            headers: {
                'dbName': data.companyCode
            }
        });
        return response.data;
    },

    register: async (data: any) => {
        const response = await api.post('/Auth/register', data);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('dbName');
    },

    requestForgotPass: async (username: string) => {
        const response = await api.post('/Auth/requestForgotPass', { username });
        return response.data;
    },

    refreshMenu: async () => {
        const response = await api.post('/Auth/refresh');
        return response.data;
    }
};
