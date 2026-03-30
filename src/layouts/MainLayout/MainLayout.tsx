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
    Shield,
    GitBranch,
    Share2,
    Facebook,
    RefreshCw,
    Truck,
    Camera
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, updateUser } from '../../features/auth/store/auth.slice';
import { authService } from '../../features/auth/services/auth.service';
import styles from './MainLayout.module.scss';
import { toast } from 'sonner';

export const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleRefresh = async () => {
        if (!user) return;
        setIsRefreshing(true);
        try {
            const res = await authService.refreshMenu();
            if (res.status === 200 && res.data.Menus) {
                const newUser = { ...user, menus: res.data.Menus };
                dispatch(updateUser(newUser));
                toast.success('Đã cập nhật danh sách Menu mới nhất!');
            }
        } catch (error) {
            toast.error('Lỗi khi cập nhật dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setIsRefreshing(false);
        }
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
        'hr/face-attendance': <Camera size={20} />,
        'hr/salary': <CreditCard size={20} />,
        'settings': <Settings size={20} />,
        'system': <Settings size={20} />,
        'system/roles': <Shield size={20} />,
        'users': <Users size={20} />,
        'menus': <MenuIcon size={20} />,
        'dakenh': <Share2 size={20} />,
        'dakenh/facebook': <Facebook size={20} />,
        'fleet': <Truck size={20} />,
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
            // Improved children finding:
            // 1. Path contains parent code (e.g., child '/fleet' belongs to parent 'fleet')
            // 2. OR child starts with parent/
            const children = sortedMenus.filter(m => {
                if (m.id === menu.id) return false;
                
                const mCode = m.menuCode.startsWith('/') ? m.menuCode.substring(1) : m.menuCode;
                const pCode = menu.menuCode.startsWith('/') ? menu.menuCode.substring(1) : menu.menuCode;
                
                return mCode.startsWith(pCode) || m.menuCode === `/${pCode}`;
            });
            const hasChildren = children.length > 0;
            if (hasChildren) {
                return (
                    <div key={menu.id} className={styles.navGroup}>
                        <div className={styles.navGroupTitle}>{menu.name.toUpperCase()}</div>
                        {children.map(child => {
                            const cleanPath = child.menuCode.startsWith('/') ? child.menuCode : `/${child.menuCode}`;
                            return (
                                <Link
                                    key={child.id}
                                    to={cleanPath}
                                    className={`${styles.navItem} ${isActive(cleanPath) ? styles.active : ''}`}
                                >
                                    {IconMap[child.menuCode] || IconMap[cleanPath.substring(1)] || <MenuIcon size={20} />}
                                    <span>{child.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                );
            }

            const cleanPath = menu.menuCode.startsWith('/') ? menu.menuCode : `/${menu.menuCode}`;
            return (
                <Link
                    key={menu.id}
                    to={cleanPath}
                    className={`${styles.navItem} ${isActive(cleanPath) ? styles.active : ''}`}
                >
                    {IconMap[menu.menuCode] || IconMap[cleanPath.substring(1)] || <MenuIcon size={20} />}
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
                        <button 
                            className={`${styles.iconBtn} ${isRefreshing ? styles.spinning : ''}`} 
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            title="Làm mới menu"
                        >
                            <RefreshCw size={20} />
                        </button>
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
