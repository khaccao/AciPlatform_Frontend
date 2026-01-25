import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
    Users,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu as MenuIcon,
    Bell,
    Search,
    User as UserIcon
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/store/auth.slice';
import { RootState } from '../../store/store';
import styles from './MainLayout.module.scss';

export const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
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
                    <Link to="/dashboard" className={`${styles.navItem} ${styles.active}`}>
                        <LayoutDashboard size={20} />
                        <span>Tổng quan</span>
                    </Link>
                    <Link to="/users" className={styles.navItem}>
                        <Users size={20} />
                        <span>Nhân viên</span>
                    </Link>
                    <Link to="/settings" className={styles.navItem}>
                        <Settings size={20} />
                        <span>Cài đặt</span>
                    </Link>
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
