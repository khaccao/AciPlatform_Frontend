import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage/RegisterPage';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { CarsPage } from '../features/cars/pages/CarsPage';
import { CarDetail } from '../features/cars/pages/CarDetail';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/users" element={<div>User Management List (To be implemented)</div>} />
                <Route path="/settings" element={<div>System Settings (To be implemented)</div>} />
                <Route path="/cars" element={<CarsPage />} />
                <Route path="/cars/:id" element={<CarDetail />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};
