import api from '../../../core/services/api.service';
import type {
    FacebookAppConfig,
    FacebookPage,
    SocialPost,
    CreatePostRequest,
    ConnectPageRequest,
    UpdateAppConfigRequest,
    AutomationWorkflow,
    WorkflowRequest
} from '../types';

const BASE_URL = '/v1/multichannel';

export const facebookService = {
    getAppConfig: async (): Promise<FacebookAppConfig> => {
        const response = await api.get(`${BASE_URL}/app-config`);
        return response.data;
    },

    updateAppConfig: async (data: UpdateAppConfigRequest) => {
        return await api.post(`${BASE_URL}/app-config`, data);
    },

    getPages: async (): Promise<FacebookPage[]> => {
        const response = await api.get(`${BASE_URL}/pages`);
        return response.data;
    },

    connectPage: async (data: ConnectPageRequest) => {
        return await api.post(`${BASE_URL}/connect-page`, data);
    },

    disconnectPage: async (pageId: number) => {
        return await api.post(`${BASE_URL}/disconnect-page/${pageId}`);
    },

    createPost: async (data: CreatePostRequest): Promise<SocialPost> => {
        const response = await api.post(`${BASE_URL}/post`, data);
        return response.data;
    },

    getInsights: async (pageId: number, metric = 'impressions') => {
        const response = await api.get(`${BASE_URL}/insights/${pageId}?metric=${metric}`);
        return response.data;
    },

    // Automation
    createWorkflow: async (data: WorkflowRequest): Promise<AutomationWorkflow> => {
        const response = await api.post(`${BASE_URL}/automation`, data);
        return response.data;
    },

    getWorkflows: async (): Promise<AutomationWorkflow[]> => {
        const response = await api.get(`${BASE_URL}/automation`);
        return response.data;
    },

    // OAuth Flow
    getOAuthUrl: async (redirectUri: string): Promise<{ url: string }> => {
        const response = await api.get(`${BASE_URL}/oauth-url?redirectUri=${encodeURIComponent(redirectUri)}`);
        return response.data;
    },

    handleOAuthCallback: async (code: string, redirectUri: string): Promise<{
        message: string;
        userAccessToken: string;
        pagesConnected: number;
        pages: Array<{ pageId: string; name: string; accessToken: string }>;
    }> => {
        const response = await api.post(`${BASE_URL}/oauth-callback`, { code, redirectUri });
        return response.data;
    },

    // Publish directly
    publishPost: async (pageId: number, message: string) => {
        const response = await api.post(`${BASE_URL}/publish`, { pageId, message });
        return response.data;
    }
};
