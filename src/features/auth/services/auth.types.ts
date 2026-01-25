export interface AuthenticateModel {
    username: string;
    password?: string;
}

export interface AuthenticateResponse {
    status: number;
    message: string;
    data?: {
        id: number;
        username: string;
        fullname: string;
        avatar: string;
        token: string;
        roleName: string[];
        menus: any[];
        [key: string]: any;
    };
}
