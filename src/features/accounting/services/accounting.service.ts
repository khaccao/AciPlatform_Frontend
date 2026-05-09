import api from '../../../core/services/api.service';

export interface PaymentVoucherRequestModel {
  voucherDate: string;
  amount: number;
  reason: string;
  receiverName: string;
  debitAccount: string;
  creditAccount: string;
  supplierId?: number;
  isInternal: boolean;
}

export interface ApproveVoucherRequestModel {
  ledgerId: number;
  isApproved: boolean;
  note: string;
}

export interface WarehouseReceiptItemModel {
  goodsId: number;
  quantity: number;
  unitPrice: number;
}

export interface WarehouseReceiptRequestModel {
  receiptDate: string;
  receiptNumber: string;
  supplierId: number;
  note: string;
  isInternal: boolean;
  items: WarehouseReceiptItemModel[];
}

class AccountingService {
  async createPaymentVoucher(data: PaymentVoucherRequestModel, year: number = new Date().getFullYear()) {
    const response = await api.post(`/v1/accounting/internal/payment-vouchers?year=${year}`, data);
    return response.data;
  }

  async approvePaymentVoucher(data: ApproveVoucherRequestModel) {
    const response = await api.post(`/v1/accounting/internal/payment-vouchers/approve`, data);
    return response.data;
  }

  async createWarehouseReceipt(data: WarehouseReceiptRequestModel, year: number = new Date().getFullYear()) {
    const response = await api.post(`/v1/accounting/internal/warehouse-receipts?year=${year}`, data);
    return response.data;
  }

  // --- NEW APIS ---


  async createChartOfAccount(data: any) {
    const response = await api.post('/v1/accounting/chart-of-accounts', data);
    return response.data;
  }
  
  async updateChartOfAccount(id: number, data: any) {
    const response = await api.put(`/v1/accounting/chart-of-accounts/${id}`, data);
    return response.data;
  }
  
  async deleteChartOfAccount(id: number) {
    const response = await api.delete(`/v1/accounting/chart-of-accounts/${id}`);
    return response.data;
  }

  async getChartOfAccounts() {
    const response = await api.get(`/v1/accounting/chart-of-accounts`);
    return response.data;
  }

  async getLedgerEntries(year: number = new Date().getFullYear(), isInternal: number = 0) {
    const response = await api.get(`/v1/accounting/ledgers?year=${year}&isInternal=${isInternal}`);
    return response.data;
  }

  async createSupplier(data: any) {
    const response = await api.post('/Customers', { ...data, isSupplier: true });
    return response.data;
  }
  
  async updateSupplier(id: number, data: any) {
    const response = await api.put(`/Customers/${id}`, { ...data, isSupplier: true });
    return response.data;
  }
  
  async deleteSupplier(id: number) {
    const response = await api.delete(`/Customers/${id}`);
    return response.data;
  }

  async getSuppliers() {
    // Re-use Customers API since suppliers and customers are managed together in this ERP
    const response = await api.get(`/Customers?Page=1&PageSize=100&IsSupplier=true`);
    return response.data;
  }

  // --- CUSTOMER ACCOUNTING APIS ---
  async createReceiptVoucher(data: { customerId: number; amount: number; paymentMethod: string; isInternal: number }, year: number = new Date().getFullYear()) {
    const response = await api.post(`/v1/accounting/customers/receipt-vouchers?year=${year}`, data);
    return response.data;
  }

  async getCustomerDebt(customerId: number, year: number = new Date().getFullYear(), isInternal: number = 1) {
    const response = await api.get(`/v1/accounting/customers/${customerId}/debt?year=${year}&isInternal=${isInternal}`);
    return response.data;
  }
}

export const accountingService = new AccountingService();
