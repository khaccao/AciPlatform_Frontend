import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage/RegisterPage';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { EmployeePage } from '../features/hr/pages/EmployeePage/EmployeePage';
import { OrganizationPage } from '../features/hr/pages/OrganizationPage/OrganizationPage';
import { ContractPage } from '../features/hr/pages/ContractPage/ContractPage';
import { TimekeepingPage } from '../features/hr/pages/TimekeepingPage/TimekeepingPage';
import { SalaryPage } from '../features/hr/pages/SalaryPage/SalaryPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage/SettingsPage';
import { RoleManagement } from '../features/system/pages/RoleManagement/RoleManagement';
import { MenuManagement } from '../features/system/pages/MenuManagement/MenuManagement';
import { AdvancedSecurityPage } from '../features/security/pages/AdvancedSecurityPage';
import { FacebookPage } from '../features/multi-channel/pages/FacebookPage/FacebookPage';
import { FleetManagementPage } from '../features/fleet/pages/FleetManagementPage/FleetManagementPage';
import FaceAttendancePage from '../features/hr/pages/FaceAttendancePage/FaceAttendancePage';
import { CustomerPage } from '../features/customers/pages/CustomerPage';
import { GoodsPage } from '../features/goods/pages/GoodsPage';
import { SellPage } from '../features/sell/pages/SellPage';
import ProjectList from '../features/projects/pages/ProjectList/ProjectList';
import ProjectDetail from '../features/projects/pages/ProjectDetail/ProjectDetail';
import MyTasks from '../features/projects/pages/MyTasks/MyTasks';
import { PaymentVoucherPage } from '../features/accounting/pages/PaymentVoucherPage';
import { ApproveVoucherPage } from '../features/accounting/pages/ApproveVoucherPage';
import { WarehouseReceiptPage } from '../features/accounting/pages/WarehouseReceiptPage';
import { ChartOfAccountsPage } from '../features/accounting/pages/ChartOfAccountsPage';
import { GeneralLedgerPage } from '../features/accounting/pages/GeneralLedgerPage';
import { SupplierManagementPage } from '../features/accounting/pages/SupplierManagementPage';
import { ReceiptVoucherPage } from '../features/accounting/pages/ReceiptVoucherPage';
import { CustomerDebtPage } from '../features/accounting/pages/CustomerDebtPage';
import { WarehouseManagementPage } from '../features/warehouse/pages/WarehouseManagementPage';
import { InventoryPage } from '../features/warehouse/pages/InventoryPage';
import RestaurantErpPage from '../features/restaurant-erp/pages/RestaurantErpPage';
// Hotel Module
import { HotelDashboardPage } from '../features/hotel/pages/HotelDashboardPage';
import { RoomMapPage } from '../features/hotel/pages/RoomMapPage';
import { BookingsPage } from '../features/hotel/pages/BookingsPage';
import { VehiclesPage } from '../features/hotel/pages/VehiclesPage';
import { ToursPage } from '../features/hotel/pages/ToursPage';
import { GuestsPage } from '../features/hotel/pages/GuestsPage';
import { ReportsPage } from '../features/hotel/pages/ReportsPage';
import { BookingNewPage } from '../features/hotel/pages/BookingNewPage';
import { BookingDetailPage } from '../features/hotel/pages/BookingDetailPage';
import { InvoicePage } from '../features/hotel/pages/InvoicePage';
import { GuideManagementPage } from '../features/hotel/pages/GuideManagementPage';
import { RoomMapManagementPage } from '../features/hotel/pages/RoomMapManagementPage';
import { ServiceManagementPage } from '../features/hotel/pages/ServiceManagementPage';
import { RoomRackPage } from '../features/hotel/pages/RoomRackPage';
import { RoomForecastPage } from '../features/hotel/pages/RoomForecastPage';
import { RoomStatusDashboardPage } from '../features/hotel/pages/RoomStatusDashboardPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const useHasMenuPermission = (path: string): boolean => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const menus: any[] = user?.menus || [];
        if (!menus || menus.length === 0) return false;
        const cleanPath = path.toLowerCase().replace(/^\//, '');
        return menus.some((m: any) => {
            const code = (m.menuCode || m.Code || '').toLowerCase().replace(/^\//, '');
            return cleanPath === code || cleanPath.startsWith(code + '/') || code.startsWith(cleanPath);
        });
    } catch {
        return true;
    }
};

