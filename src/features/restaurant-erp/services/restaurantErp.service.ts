import api from '../../../core/services/api.service';

const base = '/v1/restaurant-erp';

export type ErpStatus =
  | 'Draft'
  | 'Submitted'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Converted'
  | 'Completed'
  | 'PendingDisbursement'
  | 'Disbursed'
  | 'New'
  | 'Sent'
  | 'Confirmed'
  | 'PartiallyReceived'
  | 'FullyReceived'
  | 'Received'
  | 'Open'
  | 'Partial'
  | 'Closed'
  | 'Overdue'
  | 'BadDebt';

export interface ErpFilter {
  page?: number;
  pageSize?: number;
  searchText?: string;
  status?: string;
  companyCode?: string;
}

export interface Dashboard {
  totalCommittedCapital: number;
  totalContributedCapital: number;
  remainingCapitalToContribute: number;
  totalSetupExpense: number;
  totalDisbursed: number;
  cashBalance: number;
  bankBalance: number;
  totalFundBalance: number;
  supplierDebt: number;
  customerDebt: number;
  purchaseRequestsPending: number;
  paymentRequestsPending: number;
  approvedNotDisbursed: number;
  inventoryValue: number;
  lowStockMaterials: number;
}

class RestaurantErpService {
  async dashboard() {
    const res = await api.get<Dashboard>(`${base}/dashboard`);
    return res.data;
  }

  async list<T>(path: string, params?: ErpFilter) {
    const res = await api.get<T[]>(`${base}/${path}`, { params });
    return res.data;
  }

  async create<T>(path: string, data: unknown) {
    const res = await api.post<T>(`${base}/${path}`, data);
    return res.data;
  }

  async update<T>(path: string, id: number, data: unknown) {
    const res = await api.put<T>(`${base}/${path}/${id}`, data);
    return res.data;
  }

  async remove(path: string, id: number) {
    const res = await api.delete(`${base}/${path}/${id}`);
    return res.data;
  }

  async action(path: string, data: unknown = {}) {
    const res = await api.post(`${base}/${path}`, data);
    return res.data;
  }

  funds = () => this.list<any>('funds');
  createFund = (data: any) => this.create<any>('funds', data);
  updateFund = (id: number, data: any) => this.update<any>('funds', id, data);
  deleteFund = (id: number) => this.remove('funds', id);
  capitalContributions = () => this.list<any>('capital-contributions');
  createCapitalContribution = (data: any) => this.create<any>('capital-contributions', data);
  updateCapitalContribution = (id: number, data: any) => this.update<any>('capital-contributions', id, data);
  deleteCapitalContribution = (id: number) => this.remove('capital-contributions', id);
  setupExpenses = () => this.list<any>('setup-expenses');
  createSetupExpense = (data: any) => this.create<any>('setup-expenses', data);
  updateSetupExpense = (id: number, data: any) => this.update<any>('setup-expenses', id, data);
  deleteSetupExpense = (id: number) => this.remove('setup-expenses', id);
  materialGroups = () => this.list<any>('material-groups');
  createMaterialGroup = (data: any) => this.create<any>('material-groups', data);
  updateMaterialGroup = (id: number, data: any) => this.update<any>('material-groups', id, data);
  deleteMaterialGroup = (id: number) => this.remove('material-groups', id);
  materials = (params?: ErpFilter) => this.list<any>('materials', params);
  createMaterial = (data: any) => this.create<any>('materials', data);
  updateMaterial = (id: number, data: any) => this.update<any>('materials', id, data);
  deleteMaterial = (id: number) => this.remove('materials', id);
  purchaseRequests = (params?: ErpFilter) => this.list<any>('purchase-requests', params);
  createPurchaseRequest = (data: any) => this.create<any>('purchase-requests', data);
  updatePurchaseRequest = (id: number, data: any) => this.update<any>('purchase-requests', id, data);
  deletePurchaseRequest = (id: number) => this.remove('purchase-requests', id);
  submitPurchaseRequest = (id: number, note = '') => this.action(`purchase-requests/${id}/submit`, { note });
  approvePurchaseRequest = (id: number, note = '') => this.action(`purchase-requests/${id}/approve`, { note });
  rejectPurchaseRequest = (id: number, note = '') => this.action(`purchase-requests/${id}/reject`, { note });
  createPoFromRequest = (id: number, data: any) => this.action(`purchase-requests/${id}/to-po`, data);
  purchaseOrders = (params?: ErpFilter) => this.list<any>('purchase-orders', params);
  createPurchaseOrder = (data: any) => this.create<any>('purchase-orders', data);
  updatePurchaseOrder = (id: number, data: any) => this.update<any>('purchase-orders', id, data);
  deletePurchaseOrder = (id: number) => this.remove('purchase-orders', id);
  setPurchaseOrderStatus = (id: number, status: string) => this.action(`purchase-orders/${id}/status`, { status });
  goodsReceipts = (params?: ErpFilter) => this.list<any>('goods-receipts', params);
  createGoodsReceipt = (data: any) => this.create<any>('goods-receipts', data);
  updateGoodsReceipt = (id: number, data: any) => this.update<any>('goods-receipts', id, data);
  deleteGoodsReceipt = (id: number) => this.remove('goods-receipts', id);
  stockBalances = () => this.list<any>('stock-balances');
  paymentRequests = (params?: ErpFilter) => this.list<any>('payment-requests', params);
  createPaymentRequest = (data: any) => this.create<any>('payment-requests', data);
  updatePaymentRequest = (id: number, data: any) => this.update<any>('payment-requests', id, data);
  deletePaymentRequest = (id: number) => this.remove('payment-requests', id);
  submitPaymentRequest = (id: number, note = '') => this.action(`payment-requests/${id}/submit`, { note });
  approvePaymentRequest = (id: number, note = '') => this.action(`payment-requests/${id}/approve`, { note });
  rejectPaymentRequest = (id: number, note = '') => this.action(`payment-requests/${id}/reject`, { note });
  disburse = (id: number, data: any) => this.action(`payment-requests/${id}/disburse`, data);
  disbursements = () => this.list<any>('disbursements');
  updateDisbursement = (id: number, data: any) => this.update<any>('disbursements', id, data);
  deleteDisbursement = (id: number) => this.remove('disbursements', id);
  supplierDebts = (params?: ErpFilter) => this.list<any>('supplier-debts', params);
  createSupplierDebt = (data: any) => this.create<any>('supplier-debts', data);
  updateSupplierDebt = (id: number, data: any) => this.update<any>('supplier-debts', id, data);
  deleteSupplierDebt = (id: number) => this.remove('supplier-debts', id);
  customerDebts = (params?: ErpFilter) => this.list<any>('customer-debts', params);
  createCustomerDebt = (data: any) => this.create<any>('customer-debts', data);
  updateCustomerDebt = (id: number, data: any) => this.update<any>('customer-debts', id, data);
  deleteCustomerDebt = (id: number) => this.remove('customer-debts', id);
  receiveCustomerDebt = (id: number, data: any) => this.action(`customer-debts/${id}/receipts`, data);
}

export const restaurantErpService = new RestaurantErpService();
