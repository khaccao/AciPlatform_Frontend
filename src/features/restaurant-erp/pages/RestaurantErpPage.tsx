import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Edit3, Plus, RefreshCw, Send, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { restaurantErpService, type Dashboard } from '../services/restaurantErp.service';
import styles from './RestaurantErp.module.scss';

export type RestaurantErpPageKind =
  | 'dashboard'
  | 'capital'
  | 'funds'
  | 'setup-expenses'
  | 'materials'
  | 'purchase-requests'
  | 'purchase-approvals'
  | 'purchase-orders'
  | 'goods-receipts'
  | 'payment-requests'
  | 'payment-approvals'
  | 'disbursements'
  | 'supplier-debts'
  | 'customer-debts'
  | 'inventory';

const titles: Record<RestaurantErpPageKind, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard điều hành', subtitle: 'Vốn, thu chi, quỹ, công nợ, tồn kho và cảnh báo vận hành.' },
  capital: { title: 'Quản lý vốn đầu tư', subtitle: 'Ghi nhận người góp vốn, cam kết, đã góp và quỹ nhận tiền.' },
  funds: { title: 'Quản lý quỹ', subtitle: 'Tiền mặt, ngân hàng và các nguồn tiền dùng để giải ngân.' },
  'setup-expenses': { title: 'Chi phí setup ban đầu', subtitle: 'Theo dõi chi phí mở quán riêng với chi phí vận hành.' },
  materials: { title: 'Danh mục vật tư', subtitle: 'Vật tư, nhóm vật tư, đơn vị tính và định mức tồn kho.' },
  'purchase-requests': { title: 'Đề nghị mua hàng', subtitle: 'Lập phiếu xin mua, gửi duyệt và theo dõi trạng thái.' },
  'purchase-approvals': { title: 'Duyệt đề nghị mua', subtitle: 'Duyệt hoặc từ chối các phiếu mua đang chờ xử lý.' },
  'purchase-orders': { title: 'Đơn mua hàng', subtitle: 'Tạo PO chính thức gửi nhà cung cấp và theo dõi giao hàng.' },
  'goods-receipts': { title: 'Nhập kho', subtitle: 'Nhập hàng về kho, tăng tồn và phát sinh công nợ NCC.' },
  'payment-requests': { title: 'Đề nghị chi', subtitle: 'Lập phiếu đề nghị thanh toán NCC, setup hoặc chi phí vận hành.' },
  'payment-approvals': { title: 'Duyệt chi', subtitle: 'Duyệt đề nghị chi trước khi kế toán giải ngân tiền thật.' },
  disbursements: { title: 'Giải ngân', subtitle: 'Chi tiền từ quỹ, giảm quỹ và giảm công nợ nếu trả NCC.' },
  'supplier-debts': { title: 'Công nợ nhà cung cấp', subtitle: 'Theo dõi phải trả, đã trả, còn lại và trạng thái quá hạn.' },
  'customer-debts': { title: 'Công nợ khách hàng', subtitle: 'Ghi nhận phải thu và thu tiền nhiều lần.' },
  inventory: { title: 'Tồn kho', subtitle: 'Tồn sau mỗi lần nhập/xuất, giá trị tồn và cảnh báo tồn thấp.' },
};

const money = (value?: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);

const today = () => new Date().toISOString().slice(0, 10);

const numberValue = (form: FormData, key: string) => Number(form.get(key) || 0);
const stringValue = (form: FormData, key: string) => String(form.get(key) || '').trim();
const optionalNumber = (form: FormData, key: string) => {
  const value = stringValue(form, key);
  return value ? Number(value) : undefined;
};

const statusLabels: Record<string, string> = {
  Draft: 'Nháp',
  Submitted: 'Đã gửi',
  Pending: 'Chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Từ chối',
  Cancelled: 'Đã hủy',
  Converted: 'Đã tạo PO',
  Completed: 'Hoàn tất',
  PendingDisbursement: 'Chờ giải ngân',
  Disbursed: 'Đã giải ngân',
  New: 'Mới tạo',
  Sent: 'Đã gửi NCC',
  Confirmed: 'NCC xác nhận',
  PartiallyReceived: 'Giao một phần',
  FullyReceived: 'Đã giao đủ',
  Received: 'Đã nhập kho',
  WaitingInvoice: 'Chờ hóa đơn',
  Open: 'Đang mở',
  Partial: 'Một phần',
  Closed: 'Đã tất toán',
  Overdue: 'Quá hạn',
  BadDebt: 'Nợ xấu',
  Normal: 'Bình thường',
  LowStock: 'Tồn thấp',
  OutOfStock: 'Hết hàng',
  Expired: 'Hết hạn',
};

const displayLabels: Record<string, string> = {
  Cash: 'Tiền mặt',
  Bank: 'Ngân hàng',
  EWallet: 'Ví điện tử',
  SupplierDebt: 'Trả công nợ NCC',
  Setup: 'Chi setup',
  Operating: 'Chi vận hành',
};

const displayValue = (value: unknown): string | number => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return String(value);
  return statusLabels[value] || displayLabels[value] || value;
};

const StatusBadge = ({ status }: { status?: string }) => (
  <span className={`${styles.badge} ${(styles as Record<string, string>)[`badge${status}`] || ''}`}>
    {statusLabels[status || 'Draft'] || status || 'Nháp'}
  </span>
);

