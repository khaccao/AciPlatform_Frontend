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
    type TimeKeepingEntry, type TimeKeepingEntryRequest,
    type UserRequest, type UserViewModel, type Company
} from '../hr.types';

// Generic CRUD Service Factory (Internal use)
const createCrudService = <T, R>(endpoint: string) => ({
    getAll: () => api.get<T[]>(`/${endpoint}`).then(res => res.data),
    getByUser: (userId: number) => api.get<T[]>(`/${endpoint}/user/${userId}`).then(res => res.data),
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
    // Timekeeping
    timekeeping: {
        ...createCrudService<TimeKeepingEntry, TimeKeepingEntryRequest>('TimeKeeping'),
        processFaceAttendance: (data: { userId: number, capturedImage: string, note?: string }) => 
            api.post('/TimeKeeping/face-attendance', data).then(res => res.data)
    },
    companies: createCrudService<Company, any>('Companies'),
    getCompanies: () => api.get<Company[]>('/Companies').then(res => res.data)
};

export const userService = {
    getAll: (params: UserViewModel) => api.get<any>('/users', { params }).then(res => {
        const rawData = res.data.data || res.data.Data || [];
        const normalizedData = rawData.map((item: any) => ({
            ...item,
            id: item.id ?? item.Id,
            username: item.username ?? item.Username,
            fullName: item.fullName ?? item.FullName,
            email: item.email ?? item.Email,
            phone: item.phone ?? item.Phone,
            departmentId: item.departmentId ?? item.DepartmentId,
            positionDetailId: item.positionDetailId ?? item.PositionDetailId,
            gender: item.gender ?? item.Gender,
            birthDay: item.birthDay ?? item.BirthDay,
            address: item.address ?? item.Address,
            status: item.status ?? item.Status,
            createdDate: item.createdDate ?? item.CreatedDate,
            departmentName: item.departmentName ?? item.DepartmentName,
            positionName: item.positionName ?? item.PositionName,
            userRoleIds: item.userRoleIds ?? item.UserRoleIds,
            companyCode: item.companyCode ?? item.CompanyCode,
            faceImage: item.faceImage ?? item.FaceImage
        }));

        return {
            data: normalizedData,
            totalItems: res.data.totalItems ?? res.data.TotalItems ?? 0
        };
    }),
    create: (data: UserRequest) => api.post<{ message: string, userId: number }>('/users', data).then(res => res.data),
    update: (id: number, data: UserRequest) => api.put<{ message: string }>(`/users/${id}`, data).then(res => res.data),
    delete: (id: number) => api.delete<{ message: string }>(`/users/${id}`).then(res => res.data),
    updateFaceImage: (userId: number, image: string) => api.put(`/users/${userId}/face-image`, { image }).then(res => res.data),
    getAllActive: () => api.get<any>('/users/getAllUserActive').then(res => ({
        data: res.data.data || res.data.Data || []
    })),
    getAllNotRole: () => api.get<any>('/users/user-not-roles').then(res => ({
        data: res.data.data || res.data.Data || []
    })),
    resetPassword: (ids: number[]) => api.post('/users/resetPassword', ids).then(res => res.data),
    getRoles: () => api.get<any>('/UserRoles/list').then(res => res.data)
};
