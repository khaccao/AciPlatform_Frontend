export interface Customer {
    id: number;
    code: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
    address?: string;
    provinceId?: string;
    districtId?: string;
    wardId?: string;
    gender?: number; // 0: Other, 1: Male, 2: Female
    provider?: string;
    providerId?: string;
    createdDate?: string;
    updatedDate?: string;
    isDeleted?: boolean;
}

export interface CustomerListItem {
    id: number;
    code: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    createdDate?: string;
}

export interface CustomersSearchParam {
    searchText?: string;
    code?: string;
    phone?: string;
    email?: string;
    page: number;
    pageSize: number;
}
