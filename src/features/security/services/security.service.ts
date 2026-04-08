import api from '../../../core/services/api.service';

export interface SecurityUser {
    id: number;
    username: string;
    fullName: string;
    email: string;
    twoFactorEnabled: boolean;
    hasSecret: boolean;
}

export interface TwoFactorSetupResponse {
    success: boolean;
    message?: string;
    secretKey?: string;
    qrCodeImageUrl?: string;
    recoveryCodes?: string[];
}

export const securityService = {
    getUsers: async (): Promise<SecurityUser[]> => {
        const response = await api.get('/Security/users');
        return response.data;
    },

    enable2FA: async (userId: number): Promise<TwoFactorSetupResponse> => {
        const response = await api.post(`/Security/enable-2fa/${userId}`);
        return response.data;
    },

    confirm2FA: async (userId: number, code: string): Promise<boolean> => {
        const response = await api.post(`/Security/confirm-2fa/${userId}`, { code });
        return response.data;
    },

    disable2FA: async (userId: number): Promise<boolean> => {
        const response = await api.post(`/Security/disable-2fa/${userId}`);
        return response.data;
    },

    getSetup2FA: async (userId: number): Promise<TwoFactorSetupResponse> => {
        const response = await api.get(`/Security/setup-2fa/${userId}`);
        return response.data;
    }
};
