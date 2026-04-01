export interface FacebookAppConfig {
    id: number;
    appId: string;
    appSecret: string;
    isActive: boolean;
}

export interface FacebookPage {
    id: number;
    pageId: string;
    name: string;
    accessToken: string;
    userAccessToken: string;
    isActive: boolean;
    pictureUrl?: string;
}

export interface SocialPost {
    id: number;
    pageId: number;
    content: string;
    imageUrls?: string;
    scheduledTime?: string;
    isPosted: boolean;
    status: string;
    createdAt: string;
    errorMessage?: string;
}

export interface CreatePostRequest {
    pageId: number;
    content: string;
    imageUrls?: string;
    scheduledTime?: string;
    autoGenerateContent?: boolean;
    aiPrompt?: string;
}

export interface ConnectPageRequest {
    pageId: string;
    name: string;
    accessToken: string;
    userToken: string;
}

export interface UpdateAppConfigRequest {
    appId: string;
    appSecret: string;
}

export interface AutomationWorkflow {
    id: number;
    name: string;
    workflowJson: string;
    triggerType: string;
    isActive: boolean;
}

export interface WorkflowRequest {
    name: string;
    workflowJson: string;
    triggerType: string;
}
