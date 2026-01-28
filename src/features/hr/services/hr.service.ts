import api from '../../../core/services/api.service';
import {
    type Department, type DepartmentRequest,
    type PositionDetail, type PositionDetailRequest,
    type Degree, type DegreeRequest,
    type Certificate, type CertificateRequest,
    type Major, type MajorRequest,
    type Relative, type RelativeRequest,
    type HistoryAchievement, type HistoryAchievementRequest,
    type DecisionType, type DecisionTypeRequest,
    type Decide, type DecideRequest,
    type Allowance, type AllowanceRequest,
    type AllowanceUser, type AllowanceUserRequest,
    type SalaryType, type SalaryTypeRequest,
    type ContractType, type ContractTypeRequest,
    type ContractFile, type ContractFileRequest,
    type UserContractHistory, type UserContractHistoryRequest,
    type TimeKeepingEntry, type TimeKeepingEntryRequest
} from '../hr.types';

// Generic CRUD Service Factory (Internal use)
const createCrudService = <T, R>(endpoint: string) => ({
    getAll: () => api.get<T[]>(`/${endpoint}`).then(res => res.data),
    getById: (id: number) => api.get<T>(`/${endpoint}/${id}`).then(res => res.data),
    create: (data: R) => api.post<T>(`/${endpoint}`, data).then(res => res.data),
    update: (id: number, data: R) => api.put(`/${endpoint}/${id}`, data),
    delete: (id: number) => api.delete(`/${endpoint}/${id}`)
});

export const hrService = {
    // HoSoNhanSu
    departments: createCrudService<Department, DepartmentRequest>('Departments'),
    positions: createCrudService<PositionDetail, PositionDetailRequest>('PositionDetails'),
    degrees: createCrudService<Degree, DegreeRequest>('Degrees'),
    certificates: createCrudService<Certificate, CertificateRequest>('Certificates'),
    majors: createCrudService<Major, MajorRequest>('Majors'),
    relatives: createCrudService<Relative, RelativeRequest>('Relatives'),
    achievements: createCrudService<HistoryAchievement, HistoryAchievementRequest>('HistoryAchievements'),
    decisionTypes: createCrudService<DecisionType, DecisionTypeRequest>('DecisionTypes'),
    decisions: createCrudService<Decide, DecideRequest>('Decides'),

    // Salary & Benefits
    allowances: createCrudService<Allowance, AllowanceRequest>('Allowances'),
    allowanceUsers: createCrudService<AllowanceUser, AllowanceUserRequest>('AllowanceUsers'),
    salaryTypes: createCrudService<SalaryType, SalaryTypeRequest>('SalaryTypes'),

    // Contracts
    contractTypes: createCrudService<ContractType, ContractTypeRequest>('ContractTypes'),
    contractFiles: createCrudService<ContractFile, ContractFileRequest>('ContractFiles'),
    contractHistories: createCrudService<UserContractHistory, UserContractHistoryRequest>('UserContractHistories'),

    // Timekeeping
    timekeeping: {
        ...createCrudService<TimeKeepingEntry, TimeKeepingEntryRequest>('TimeKeeping'),
        // Add specific timekeeping methods if needed
    }
};

export const userService = {
    getAll: (params: any) => api.get('/Users', { params }).then(res => res.data),
    getById: (id: number) => api.get(`/Users/${id}`).then(res => res.data),
    create: (data: any) => api.post('/Users', data).then(res => res.data),
    update: (id: number, data: any) => api.put(`/Users/${id}`, data).then(res => res.data),
    delete: (id: number) => api.delete(`/Users/${id}`).then(res => res.data),
    getAllActive: () => api.get('/Users/getAllUserActive').then(res => res.data),
    resetPassword: (ids: number[]) => api.post('/Users/resetPassword', ids).then(res => res.data)
};
