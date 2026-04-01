import React from 'react';
import { Outlet, Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
    Users,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu as MenuIcon,
    Bell,
    Search,
    User as UserIcon,
    CarFront,
    Briefcase,
    Clock,
    CreditCard,
    Shield,
    GitBranch,
    Share2,
    Facebook
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

    const menus = user?.menus || [];

    const IconMap: Record<string, React.ReactNode> = {
        'dashboard': <LayoutDashboard size={20} />,
        'hr': <Users size={20} />,
        'hr/employees': <Users size={20} />,
        'hr/organization': <GitBranch size={20} />,
        'hr/contracts': <Briefcase size={20} />,
        'hr/timekeeping': <Clock size={20} />,
        'hr/salary': <CreditCard size={20} />,
        'settings': <Settings size={20} />,
        'system': <Settings size={20} />,
        'system/roles': <Shield size={20} />,
        'users': <Users size={20} />,
        'menus': <MenuIcon size={20} />,
        'dakenh': <Share2 size={20} />,
        'dakenh/facebook': <Facebook size={20} />,
    };

    const renderMenuItems = () => {
        // Use isParent flag or no-slash heuristic
        // Sort by order
        const sortedMenus = [...menus].sort((a, b) => (a.order || 0) - (b.order || 0));

        // Note: The API flattens the list.
        // We find parents first.
        const parentMenus = sortedMenus.filter(m => {
            // Explicit parent flag? Or root level by code convention?
            // "dashboard" and "settings" are root. "system" should be root. 
            // Child menus usually have "/" (e.g. "hr/employees"), but "hr" is parent.
            // If m.menuCode has NO slash, it's likely a parent.
            return !m.menuCode.includes('/') || m.menuCode === 'dashboard' || m.menuCode === 'settings';
        });

        return parentMenus.map(menu => {
            // Find children: 
            // 1. Code starts with parent code + "/"
            // 2. OR CodeParent matches (if available in future, currently relying on code)
            const children = sortedMenus.filter(m => m.menuCode.startsWith(`${menu.menuCode}/`) && m.menuCode !== menu.menuCode);
            const hasChildren = children.length > 0;
            if (hasChildren) {
                return (
                    <div key={menu.id} className={styles.navGroup}>
                        <div className={styles.navGroupTitle}>{menu.name.toUpperCase()}</div>
                        {children.map(child => (
                            <Link
                                key={child.id}
                                to={`/${child.menuCode}`}
                                className={`${styles.navItem} ${isActive(`/${child.menuCode}`) ? styles.active : ''}`}
                            >
                                {IconMap[child.menuCode] || <MenuIcon size={20} />}
                                <span>{child.name}</span>
                            </Link>
                        ))}
                    </div>
                );
            }

            return (
                <Link
                    key={menu.id}
                    to={`/${menu.menuCode}`}
                    className={`${styles.navItem} ${isActive(`/${menu.menuCode}`) ? styles.active : ''}`}
                >
                    {IconMap[menu.menuCode] || <MenuIcon size={20} />}
                    <span>{menu.name}</span>
                </Link>
            );
        });
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
                    {renderMenuItems()}
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
