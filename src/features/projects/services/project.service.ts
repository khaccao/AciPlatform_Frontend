import api from "../../../core/services/api.service";
import type { CreateProjectRequest, CreateTaskRequest, Project, ProjectTask } from "../types/project.types";

const ProjectService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get('/Projects');
        return response.data;
    },

    getById: async (id: number): Promise<Project> => {
        const response = await api.get(`/Projects/${id}`);
        return response.data;
    },

    create: async (data: CreateProjectRequest): Promise<Project> => {
        const response = await api.post('/Projects', data);
        return response.data;
    },

    update: async (id: number, data: CreateProjectRequest): Promise<void> => {
        await api.put(`/Projects/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Projects/${id}`);
    },

    updateStatus: async (id: number, status: string): Promise<void> => {
        await api.patch(`/Projects/${id}/status`, `"${status}"`, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    getTasks: async (projectId: number): Promise<ProjectTask[]> => {
        const response = await api.get(`/Projects/${projectId}/tasks`);
        return response.data;
    },

    createTask: async (data: CreateTaskRequest): Promise<ProjectTask> => {
        const response = await api.post('/Projects/tasks', data);
        return response.data;
    },

    updateTask: async (taskId: number, data: CreateTaskRequest): Promise<void> => {
        await api.put(`/Projects/tasks/${taskId}`, data);
    },

    deleteTask: async (taskId: number): Promise<void> => {
        await api.delete(`/Projects/tasks/${taskId}`);
    },

    updateTaskProgress: async (taskId: number, progress: number, status: string): Promise<void> => {
        await api.patch(`/Projects/tasks/${taskId}/progress`, null, {
            params: { progress, status }
        });
    },

    getMembers: async (projectId: number): Promise<any[]> => {
        const response = await api.get(`/Projects/${projectId}/members`);
        return response.data;
    },

    addMember: async (projectId: number, userId: number, role: string): Promise<void> => {
        await api.post(`/Projects/${projectId}/members`, null, {
            params: { userId, role }
        });
    },

    removeMember: async (projectId: number, userId: number): Promise<void> => {
        await api.delete(`/Projects/${projectId}/members/${userId}`);
    },

    updateMemberStatus: async (projectId: number, userId: number, status: string): Promise<void> => {
        await api.patch(`/Projects/${projectId}/members/${userId}/status`, `"${status}"`, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    getMyTasks: async (): Promise<ProjectTask[]> => {
        const response = await api.get('/Projects/my-tasks');
        return response.data;
    }
};

export default ProjectService;
