import api from '../../../core/services/api.service';

export interface Role {
    id: number;
    code: string;
    title: string;
    note?: string;
    order?: number;
    isNotAllowDelete?: boolean;
    companyCode?: string;
    parentId?: number;
}

export interface MenuRole {
    id: number;
    menuId: number;
    userRoleId: number;
    menuCode: string;
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
}

export interface Menu {
    id: number;
    code: string;
    name: string;
    nameEN?: string;
    nameKO?: string;
    codeParent?: string;
    isParent?: boolean;
    order: number;
}

export const systemService = {
    // Role CRUD
    getRoles: async (companyCode?: string) => {
        const response = await api.get('/UserRoles/list', { params: { companyCode } });
        return response.data.data || response.data.Data || [];
    },
    createRole: async (role: Partial<Role>) => {
        const response = await api.post('/UserRoles', role);
        return response.data;
    },
    updateRole: async (id: number, role: Partial<Role>) => {
        const response = await api.put(`/UserRoles/${id}`, role);
        return response.data;
    },
    deleteRole: async (id: number) => {
        const response = await api.delete(`/UserRoles/${id}`);
        return response.data;
    },

    // Menus
    getAllMenus: async () => {
        const response = await api.get('/Menus/list');
        return response.data.data || response.data.Data || [];
    },

    // Role Permissions
    getRolePermissions: async (roleId: number) => {
        const response = await api.get(`/MenuRoles/role/${roleId}`);
        return response.data;
    },
    updateRolePermissions: async (roleId: number, permissions: Partial<MenuRole>[]) => {
        const response = await api.post(`/MenuRoles/role/${roleId}`, permissions);
        return response.data;
    },

    // Menu CRUD
    createMenu: async (menu: Partial<Menu>) => {
        const response = await api.post('/Menus', menu);
        return response.data;
    },
    updateMenu: async (id: number, menu: Partial<Menu>) => {
        const response = await api.put(`/Menus/${id}`, menu);
        return response.data;
    },
    deleteMenu: async (id: number) => {
        const response = await api.delete(`/Menus/${id}`);
        return response.data;
    }
};
