import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    Users,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu as MenuIcon,
    Bell,
    Search,
    User as UserIcon,
    CarFront
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/store/auth.slice';
import styles from './MainLayout.module.scss';

const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
    { to: '/users',     icon: <Users size={20} />,           label: 'Nhân viên' },
    { to: '/cars',      icon: <CarFront size={20} />,        label: 'Vận tải' },
    { to: '/settings',  icon: <Settings size={20} />,        label: 'Cài đặt' },
];

export const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? '' : styles.collapsed}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <div className={styles.logoSquare}>PK</div>
                        <span>Perfect Key</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    {navItems.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            {icon}
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={20} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button
                            className={styles.toggleBtn}
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                        >
                            <MenuIcon size={20} />
                        </button>
                        <div className={styles.searchBar}>
                            <Search size={18} />
                            <input type="text" placeholder="Tìm kiếm..." />
                        </div>
                    </div>

                    <div className={styles.headerRight}>
                        <button className={styles.iconBtn}>
                            <Bell size={20} />
                            <span className={styles.badge}>3</span>
                        </button>
                        <div className={styles.userProfile}>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user?.fullName || 'Admin User'}</span>
                                <span className={styles.userRole}>Super Admin</span>
                            </div>
                            <div className={styles.avatar}>
                                <UserIcon size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
