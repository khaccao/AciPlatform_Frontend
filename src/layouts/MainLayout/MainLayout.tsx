import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Users,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu as MenuIcon,
    Bell,
    Search,
    User as UserIcon,
    Briefcase,
    Clock,
    CreditCard,
    GitBranch
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/store/auth.slice';
import styles from './MainLayout.module.scss';

export const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname.startsWith(path);
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? '' : styles.collapsed}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <div className={styles.logoSquare}>ACI</div>
                        <span>ACI Platform</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <Link to="/dashboard" className={`${styles.navItem} ${isActive('/dashboard') ? styles.active : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Tổng quan</span>
                    </Link>

                    <div className={styles.navGroup}>
                        <div className={styles.navGroupTitle}>NHÂN SỰ</div>
                        <Link to="/hr/employees" className={`${styles.navItem} ${isActive('/hr/employees') ? styles.active : ''}`}>
                            <Users size={20} />
                            <span>Nhân viên</span>
                        </Link>
                        <Link to="/hr/organization" className={`${styles.navItem} ${isActive('/hr/organization') ? styles.active : ''}`}>
                            <GitBranch size={20} />
                            <span>Tổ chức</span>
                        </Link>
                        <Link to="/hr/contracts" className={`${styles.navItem} ${isActive('/hr/contracts') ? styles.active : ''}`}>
                            <Briefcase size={20} />
                            <span>Hợp đồng</span>
                        </Link>
                        <Link to="/hr/timekeeping" className={`${styles.navItem} ${isActive('/hr/timekeeping') ? styles.active : ''}`}>
                            <Clock size={20} />
                            <span>Chấm công</span>
                        </Link>
                        <Link to="/hr/salary" className={`${styles.navItem} ${isActive('/hr/salary') ? styles.active : ''}`}>
                            <CreditCard size={20} />
                            <span>Lương & Phúc lợi</span>
                        </Link>
                    </div>

                    <div className={styles.navGroup}>
                        <div className={styles.navGroupTitle}>HỆ THỐNG</div>
                        <Link to="/settings" className={`${styles.navItem} ${isActive('/settings') ? styles.active : ''}`}>
                            <Settings size={20} />
                            <span>Cài đặt</span>
                        </Link>
                    </div>
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
