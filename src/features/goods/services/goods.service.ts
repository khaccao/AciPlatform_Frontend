import api from '../../../core/services/api.service';
import type { GoodsSearchParam } from '../goods.types';

export const goodsService = {
    getAll: (params: GoodsSearchParam) => 
        api.get('/goods', { params }).then(res => res.data),
    
    getById: (id: number) => 
        api.get(`/goods/${id}`).then(res => res.data),
    
    getSelectList: () => 
        api.get('/goods/list').then(res => res.data),
    
    syncAccountGood: () => 
        api.get('/goods/SyncAccountGood').then(res => res.data)
};