const PermissionRoute = ({ children, menuCode }: { children: React.ReactNode; menuCode: string }) => {
    const allowed = useHasMenuPermission(menuCode);
    if (!allowed) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
};

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* HR Module Routes */}
                <Route path="/hr">
                    <Route path="employees" element={<PermissionRoute menuCode="hr/employees"><EmployeePage /></PermissionRoute>} />
                    <Route path="organization" element={<PermissionRoute menuCode="hr/organization"><OrganizationPage /></PermissionRoute>} />
                    <Route path="contracts" element={<PermissionRoute menuCode="hr/contracts"><ContractPage /></PermissionRoute>} />
                    <Route path="timekeeping" element={<PermissionRoute menuCode="hr/timekeeping"><TimekeepingPage /></PermissionRoute>} />
                    <Route path="face-attendance" element={<PermissionRoute menuCode="hr/face-attendance"><FaceAttendancePage /></PermissionRoute>} />
                    <Route path="salary" element={<PermissionRoute menuCode="hr/salary"><SalaryPage /></PermissionRoute>} />
                </Route>

                <Route path="/users" element={<EmployeePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* System Routes */}
                <Route path="/system">
                    <Route path="roles" element={<PermissionRoute menuCode="system/roles"><RoleManagement /></PermissionRoute>} />
                    <Route path="security" element={<PermissionRoute menuCode="system/security"><AdvancedSecurityPage /></PermissionRoute>} />
                </Route>

                <Route path="/menus" element={<PermissionRoute menuCode="menus"><MenuManagement /></PermissionRoute>} />

                {/* Multi-Channel Routes */}
                <Route path="/dakenh/facebook" element={<PermissionRoute menuCode="dakenh/facebook"><FacebookPage /></PermissionRoute>} />

                <Route path="/fleet" element={<PermissionRoute menuCode="fleet"><FleetManagementPage /></PermissionRoute>} />

                {/* Ecommerce Routes */}
                <Route path="/customer" element={<PermissionRoute menuCode="customer"><CustomerPage /></PermissionRoute>} />
                <Route path="/goods" element={<PermissionRoute menuCode="goods"><GoodsPage /></PermissionRoute>} />
                <Route path="/sell" element={<PermissionRoute menuCode="sell"><SellPage /></PermissionRoute>} />

                {/* R&D Project Management Routes */}
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/my-tasks" element={<MyTasks />} />

                {/* Accounting Routes */}
                <Route path="/accounting">
                    <Route index element={<Navigate to="general-ledger" replace />} />
                    <Route path="payment-voucher" element={<PermissionRoute menuCode="accounting/payment-voucher"><PaymentVoucherPage /></PermissionRoute>} />
                    <Route path="approve-voucher" element={<PermissionRoute menuCode="accounting/approve-voucher"><ApproveVoucherPage /></PermissionRoute>} />
                    <Route path="warehouse-receipt" element={<PermissionRoute menuCode="accounting/warehouse-receipt"><WarehouseReceiptPage /></PermissionRoute>} />
                    <Route path="chart-of-accounts" element={<PermissionRoute menuCode="accounting/chart-of-accounts"><ChartOfAccountsPage /></PermissionRoute>} />
                    <Route path="general-ledger" element={<PermissionRoute menuCode="accounting/general-ledger"><GeneralLedgerPage /></PermissionRoute>} />
                    <Route path="suppliers" element={<PermissionRoute menuCode="accounting/suppliers"><SupplierManagementPage /></PermissionRoute>} />
                    <Route path="receipt-voucher" element={<PermissionRoute menuCode="accounting/receipt-voucher"><ReceiptVoucherPage /></PermissionRoute>} />
                    <Route path="customer-debt" element={<PermissionRoute menuCode="accounting/customer-debt"><CustomerDebtPage /></PermissionRoute>} />
                </Route>

                <Route path="/restaurant-erp">
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<PermissionRoute menuCode="restaurant-erp/dashboard"><RestaurantErpPage kind="dashboard" /></PermissionRoute>} />
                    <Route path="capital" element={<PermissionRoute menuCode="restaurant-erp/capital"><RestaurantErpPage kind="capital" /></PermissionRoute>} />
                    <Route path="funds" element={<PermissionRoute menuCode="restaurant-erp/funds"><RestaurantErpPage kind="funds" /></PermissionRoute>} />
                    <Route path="setup-expenses" element={<PermissionRoute menuCode="restaurant-erp/setup-expenses"><RestaurantErpPage kind="setup-expenses" /></PermissionRoute>} />
                    <Route path="materials" element={<PermissionRoute menuCode="restaurant-erp/materials"><RestaurantErpPage kind="materials" /></PermissionRoute>} />
                    <Route path="purchase-requests" element={<PermissionRoute menuCode="restaurant-erp/purchase-requests"><RestaurantErpPage kind="purchase-requests" /></PermissionRoute>} />
                    <Route path="purchase-approvals" element={<PermissionRoute menuCode="restaurant-erp/purchase-approvals"><RestaurantErpPage kind="purchase-approvals" /></PermissionRoute>} />
                    <Route path="purchase-orders" element={<PermissionRoute menuCode="restaurant-erp/purchase-orders"><RestaurantErpPage kind="purchase-orders" /></PermissionRoute>} />
                    <Route path="goods-receipts" element={<PermissionRoute menuCode="restaurant-erp/goods-receipts"><RestaurantErpPage kind="goods-receipts" /></PermissionRoute>} />
                    <Route path="payment-requests" element={<PermissionRoute menuCode="restaurant-erp/payment-requests"><RestaurantErpPage kind="payment-requests" /></PermissionRoute>} />
                    <Route path="payment-approvals" element={<PermissionRoute menuCode="restaurant-erp/payment-approvals"><RestaurantErpPage kind="payment-approvals" /></PermissionRoute>} />
                    <Route path="disbursements" element={<PermissionRoute menuCode="restaurant-erp/disbursements"><RestaurantErpPage kind="disbursements" /></PermissionRoute>} />
                    <Route path="supplier-debts" element={<PermissionRoute menuCode="restaurant-erp/supplier-debts"><RestaurantErpPage kind="supplier-debts" /></PermissionRoute>} />
                    <Route path="customer-debts" element={<PermissionRoute menuCode="restaurant-erp/customer-debts"><RestaurantErpPage kind="customer-debts" /></PermissionRoute>} />
                    <Route path="inventory" element={<PermissionRoute menuCode="restaurant-erp/inventory"><RestaurantErpPage kind="inventory" /></PermissionRoute>} />
                </Route>

                <Route path="/warehouse">
                    <Route index element={<Navigate to="inventory" replace />} />
                    <Route path="locations" element={<WarehouseManagementPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                </Route>

                {/* Hotel Management Routes */}
                <Route path="/hotel">
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<PermissionRoute menuCode="hotel/dashboard"><HotelDashboardPage /></PermissionRoute>} />
                    <Route path="room-map" element={<PermissionRoute menuCode="hotel/room-map"><RoomMapPage /></PermissionRoute>} />
                    <Route path="room-rack" element={<PermissionRoute menuCode="hotel/room-rack"><RoomRackPage /></PermissionRoute>} />
                    <Route path="room-forecast" element={<PermissionRoute menuCode="hotel/room-forecast"><RoomForecastPage /></PermissionRoute>} />
                    <Route path="room-status" element={<PermissionRoute menuCode="hotel/room-status"><RoomStatusDashboardPage /></PermissionRoute>} />
                    <Route path="bookings" element={<PermissionRoute menuCode="hotel/bookings"><BookingsPage /></PermissionRoute>} />
                    <Route path="bookings/new" element={<PermissionRoute menuCode="hotel/bookings"><BookingNewPage /></PermissionRoute>} />
                    <Route path="bookings/:id" element={<PermissionRoute menuCode="hotel/bookings"><BookingDetailPage /></PermissionRoute>} />
                    <Route path="bookings/:id/invoice" element={<PermissionRoute menuCode="hotel/bookings"><InvoicePage /></PermissionRoute>} />
                    <Route path="vehicles" element={<PermissionRoute menuCode="hotel/vehicles"><VehiclesPage /></PermissionRoute>} />
                    <Route path="tours" element={<PermissionRoute menuCode="hotel/tours"><ToursPage /></PermissionRoute>} />
                    <Route path="guides" element={<PermissionRoute menuCode="hotel/guides"><GuideManagementPage /></PermissionRoute>} />
                    <Route path="room-map-mgmt" element={<PermissionRoute menuCode="hotel/room-map-mgmt"><RoomMapManagementPage /></PermissionRoute>} />
                    <Route path="services-mgmt" element={<PermissionRoute menuCode="hotel/services-mgmt"><ServiceManagementPage /></PermissionRoute>} />
                    <Route path="guests" element={<PermissionRoute menuCode="hotel/guests"><GuestsPage /></PermissionRoute>} />
                    <Route path="reports" element={<PermissionRoute menuCode="hotel/reports"><ReportsPage /></PermissionRoute>} />
                </Route>

                <Route path="/users" element={<EmployeePage />} />
            </Route>

            {/* Fallback: authenticated users go to dashboard, guests go to login */}
            <Route path="*" element={
                localStorage.getItem('token')
                    ? <Navigate to="/dashboard" replace />
                    : <Navigate to="/login" replace />
            } />
        </Routes>
    );
};
