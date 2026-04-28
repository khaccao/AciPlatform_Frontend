export interface Project {
    id: number;
    code: string;
    name: string;
    description: string;
    status: 'Planned' | 'Ongoing' | 'Completed' | 'Suspended';
    startDate: string;
    endDate: string;
    budget: number;
    progress: number;
    createdAt: string;
}

export interface ProjectTask {
    id: number;
    projectId: number;
    name: string;
    description: string;
    assignedToUserId?: number;
    assignedToFullName?: string;
    status: 'Todo' | 'InProgress' | 'Review' | 'Done';
    weight: number;
    progress: number;
    dueDate?: string;
}

export interface CreateProjectRequest {
    code: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
}

export interface CreateTaskRequest {
    projectId: number;
    name: string;
    description?: string;
    assignedToUserId?: number;
    weight: number;
    dueDate?: string;
}
