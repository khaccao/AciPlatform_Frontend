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

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* HR Module Routes */}
                <Route path="/hr">
                    <Route path="employees" element={<EmployeePage />} />
                    <Route path="organization" element={<OrganizationPage />} />
                    <Route path="contracts" element={<ContractPage />} />
                    <Route path="timekeeping" element={<TimekeepingPage />} />
                    <Route path="salary" element={<SalaryPage />} />
                </Route>

                <Route path="/users" element={<EmployeePage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};
