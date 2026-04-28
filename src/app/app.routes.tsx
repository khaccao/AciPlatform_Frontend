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
import { TestPage } from '../features/test/pages/TestPage';
import { FacebookPage } from '../features/multi-channel/pages/FacebookPage/FacebookPage';
import { FleetManagementPage } from '../features/fleet/pages/FleetManagementPage/FleetManagementPage';
import FaceAttendancePage from '../features/hr/pages/FaceAttendancePage/FaceAttendancePage';
import { CustomerPage } from '../features/customers/pages/CustomerPage';
import { GoodsPage } from '../features/goods/pages/GoodsPage';
import { SellPage } from '../features/sell/pages/SellPage';
import ProjectList from '../features/projects/pages/ProjectList/ProjectList';
import ProjectDetail from '../features/projects/pages/ProjectDetail/ProjectDetail';
import MyTasks from '../features/projects/pages/MyTasks/MyTasks';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
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
                    <Route path="employees" element={<EmployeePage />} />
                    <Route path="organization" element={<OrganizationPage />} />
                    <Route path="contracts" element={<ContractPage />} />
                    <Route path="timekeeping" element={<TimekeepingPage />} />
                    <Route path="face-attendance" element={<FaceAttendancePage />} />
                    <Route path="salary" element={<SalaryPage />} />
                </Route>

                <Route path="/users" element={<EmployeePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* System Routes */}
                <Route path="/system">
                    <Route path="roles" element={<RoleManagement />} />
                    <Route path="security" element={<AdvancedSecurityPage />} />
                </Route>

                <Route path="/menus" element={<MenuManagement />} />
                
                <Route path="/test/demo" element={<TestPage />} />

                {/* Multi-Channel Routes */}
                <Route path="/dakenh/facebook" element={<FacebookPage />} />

                <Route path="/fleet" element={<FleetManagementPage />} />

                {/* Ecommerce Routes (Matching DB codes /customer and /goods) */}
                <Route path="/customer" element={<CustomerPage />} />
                <Route path="/goods" element={<GoodsPage />} />
                <Route path="/sell" element={<SellPage />} />

                {/* R&D Project Management Routes */}
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/my-tasks" element={<MyTasks />} />

                <Route path="/users" element={<EmployeePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};