const DataTable = ({ columns, rows, actions }: { columns: { key: string; label: string; money?: boolean }[]; rows: any[]; actions?: (row: any) => React.ReactNode }) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((column) => <th key={column.key}>{column.label}</th>)}
          {actions && <th></th>}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length + (actions ? 1 : 0)}><div className={styles.empty}>Chưa có dữ liệu</div></td></tr>
        ) : rows.map((row) => (
          <tr key={row.id || row.code}>
            {columns.map((column) => (
              <td key={column.key}>
                {column.key === 'status'
                  ? <StatusBadge status={row[column.key]} />
                  : column.money
                    ? money(row[column.key])
                    : displayValue(row[column.key])}
              </td>
            ))}
            {actions && <td>{actions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const RestaurantErpPage: React.FC<{ kind: RestaurantErpPageKind }> = ({ kind }) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [funds, setFunds] = useState<any[]>([]);
  const [capital, setCapital] = useState<any[]>([]);
  const [setupExpenses, setSetupExpenses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [supplierDebts, setSupplierDebts] = useState<any[]>([]);
  const [customerDebts, setCustomerDebts] = useState<any[]>([]);
  const [stockBalances, setStockBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<{ kind: RestaurantErpPageKind; row: any } | null>(null);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const current = editing?.kind === kind ? editing.row : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [
        dashboardData,
        fundData,
        capitalData,
        setupData,
        groupData,
        materialData,
        prData,
        poData,
        receiptData,
        paymentData,
        disbursementData,
        supplierDebtData,
        customerDebtData,
        stockData,
      ] = await Promise.all([
        restaurantErpService.dashboard(),
        restaurantErpService.funds(),
        restaurantErpService.capitalContributions(),
        restaurantErpService.setupExpenses(),
        restaurantErpService.materialGroups(),
        restaurantErpService.materials(),
        restaurantErpService.purchaseRequests(),
        restaurantErpService.purchaseOrders(),
        restaurantErpService.goodsReceipts(),
        restaurantErpService.paymentRequests(),
        restaurantErpService.disbursements(),
        restaurantErpService.supplierDebts(),
        restaurantErpService.customerDebts(),
        restaurantErpService.stockBalances(),
      ]);
      setDashboard(dashboardData);
      setFunds(fundData);
      setCapital(capitalData);
      setSetupExpenses(setupData);
      setGroups(groupData);
      setMaterials(materialData);
      setPurchaseRequests(prData);
      setPurchaseOrders(poData);
      setGoodsReceipts(receiptData);
      setPaymentRequests(paymentData);
      setDisbursements(disbursementData);
      setSupplierDebts(supplierDebtData);
      setCustomerDebts(customerDebtData);
      setStockBalances(stockData);
    } catch {
      toast.error('Không tải được dữ liệu ERP nhà hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = (handler: (form: FormData) => Promise<void>) => async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await handler(new FormData(event.currentTarget));
      event.currentTarget.reset();
      setEditing(null);
      setEditingGroup(null);
      toast.success('Đã lưu dữ liệu');
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Không thực hiện được thao tác');
    }
  };

  const materialOptions = useMemo(() => materials.map((m) => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>), [materials]);
  const fundOptions = useMemo(() => funds.map((f) => <option key={f.id} value={f.id}>{f.code} - {f.name}</option>), [funds]);
  const debtOptions = useMemo(() => supplierDebts.filter((d) => d.remainingAmount > 0).map((d) => <option key={d.id} value={d.id}>{d.code} - {money(d.remainingAmount)}</option>), [supplierDebts]);
  const approvedPayments = paymentRequests.filter((p) => p.status === 'PendingDisbursement' || p.status === 'Approved');

  const approveAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      toast.success('Đã cập nhật trạng thái');
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Không cập nhật được trạng thái');
    }
  };

  const deleteAction = async (action: () => Promise<unknown>) => {
    if (!window.confirm('Xóa dữ liệu này?')) return;
    try {
      await action();
      if (editing?.kind === kind) setEditing(null);
      setEditingGroup(null);
      toast.success('Đã xóa dữ liệu');
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Không xóa được dữ liệu');
    }
  };

  const crudActions = (row: any, remove: (id: number) => Promise<unknown>, editable = true) => (
    <div className={styles.toolbar}>
      {editable && <button className={styles.secondaryButton} onClick={() => setEditing({ kind, row })}><Edit3 size={14} />Sửa</button>}
      <button className={styles.dangerButton} onClick={() => deleteAction(() => remove(row.id))}><Trash2 size={14} />Xóa</button>
    </div>
  );

  const renderDashboard = () => {
    const d = dashboard;
    const metrics = [
      ['Tổng vốn cam kết', d?.totalCommittedCapital],
      ['Vốn đã góp', d?.totalContributedCapital],
      ['Vốn còn phải góp', d?.remainingCapitalToContribute],
      ['Chi phí setup', d?.totalSetupExpense],
      ['Đã giải ngân', d?.totalDisbursed],
      ['Tồn quỹ', d?.totalFundBalance],
      ['Công nợ NCC', d?.supplierDebt],
      ['Công nợ khách', d?.customerDebt],
      ['Chờ duyệt mua', d?.purchaseRequestsPending],
      ['Chờ duyệt chi', d?.paymentRequestsPending],
      ['Duyệt chưa chi', d?.approvedNotDisbursed],
      ['Giá trị tồn kho', d?.inventoryValue],
    ];

    return (
      <>
        <div className={styles.grid}>
          {metrics.map(([label, value]) => (
            <div className={styles.metric} key={label as string}>
              <span>{label}</span>
              <strong>{typeof value === 'number' && (label as string).includes('Cho ') ? value : money(value as number)}</strong>
            </div>
          ))}
        </div>
        <DataTable
          rows={stockBalances}
          columns={[
            { key: 'warehouseCode', label: 'Kho' },
            { key: 'materialId', label: 'Vật tư' },
            { key: 'quantity', label: 'Số lượng' },
            { key: 'inventoryValue', label: 'Giá trị', money: true },
            { key: 'stockStatus', label: 'Trạng thái' },
          ]}
        />
      </>
    );
  };

  const renderForm = () => {
    if (kind === 'funds') {
      return (
        <form key={`fund-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updateFund(current.id, {
          code: '', name: stringValue(f, 'name'), fundType: stringValue(f, 'fundType'),
          accountCode: stringValue(f, 'accountCode'), openingBalance: numberValue(f, 'openingBalance'),
        }) : restaurantErpService.createFund({
          code: '', name: stringValue(f, 'name'), fundType: stringValue(f, 'fundType'),
          accountCode: stringValue(f, 'accountCode'), openingBalance: numberValue(f, 'openingBalance'),
        })))}>
          <label>Mã quỹ<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>Tên quỹ<input name="name" required placeholder="Quỹ tiền mặt" defaultValue={current?.name || ''} /></label>
          <label>Loại quỹ<select name="fundType" defaultValue={current?.fundType || 'Cash'}><option value="Cash">Tiền mặt</option><option value="Bank">Ngân hàng</option><option value="EWallet">Ví điện tử</option></select></label>
          <label>Tài khoản<input name="accountCode" defaultValue={current?.accountCode || '111'} /></label>
          <label className={styles.wide}>Số dư đầu<input name="openingBalance" type="number" min="0" defaultValue={current?.openingBalance || 0} /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Plus size={16} />{current ? 'Cập nhật' : 'Thêm quỹ'}</button></div>
        </form>
      );
    }

    if (kind === 'capital') {
      return (
        <form key={`capital-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updateCapitalContribution(current.id, {
          code: '', contributorName: stringValue(f, 'contributorName'),
          committedAmount: numberValue(f, 'committedAmount'), contributedAmount: numberValue(f, 'contributedAmount'),
          contributionDate: stringValue(f, 'contributionDate'), paymentMethod: stringValue(f, 'paymentMethod'),
          fundId: optionalNumber(f, 'fundId'), note: stringValue(f, 'note'),
        }) : restaurantErpService.createCapitalContribution({
          code: '', contributorName: stringValue(f, 'contributorName'),
          committedAmount: numberValue(f, 'committedAmount'), contributedAmount: numberValue(f, 'contributedAmount'),
          contributionDate: stringValue(f, 'contributionDate'), paymentMethod: stringValue(f, 'paymentMethod'),
          fundId: optionalNumber(f, 'fundId'), note: stringValue(f, 'note'),
        })))}>
          <label>Mã góp vốn<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>Người góp<input name="contributorName" required defaultValue={current?.contributorName || ''} /></label>
          <label>Cam kết<input name="committedAmount" type="number" min="0" defaultValue={current?.committedAmount || 0} /></label>
          <label>Đã góp<input name="contributedAmount" type="number" min="0" defaultValue={current?.contributedAmount || 0} disabled={!!current} /></label>
          <label>Ngày góp<input name="contributionDate" type="date" defaultValue={(current?.contributionDate || today()).slice(0, 10)} /></label>
          <label>Hình thức<select name="paymentMethod" defaultValue={current?.paymentMethod || 'Cash'}><option value="Cash">Tiền mặt</option><option value="Bank">Chuyển khoản</option></select></label>
          <label className={styles.wide}>Quỹ nhận<select name="fundId" defaultValue={current?.fundId || ''}><option value="">Chọn quỹ</option>{fundOptions}</select></label>
          <label className={styles.wide}>Ghi chú<textarea name="note" defaultValue={current?.note || ''} /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Plus size={16} />{current ? 'Cập nhật' : 'Ghi nhận vốn'}</button></div>
        </form>
      );
    }

    if (kind === 'setup-expenses') {
      return (
        <form key={`setup-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updateSetupExpense(current.id, {
          code: '', name: stringValue(f, 'name'), expenseGroup: stringValue(f, 'expenseGroup'),
          amount: numberValue(f, 'amount'), expenseDate: stringValue(f, 'expenseDate'), note: stringValue(f, 'note'),
        }) : restaurantErpService.createSetupExpense({
          code: '', name: stringValue(f, 'name'), expenseGroup: stringValue(f, 'expenseGroup'),
          amount: numberValue(f, 'amount'), expenseDate: stringValue(f, 'expenseDate'), note: stringValue(f, 'note'),
        })))}>
          <label>Mã chi phí<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>Tên khoản chi<input name="name" required defaultValue={current?.name || ''} /></label>
          <label>Nhóm<select name="expenseGroup" defaultValue={current?.expenseGroup || 'Mặt bằng'}><option>Mặt bằng</option><option>Sửa chữa</option><option>Thiết bị bếp</option><option>Nội thất</option><option>Công cụ dụng cụ</option><option>Marketing</option></select></label>
          <label>Số tiền<input name="amount" type="number" min="0" defaultValue={current?.amount || 0} /></label>
          <label>Ngày<input name="expenseDate" type="date" defaultValue={(current?.expenseDate || today()).slice(0, 10)} /></label>
          <label className={styles.wide}>Ghi chú<textarea name="note" defaultValue={current?.note || ''} /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Plus size={16} />{current ? 'Cập nhật' : 'Thêm chi phí'}</button></div>
        </form>
      );
    }

    if (kind === 'materials') {
      return (
        <>
          <form key={`group-${editingGroup?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (editingGroup ? restaurantErpService.updateMaterialGroup(editingGroup.id, {
            code: '', name: stringValue(f, 'groupName'), note: stringValue(f, 'groupNote'),
          }) : restaurantErpService.createMaterialGroup({
            code: '', name: stringValue(f, 'groupName'), note: stringValue(f, 'groupNote'),
          })))}>
            <label>Mã nhóm<input value={editingGroup?.code || 'Tự sinh'} disabled /></label>
            <label>Tên nhóm<input name="groupName" placeholder="Nguyên liệu" defaultValue={editingGroup?.name || ''} /></label>
            <label className={styles.wide}>Ghi chú<input name="groupNote" defaultValue={editingGroup?.note || ''} /></label>
            <div className={styles.actions}>
              {editingGroup && <button type="button" className={styles.secondaryButton} onClick={() => setEditingGroup(null)}>Hủy sửa</button>}
              <button className={styles.secondaryButton}>{editingGroup ? 'Cập nhật nhóm' : 'Thêm nhóm'}</button>
            </div>
          </form>
          <div className={styles.subTable}>
            <DataTable
              rows={groups}
              columns={[
                { key: 'code', label: 'Mã nhóm' },
                { key: 'name', label: 'Tên nhóm' },
                { key: 'note', label: 'Ghi chú' },
              ]}
              actions={(row) => (
                <div className={styles.toolbar}>
                  <button className={styles.secondaryButton} onClick={() => setEditingGroup(row)}><Edit3 size={14} />Sửa</button>
                  <button className={styles.dangerButton} onClick={() => deleteAction(() => restaurantErpService.deleteMaterialGroup(row.id))}><Trash2 size={14} />Xóa</button>
                </div>
              )}
            />
          </div>
          <form key={`material-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updateMaterial(current.id, {
            code: '', name: stringValue(f, 'name'), materialGroupId: optionalNumber(f, 'materialGroupId'),
            unit: stringValue(f, 'unit'), purchaseUnit: stringValue(f, 'purchaseUnit'), conversionRate: numberValue(f, 'conversionRate') || 1,
            minStock: numberValue(f, 'minStock'), maxStock: numberValue(f, 'maxStock'), lastPurchasePrice: numberValue(f, 'lastPurchasePrice'),
            defaultSupplierId: optionalNumber(f, 'defaultSupplierId'), hasExpiryTracking: stringValue(f, 'hasExpiryTracking') === 'true',
            inventoryAccountCode: stringValue(f, 'inventoryAccountCode') || '152', expenseAccountCode: stringValue(f, 'expenseAccountCode') || '642',
          }) : restaurantErpService.createMaterial({
            code: '', name: stringValue(f, 'name'), materialGroupId: optionalNumber(f, 'materialGroupId'),
            unit: stringValue(f, 'unit'), purchaseUnit: stringValue(f, 'purchaseUnit'), conversionRate: numberValue(f, 'conversionRate') || 1,
            minStock: numberValue(f, 'minStock'), maxStock: numberValue(f, 'maxStock'), lastPurchasePrice: numberValue(f, 'lastPurchasePrice'),
            defaultSupplierId: optionalNumber(f, 'defaultSupplierId'), hasExpiryTracking: stringValue(f, 'hasExpiryTracking') === 'true',
            inventoryAccountCode: stringValue(f, 'inventoryAccountCode') || '152', expenseAccountCode: stringValue(f, 'expenseAccountCode') || '642',
          })))}>
            <label>Mã vật tư<input value={current?.code || 'Tự sinh'} disabled /></label>
            <label>Tên vật tư<input name="name" required defaultValue={current?.name || ''} /></label>
            <label>Nhóm<select name="materialGroupId" defaultValue={current?.materialGroupId || ''}><option value="">Không chọn</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.code} - {g.name}</option>)}</select></label>
            <label>DVT<input name="unit" required placeholder="kg" defaultValue={current?.unit || ''} /></label>
            <label>ĐVT mua<input name="purchaseUnit" placeholder="bao" defaultValue={current?.purchaseUnit || ''} /></label>
            <label>Quy đổi<input name="conversionRate" type="number" defaultValue={current?.conversionRate || 1} /></label>
            <label>Tồn tối thiểu<input name="minStock" type="number" defaultValue={current?.minStock || 0} /></label>
            <label>Tồn tối đa<input name="maxStock" type="number" defaultValue={current?.maxStock || 0} /></label>
            <label>Giá gần nhất<input name="lastPurchasePrice" type="number" defaultValue={current?.lastPurchasePrice || 0} /></label>
            <label>Quản lý HSD<select name="hasExpiryTracking" defaultValue={current?.hasExpiryTracking ? 'true' : 'false'}><option value="false">Không</option><option value="true">Có</option></select></label>
            <label>TK kho<input name="inventoryAccountCode" defaultValue={current?.inventoryAccountCode || '152'} /></label>
            <label>TK chi phí<input name="expenseAccountCode" defaultValue={current?.expenseAccountCode || '642'} /></label>
            <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Plus size={16} />{current ? 'Cập nhật' : 'Thêm vật tư'}</button></div>
          </form>
        </>
      );
    }

    if (kind === 'purchase-requests') {
      return (
        <form key={`pr-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updatePurchaseRequest(current.id, {
          code: '', requestDepartment: stringValue(f, 'requestDepartment'),
          requestedBy: stringValue(f, 'requestedBy'), requestDate: stringValue(f, 'requestDate'),
          neededDate: stringValue(f, 'neededDate'), reason: stringValue(f, 'reason'),
          items: [{ materialId: numberValue(f, 'materialId'), quantity: numberValue(f, 'quantity'), estimatedUnitPrice: numberValue(f, 'estimatedUnitPrice'), reason: stringValue(f, 'lineReason') }],
        }) : restaurantErpService.createPurchaseRequest({
          code: '', requestDepartment: stringValue(f, 'requestDepartment'),
          requestedBy: stringValue(f, 'requestedBy'), requestDate: stringValue(f, 'requestDate'),
          neededDate: stringValue(f, 'neededDate'), reason: stringValue(f, 'reason'),
          items: [{ materialId: numberValue(f, 'materialId'), quantity: numberValue(f, 'quantity'), estimatedUnitPrice: numberValue(f, 'estimatedUnitPrice'), reason: stringValue(f, 'lineReason') }],
        })))}>
          <label>Mã phiếu<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>Bộ phận<input name="requestDepartment" placeholder="Bếp" defaultValue={current?.requestDepartment || ''} /></label>
          <label>Người yêu cầu<input name="requestedBy" defaultValue={current?.requestedBy || ''} /></label>
          <label>Ngày<input name="requestDate" type="date" defaultValue={(current?.requestDate || today()).slice(0, 10)} /></label>
          <label className={styles.wide}>Vật tư<select name="materialId" required>{materialOptions}</select></label>
          <label>Số lượng<input name="quantity" type="number" min="0" step="0.01" /></label>
          <label>Giá dự kiến<input name="estimatedUnitPrice" type="number" min="0" /></label>
          <label className={styles.wide}>Lý do<textarea name="reason" defaultValue={current?.reason || ''} /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Plus size={16} />{current ? 'Cập nhật' : 'Lập đề nghị'}</button></div>
        </form>
      );
    }

    if (kind === 'purchase-orders') {
      return (
        <form key={`po-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updatePurchaseOrder(current.id, {
          code: '', purchaseRequestId: optionalNumber(f, 'purchaseRequestId'), supplierId: numberValue(f, 'supplierId'),
          orderDate: stringValue(f, 'orderDate'), expectedDeliveryDate: stringValue(f, 'expectedDeliveryDate'), note: stringValue(f, 'note'),
          items: [{ materialId: numberValue(f, 'materialId'), quantity: numberValue(f, 'quantity'), unitPrice: numberValue(f, 'unitPrice'), vatRate: numberValue(f, 'vatRate') }],
        }) : restaurantErpService.createPurchaseOrder({
          code: '', purchaseRequestId: optionalNumber(f, 'purchaseRequestId'), supplierId: numberValue(f, 'supplierId'),
          orderDate: stringValue(f, 'orderDate'), expectedDeliveryDate: stringValue(f, 'expectedDeliveryDate'), note: stringValue(f, 'note'),
          items: [{ materialId: numberValue(f, 'materialId'), quantity: numberValue(f, 'quantity'), unitPrice: numberValue(f, 'unitPrice'), vatRate: numberValue(f, 'vatRate') }],
        })))}>
          <label>Mã PO<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>ID NCC<input name="supplierId" type="number" required defaultValue={current?.supplierId || ''} /></label>
          <label>Từ đề nghị ID<input name="purchaseRequestId" type="number" defaultValue={current?.purchaseRequestId || ''} /></label>
          <label>Ngày đặt<input name="orderDate" type="date" defaultValue={(current?.orderDate || today()).slice(0, 10)} /></label>
          <label className={styles.wide}>Vật tư<select name="materialId" required>{materialOptions}</select></label>
          <label>Số lượng<input name="quantity" type="number" step="0.01" /></label>
          <label>Đơn giá<input name="unitPrice" type="number" /></label>
          <label>VAT %<input name="vatRate" type="number" defaultValue="0" /></label>
          <label className={styles.wide}>Ghi chú<textarea name="note" defaultValue={current?.note || ''} /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Plus size={16} />{current ? 'Cập nhật' : 'Tạo PO'}</button></div>
        </form>
      );
    }

    if (kind === 'goods-receipts') {
      return (
        <form key={`gr-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updateGoodsReceipt(current.id, {
          code: '', purchaseOrderId: optionalNumber(f, 'purchaseOrderId'), supplierId: optionalNumber(f, 'supplierId'),
          warehouseCode: stringValue(f, 'warehouseCode') || 'MAIN', warehouseName: stringValue(f, 'warehouseName'),
          receiptDate: stringValue(f, 'receiptDate'), status: 'Draft', note: stringValue(f, 'note'),
          items: [{ materialId: numberValue(f, 'materialId'), orderedQuantity: numberValue(f, 'orderedQuantity'), receivedQuantity: numberValue(f, 'receivedQuantity'), damagedQuantity: numberValue(f, 'damagedQuantity'), unitPrice: numberValue(f, 'unitPrice'), lotNumber: stringValue(f, 'lotNumber') }],
        }) : restaurantErpService.createGoodsReceipt({
          code: '', purchaseOrderId: optionalNumber(f, 'purchaseOrderId'), supplierId: optionalNumber(f, 'supplierId'),
          warehouseCode: stringValue(f, 'warehouseCode') || 'MAIN', warehouseName: stringValue(f, 'warehouseName'),
          receiptDate: stringValue(f, 'receiptDate'), status: 'Received', note: stringValue(f, 'note'),
          items: [{ materialId: numberValue(f, 'materialId'), orderedQuantity: numberValue(f, 'orderedQuantity'), receivedQuantity: numberValue(f, 'receivedQuantity'), damagedQuantity: numberValue(f, 'damagedQuantity'), unitPrice: numberValue(f, 'unitPrice'), lotNumber: stringValue(f, 'lotNumber') }],
        })))}>
          <label>Mã nhập kho<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>ID PO<input name="purchaseOrderId" type="number" defaultValue={current?.purchaseOrderId || ''} /></label>
          <label>ID NCC<input name="supplierId" type="number" defaultValue={current?.supplierId || ''} /></label>
          <label>Ngày nhập<input name="receiptDate" type="date" defaultValue={(current?.receiptDate || today()).slice(0, 10)} /></label>
          <label>Kho<input name="warehouseCode" defaultValue={current?.warehouseCode || 'MAIN'} /></label>
          <label>Tên kho<input name="warehouseName" placeholder="Kho tổng" defaultValue={current?.warehouseName || ''} /></label>
          <label className={styles.wide}>Vật tư<select name="materialId" required>{materialOptions}</select></label>
          <label>SL đặt<input name="orderedQuantity" type="number" step="0.01" /></label>
          <label>SL nhận<input name="receivedQuantity" type="number" step="0.01" /></label>
          <label>SL hỏng<input name="damagedQuantity" type="number" step="0.01" defaultValue="0" /></label>
          <label>Đơn giá<input name="unitPrice" type="number" /></label>
          <label>Lô hàng<input name="lotNumber" /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><PackagePlusIcon />{current ? 'Cập nhật' : 'Nhập kho'}</button></div>
        </form>
      );
    }

    if (kind === 'payment-requests') {
      return (
        <form key={`pay-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updatePaymentRequest(current.id, {
          code: '', paymentType: stringValue(f, 'paymentType'), supplierId: optionalNumber(f, 'supplierId'),
          supplierDebtId: optionalNumber(f, 'supplierDebtId'), receiverName: stringValue(f, 'receiverName'), requestDate: stringValue(f, 'requestDate'),
          requestedAmount: numberValue(f, 'requestedAmount'), debitAccountCode: stringValue(f, 'debitAccountCode') || '642', reason: stringValue(f, 'reason'),
          items: [{ content: stringValue(f, 'content') || stringValue(f, 'reason'), amount: numberValue(f, 'requestedAmount') }],
        }) : restaurantErpService.createPaymentRequest({
          code: '', paymentType: stringValue(f, 'paymentType'), supplierId: optionalNumber(f, 'supplierId'),
          supplierDebtId: optionalNumber(f, 'supplierDebtId'), receiverName: stringValue(f, 'receiverName'), requestDate: stringValue(f, 'requestDate'),
          requestedAmount: numberValue(f, 'requestedAmount'), debitAccountCode: stringValue(f, 'debitAccountCode') || '642', reason: stringValue(f, 'reason'),
          items: [{ content: stringValue(f, 'content') || stringValue(f, 'reason'), amount: numberValue(f, 'requestedAmount') }],
        })))}>
          <label>Mã đề nghị<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>Loại chi<select name="paymentType" defaultValue={current?.paymentType || 'SupplierDebt'}><option value="SupplierDebt">Trả công nợ NCC</option><option value="Setup">Chi setup</option><option value="Operating">Chi vận hành</option></select></label>
          <label>ID NCC<input name="supplierId" type="number" defaultValue={current?.supplierId || ''} /></label>
          <label>Công nợ<select name="supplierDebtId" defaultValue={current?.supplierDebtId || ''}><option value="">Không gắn</option>{debtOptions}</select></label>
          <label>Người nhận<input name="receiverName" defaultValue={current?.receiverName || ''} /></label>
          <label>Ngày đề nghị<input name="requestDate" type="date" defaultValue={(current?.requestDate || today()).slice(0, 10)} /></label>
          <label>Số tiền<input name="requestedAmount" type="number" min="0" defaultValue={current?.requestedAmount || 0} /></label>
          <label>TK nợ<input name="debitAccountCode" defaultValue={current?.debitAccountCode || '642'} /></label>
          <label className={styles.wide}>Nội dung<textarea name="reason" defaultValue={current?.reason || ''} /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Plus size={16} />{current ? 'Cập nhật' : 'Lập đề nghị chi'}</button></div>
        </form>
      );
    }

    if (kind === 'disbursements') {
      return (
        <form key={`dis-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updateDisbursement(current.id, {
          code: '', fundId: current.fundId, disbursementDate: stringValue(f, 'disbursementDate'),
          amount: numberValue(f, 'amount'), receiverName: stringValue(f, 'receiverName'), paidBy: stringValue(f, 'paidBy'), note: stringValue(f, 'note'),
        }) : restaurantErpService.disburse(numberValue(f, 'paymentRequestId'), {
          code: '', fundId: numberValue(f, 'fundId'), disbursementDate: stringValue(f, 'disbursementDate'),
          amount: numberValue(f, 'amount'), receiverName: stringValue(f, 'receiverName'), paidBy: stringValue(f, 'paidBy'), note: stringValue(f, 'note'),
        })))}>
          <label>Mã giải ngân<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>Đề nghị chi<select name="paymentRequestId" required disabled={!!current} defaultValue={current?.paymentRequestId || ''}>{approvedPayments.map((p) => <option key={p.id} value={p.id}>{p.code} - {money(p.requestedAmount - p.disbursedAmount)}</option>)}</select></label>
          <label>Quỹ chi<select name="fundId" required disabled={!!current} defaultValue={current?.fundId || ''}>{fundOptions}</select></label>
          <label>Ngày chi<input name="disbursementDate" type="date" defaultValue={(current?.disbursementDate || today()).slice(0, 10)} /></label>
          <label>Số tiền<input name="amount" type="number" min="0" defaultValue={current?.amount || 0} disabled={!!current} /></label>
          <label>Người nhận<input name="receiverName" defaultValue={current?.receiverName || ''} /></label>
          <label>Người chi<input name="paidBy" defaultValue={current?.paidBy || ''} /></label>
          <label className={styles.wide}>Ghi chú<textarea name="note" defaultValue={current?.note || ''} /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Send size={16} />{current ? 'Cập nhật' : 'Giải ngân'}</button></div>
        </form>
      );
    }

    if (kind === 'supplier-debts') {
      return (
        <form key={`sdebt-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updateSupplierDebt(current.id, {
          code: '', supplierId: numberValue(f, 'supplierId'), debtDate: stringValue(f, 'debtDate'),
          dueDate: stringValue(f, 'dueDate'), amount: numberValue(f, 'amount'),
        }) : restaurantErpService.createSupplierDebt({
          code: '', supplierId: numberValue(f, 'supplierId'), debtDate: stringValue(f, 'debtDate'),
          dueDate: stringValue(f, 'dueDate'), amount: numberValue(f, 'amount'),
        })))}>
          <label>Mã công nợ<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>ID NCC<input name="supplierId" type="number" required defaultValue={current?.supplierId || ''} /></label>
          <label>Ngày nợ<input name="debtDate" type="date" defaultValue={(current?.debtDate || today()).slice(0, 10)} /></label>
          <label>Hạn trả<input name="dueDate" type="date" defaultValue={(current?.dueDate || '').slice(0, 10)} /></label>
          <label className={styles.wide}>Số tiền<input name="amount" type="number" min="0" defaultValue={current?.amount || 0} /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Plus size={16} />{current ? 'Cập nhật' : 'Thêm công nợ'}</button></div>
        </form>
      );
    }

    if (kind === 'customer-debts') {
      return (
        <form key={`cdebt-${current?.id || 'new'}`} className={styles.form} onSubmit={submit((f) => (current ? restaurantErpService.updateCustomerDebt(current.id, {
          code: '', customerId: numberValue(f, 'customerId'), debtDate: stringValue(f, 'debtDate'),
          dueDate: stringValue(f, 'dueDate'), amount: numberValue(f, 'amount'), description: stringValue(f, 'description'),
        }) : restaurantErpService.createCustomerDebt({
          code: '', customerId: numberValue(f, 'customerId'), debtDate: stringValue(f, 'debtDate'),
          dueDate: stringValue(f, 'dueDate'), amount: numberValue(f, 'amount'), description: stringValue(f, 'description'),
        })))}>
          <label>Mã công nợ<input value={current?.code || 'Tự sinh'} disabled /></label>
          <label>ID khách<input name="customerId" type="number" required defaultValue={current?.customerId || ''} /></label>
          <label>Ngày nợ<input name="debtDate" type="date" defaultValue={(current?.debtDate || today()).slice(0, 10)} /></label>
          <label>Hạn thu<input name="dueDate" type="date" defaultValue={(current?.dueDate || '').slice(0, 10)} /></label>
          <label>Số tiền<input name="amount" type="number" min="0" defaultValue={current?.amount || 0} /></label>
          <label className={styles.wide}>Mô tả<input name="description" defaultValue={current?.description || ''} /></label>
          <div className={styles.actions}>{current && <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Hủy sửa</button>}<button className={styles.primaryButton}><Plus size={16} />{current ? 'Cập nhật' : 'Thêm phải thu'}</button></div>
        </form>
      );
    }

    return null;
  };

  const renderTable = () => {
    if (kind === 'funds') return <DataTable rows={funds} columns={[{ key: 'code', label: 'Mã' }, { key: 'name', label: 'Tên quỹ' }, { key: 'fundType', label: 'Loại' }, { key: 'currentBalance', label: 'Số dư', money: true }]} actions={(row) => crudActions(row, restaurantErpService.deleteFund)} />;
    if (kind === 'capital') return <DataTable rows={capital} columns={[{ key: 'code', label: 'Mã' }, { key: 'contributorName', label: 'Người góp' }, { key: 'committedAmount', label: 'Cam kết', money: true }, { key: 'contributedAmount', label: 'Đã góp', money: true }]} actions={(row) => crudActions(row, restaurantErpService.deleteCapitalContribution)} />;
    if (kind === 'setup-expenses') return <DataTable rows={setupExpenses} columns={[{ key: 'code', label: 'Mã' }, { key: 'name', label: 'Khoản chi' }, { key: 'expenseGroup', label: 'Nhóm' }, { key: 'amount', label: 'Số tiền', money: true }, { key: 'status', label: 'Trạng thái' }]} actions={(row) => crudActions(row, restaurantErpService.deleteSetupExpense)} />;
    if (kind === 'materials') return <DataTable rows={materials} columns={[{ key: 'code', label: 'Mã' }, { key: 'name', label: 'Tên' }, { key: 'unit', label: 'DVT' }, { key: 'minStock', label: 'Tồn min' }, { key: 'lastPurchasePrice', label: 'Giá gần nhất', money: true }]} actions={(row) => crudActions(row, restaurantErpService.deleteMaterial)} />;
    if (kind === 'purchase-requests' || kind === 'purchase-approvals') return <DataTable rows={kind === 'purchase-approvals' ? purchaseRequests.filter((x) => x.status === 'Submitted' || x.status === 'Pending') : purchaseRequests} columns={[{ key: 'code', label: 'Mã' }, { key: 'requestDepartment', label: 'Bộ phận' }, { key: 'requestedBy', label: 'Người yêu cầu' }, { key: 'totalEstimatedAmount', label: 'Dự kiến', money: true }, { key: 'status', label: 'Trạng thái' }]} actions={(row) => (
      <div className={styles.toolbar}>
        {kind === 'purchase-requests' && row.status === 'Draft' && <button className={styles.secondaryButton} onClick={() => setEditing({ kind, row })}><Edit3 size={14} />Sửa</button>}
        {kind === 'purchase-requests' && row.status === 'Draft' && <button className={styles.secondaryButton} onClick={() => approveAction(() => restaurantErpService.submitPurchaseRequest(row.id))}><Send size={14} />Gửi</button>}
        {(row.status === 'Submitted' || row.status === 'Pending') && <button className={styles.primaryButton} onClick={() => approveAction(() => restaurantErpService.approvePurchaseRequest(row.id))}><Check size={14} />Duyệt</button>}
        {(row.status === 'Submitted' || row.status === 'Pending') && <button className={styles.dangerButton} onClick={() => approveAction(() => restaurantErpService.rejectPurchaseRequest(row.id))}><X size={14} />Từ chối</button>}
        <button className={styles.dangerButton} onClick={() => deleteAction(() => restaurantErpService.deletePurchaseRequest(row.id))}><Trash2 size={14} />Xóa</button>
      </div>
    )} />;
    if (kind === 'purchase-orders') return <DataTable rows={purchaseOrders} columns={[{ key: 'code', label: 'Mã PO' }, { key: 'supplierId', label: 'NCC' }, { key: 'totalAmount', label: 'Tổng tiền', money: true }, { key: 'receivedAmount', label: 'Đã nhập', money: true }, { key: 'status', label: 'Trạng thái' }]} actions={(row) => crudActions(row, restaurantErpService.deletePurchaseOrder, row.receivedAmount <= 0)} />;
    if (kind === 'goods-receipts') return <DataTable rows={goodsReceipts} columns={[{ key: 'code', label: 'Mã nhập' }, { key: 'purchaseOrderId', label: 'PO' }, { key: 'warehouseCode', label: 'Kho' }, { key: 'totalAmount', label: 'Tổng tiền', money: true }, { key: 'status', label: 'Trạng thái' }]} actions={(row) => crudActions(row, restaurantErpService.deleteGoodsReceipt, row.status === 'Draft')} />;
    if (kind === 'payment-requests' || kind === 'payment-approvals') return <DataTable rows={kind === 'payment-approvals' ? paymentRequests.filter((x) => x.status === 'Submitted' || x.status === 'Pending') : paymentRequests} columns={[{ key: 'code', label: 'Mã' }, { key: 'paymentType', label: 'Loại' }, { key: 'receiverName', label: 'Người nhận' }, { key: 'requestedAmount', label: 'Đề nghị', money: true }, { key: 'disbursedAmount', label: 'Đã chi', money: true }, { key: 'status', label: 'Trạng thái' }]} actions={(row) => (
      <div className={styles.toolbar}>
        {kind === 'payment-requests' && row.status === 'Draft' && <button className={styles.secondaryButton} onClick={() => setEditing({ kind, row })}><Edit3 size={14} />Sửa</button>}
        {kind === 'payment-requests' && row.status === 'Draft' && <button className={styles.secondaryButton} onClick={() => approveAction(() => restaurantErpService.submitPaymentRequest(row.id))}><Send size={14} />Gửi</button>}
        {(row.status === 'Submitted' || row.status === 'Pending') && <button className={styles.primaryButton} onClick={() => approveAction(() => restaurantErpService.approvePaymentRequest(row.id))}><Check size={14} />Duyệt</button>}
        {(row.status === 'Submitted' || row.status === 'Pending') && <button className={styles.dangerButton} onClick={() => approveAction(() => restaurantErpService.rejectPaymentRequest(row.id))}><X size={14} />Từ chối</button>}
        <button className={styles.dangerButton} onClick={() => deleteAction(() => restaurantErpService.deletePaymentRequest(row.id))}><Trash2 size={14} />Xóa</button>
      </div>
    )} />;
    if (kind === 'disbursements') return <DataTable rows={disbursements} columns={[{ key: 'code', label: 'Mã' }, { key: 'paymentRequestId', label: 'Đề nghị' }, { key: 'fundId', label: 'Quỹ' }, { key: 'receiverName', label: 'Người nhận' }, { key: 'amount', label: 'Số tiền', money: true }]} actions={(row) => crudActions(row, restaurantErpService.deleteDisbursement)} />;
    if (kind === 'supplier-debts') return <DataTable rows={supplierDebts} columns={[{ key: 'code', label: 'Mã' }, { key: 'supplierId', label: 'NCC' }, { key: 'amount', label: 'Phát sinh', money: true }, { key: 'paidAmount', label: 'Đã trả', money: true }, { key: 'remainingAmount', label: 'Còn lại', money: true }, { key: 'status', label: 'Trạng thái' }]} actions={(row) => crudActions(row, restaurantErpService.deleteSupplierDebt)} />;
    if (kind === 'customer-debts') return <DataTable rows={customerDebts} columns={[{ key: 'code', label: 'Mã' }, { key: 'customerId', label: 'Khách' }, { key: 'amount', label: 'Phát sinh', money: true }, { key: 'receivedAmount', label: 'Đã thu', money: true }, { key: 'remainingAmount', label: 'Còn lại', money: true }, { key: 'status', label: 'Trạng thái' }]} actions={(row) => crudActions(row, restaurantErpService.deleteCustomerDebt)} />;
    if (kind === 'inventory') return <DataTable rows={stockBalances} columns={[{ key: 'warehouseCode', label: 'Kho' }, { key: 'materialId', label: 'Vật tư' }, { key: 'quantity', label: 'Số lượng' }, { key: 'averageUnitPrice', label: 'Giá TB', money: true }, { key: 'inventoryValue', label: 'Giá trị', money: true }, { key: 'stockStatus', label: 'Trạng thái' }]} />;
    return null;
  };

  const heading = titles[kind];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>{heading.title}</h1>
          <p>{heading.subtitle}</p>
        </div>
        <div className={styles.toolbar}>
          <button className={styles.iconButton} onClick={load} disabled={loading} title="Làm mới"><RefreshCw size={16} /></button>
        </div>
      </div>

      {kind === 'dashboard' ? renderDashboard() : (
        <div className={styles.workbench}>
          {renderForm() && (
            <section className={styles.panel}>
              <div className={styles.panelHeader}><h2>Nhập liệu</h2></div>
              {renderForm()}
            </section>
          )}
          <section className={styles.panel}>
            <div className={styles.panelHeader}><h2>Danh sách</h2></div>
            {renderTable()}
          </section>
        </div>
      )}
    </div>
  );
};

const PackagePlusIcon = () => <Plus size={16} />;

export default RestaurantErpPage;


