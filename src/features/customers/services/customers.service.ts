import api from '../../../core/services/api.service';
import type { Customer, CustomersSearchParam } from '../customers.types';

export const customersService = {
    getAll: (params: CustomersSearchParam) => 
        api.get('/customers', { params }).then(res => res.data),
    
    getById: (id: number) => 
        api.get(`/customers/${id}`).then(res => res.data),
    
    create: (data: Partial<Customer>) => 
        api.post('/customers', data).then(res => res.data),
    
    update: (id: number, data: Partial<Customer>) => 
        api.put(`/customers/${id}`, data).then(res => res.data),
    
    delete: (id: number) => 
        api.delete(`/customers/${id}`).then(res => res.data),
    
    getSelectList: (searchText?: string) => 
        api.get('/customers/list', { params: { searchText } }).then(res => res.data),
    
    getCode: () => 
        api.get('/customers/get-code-customer').then(res => res.data)
};
