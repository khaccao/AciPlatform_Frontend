export interface Department {
    id: number;
    name: string;
    code?: string;
    parentId?: number;
    order?: number;
}

export interface DepartmentRequest {
    name: string;
    code?: string;
    parentId?: number;
    order?: number;
}

export interface PositionDetail {
    id: number;
    name: string;
    code?: string;
    departmentId?: number;
    note?: string;
    order?: number;
}

export interface PositionDetailRequest {
    name: string;
    code?: string;
    departmentId?: number;
    note?: string;
    order?: number;
}

export interface Degree {
    id: number;
    name: string;
    school?: string;
    description?: string;
    graduationYear?: number;
}

export interface DegreeRequest {
    userId: number;
    name: string;
    school?: string;
    description?: string;
    graduationYear?: number;
}

export interface Certificate {
    id: number;
    name: string;
    issuer?: string;
    issueDate?: string;
    expiryDate?: string;
    note?: string;
}

export interface CertificateRequest {
    userId: number;
    name: string;
    issuer?: string;
    issueDate?: string;
    expiryDate?: string;
    note?: string;
}

export interface Major {
    id: number;
    name: string;
    description?: string;
}

export interface MajorRequest {
    name: string;
    description?: string;
}

export interface Relative {
    id: number;
    userId: number;
    name: string;
    relationship: string;
    phone?: string;
    address?: string;
    note?: string;
}

export interface RelativeRequest {
    userId: number;
    name: string;
    relationship: string;
    phone?: string;
    address?: string;
    note?: string;
}

export interface HistoryAchievement {
    id: number;
    userId: number;
    title: string;
    description?: string;
    achievedDate?: string;
    note?: string;
}

export interface HistoryAchievementRequest {
    userId: number;
    title: string;
    description?: string;
    achievedDate?: string;
    note?: string;
}

export interface DecisionType {
    id: number;
    name: string;
    code?: string;
    note?: string;
}

export interface DecisionTypeRequest {
    name: string;
    code?: string;
    note?: string;
}

export interface Decide {
    id: number;
    userId: number;
    decisionTypeId: number;
    title: string;
    description?: string;
    effectiveDate?: string;
    expiredDate?: string;
    fileUrl?: string;
    note?: string;
}

export interface DecideRequest {
    userId: number;
    decisionTypeId: number;
    title: string;
    description?: string;
    effectiveDate?: string;
    expiredDate?: string;
    fileUrl?: string;
    note?: string;
}

export interface Allowance {
    id: number;
    name: string;
    code?: string;
    amount: number;
    description?: string;
}

export interface AllowanceRequest {
    name: string;
    code?: string;
    amount: number;
    description?: string;
}

export interface AllowanceUser {
    id: number;
    allowanceId: number;
    userId: number;
    startDate?: string;
    endDate?: string;
    amountOverride?: number;
    note?: string;
}

export interface AllowanceUserRequest {
    allowanceId: number;
    userId: number;
    startDate?: string;
    endDate?: string;
    amountOverride?: number;
    note?: string;
}

export interface SalaryType {
    id: number;
    name: string;
    code?: string;
    baseAmount: number;
    formula?: string;
    note?: string;
}

export interface SalaryTypeRequest {
    name: string;
    code?: string;
    baseAmount: number;
    formula?: string;
    note?: string;
}

export interface ContractType {
    id: number;
    name: string;
    code?: string;
    description?: string;
    durationMonths?: number;
}

export interface ContractTypeRequest {
    name: string;
    code?: string;
    description?: string;
    durationMonths?: number;
}

export interface ContractFile {
    id: number;
    name: string;
    fileUrl?: string;
    contractTypeId?: number;
    note?: string;
}

export interface ContractFileRequest {
    name: string;
    fileUrl?: string;
    contractTypeId?: number;
    note?: string;
}

export interface UserContractHistory {
    id: number;
    userId: number;
    contractTypeId: number;
    signedDate?: string;
    startDate?: string;
    endDate?: string;
    fileUrl?: string;
    note?: string;
}

export interface UserContractHistoryRequest {
    userId: number;
    contractTypeId: number;
    signedDate?: string;
    startDate?: string;
    endDate?: string;
    fileUrl?: string;
    note?: string;
}

export interface TimeKeepingEntry {
    id: number;
    userId: number;
    workDate: string;
    checkIn?: string;
    checkOut?: string;
    workingHours?: number;
    note?: string;
}

export interface TimeKeepingEntryRequest {
    userId: number;
    workDate: string;
    checkIn?: string;
    checkOut?: string;
    workingHours?: number;
    note?: string;
}

export interface User {
    id: number;
    username: string;
    fullName?: string;
    email?: string;
    phone?: string;
    createdDate?: string;
    status: number;
    userRoleIds?: string;
    departmentId?: number;
    positionDetailId?: number;
    gender?: number;
    birthDay?: string;
    address?: string;
    images?: string;
    avatar?: string;
    departmentName?: string;
    positionName?: string;
}

export interface UserRequest {
    username: string;
    password?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    userRoleIds?: string;
    departmentId?: number;
    positionDetailId?: number;
    gender?: number;
    birthDay?: string;
    address?: string;
}

export interface UserViewModel {
    page?: number;
    pageSize?: number;
    searchText?: string;
    birthday?: string;
    gender?: number;
    positionId?: number;
    departmentId?: number;
    requestPassword?: boolean;
    quit?: boolean;
    startDate?: string;
    endDate?: string;
}
