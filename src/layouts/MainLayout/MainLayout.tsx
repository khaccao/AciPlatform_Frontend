import React, { useEffect, useState } from 'react';
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
    ShieldCheck,
    GitBranch,
    Share2,
    Facebook,
    RefreshCw,
    Truck,
    Camera,
    X,
    Package,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, updateUser } from '../../features/auth/store/auth.slice';
import { authService } from '../../features/auth/services/auth.service';
import { useMediaQuery } from '../../shared/hooks/useMediaQuery';
import styles from './MainLayout.module.scss';
import { toast } from 'sonner';

export const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    
    // Breaking points
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
    
    const [isSidebarOpen, setSidebarOpen] = useState(!isMobile && !isTablet);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Sync sidebar state on screen size change
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        } else if (isTablet) {
            setSidebarOpen(false); // Start collapsed for tablet
        } else {
            setSidebarOpen(true); // Start open for desktop
        }
    }, [isMobile, isTablet]);

    // Close sidebar on navigation (mobile/tablet)
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

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
        'system/security': <ShieldCheck size={20} />,
        'system/menus': <MenuIcon size={20} />,
        'users': <Users size={20} />,
        'menus': <MenuIcon size={20} />,
        'dakenh': <Share2 size={20} />,
        'dakenh/facebook': <Facebook size={20} />,
        'fleet': <Truck size={20} />,
        '/fleet': <Truck size={20} />,
        'thuongmai': <Briefcase size={20} />,
        '/thuongmai': <Briefcase size={20} />,
        'customer': <Users size={20} />,
        '/customer': <Users size={20} />,
        'goods': <Package size={20} />,
        '/goods': <Package size={20} />,
    };

    const renderMenuItems = () => {
        // 1. Sort all menus by Order
        const sortedMenus = [...menus].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // 2. Identify parents (where isParent is true or has no slash/parent code)
        // Note: The logic should rely on IsParent if available, or hierarchy codes
        const parentMenus = sortedMenus.filter(m => {
            // Check if it's a parent based on being in DB as parent OR not having a slash and not having a parent assigned
            return m.isParent || (!m.codeParent && !m.menuCode.includes('/'));
        });

        const dynamicItems = parentMenus.map(menu => {
            // Find children that have this menu as a parent code
            const children = sortedMenus.filter(m => m.codeParent === menu.menuCode && m.id !== menu.id);
            const hasChildren = children.length > 0;

            if (hasChildren) {
                return (
                    <div key={menu.id} className={`${styles.navGroup} ${isSidebarOpen ? '' : styles.navGroupCollapsed}`}>
                        <div className={styles.navGroupTitle}>{isSidebarOpen ? menu.name.toUpperCase() : '•••'}</div>
                        {children.map(child => {
                            const cleanPath = child.menuCode.startsWith('/') ? child.menuCode : `/${child.menuCode}`;
                            return (
                                <Link
                                    key={child.id}
                                    to={cleanPath}
                                    className={`${styles.navItem} ${isActive(cleanPath) ? styles.active : ''}`}
                                    title={child.name}
                                >
                                    {IconMap[child.menuCode] || IconMap[cleanPath.substring(1)] || <MenuIcon size={20} />}
                                    <span>{child.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                );
            }

            // Single item (no children)
            const cleanPath = menu.menuCode.startsWith('/') ? menu.menuCode : `/${menu.menuCode}`;
            return (
                <Link
                    key={menu.id}
                    to={cleanPath}
                    className={`${styles.navItem} ${isActive(cleanPath) ? styles.active : ''}`}
                    title={menu.name}
                >
                    {IconMap[menu.menuCode] || IconMap[cleanPath.substring(1)] || <MenuIcon size={20} />}
                    <span>{menu.name}</span>
                </Link>
            );
        });

        return (
            <>
                {dynamicItems}
            </>
        );
    };

    const renderBottomNav = () => {
        if (!isMobile) return null;

        // Top-level navigation items for bottom bar
        const mainLinks = [
            { path: '/dashboard', label: 'T.Điều', icon: <LayoutDashboard size={20} /> },
            { path: '/hr', label: 'Nhân sự', icon: <Users size={20} /> },
            { path: '/fleet', label: 'Đội xe', icon: <Truck size={20} /> },
            { path: '/settings', label: 'C.Đặt', icon: <Settings size={20} /> },
        ];

        return (
            <nav className={styles.bottomNav}>
                {mainLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`${styles.bottomNavItem} ${isActive(link.path) ? styles.active : ''}`}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>
        );
    };

    return (
        <div className={`${styles.layout} ${isMobile ? styles.isMobile : ''} ${isTablet ? styles.isTablet : ''}`}>
            {/* Backdrop for mobile drawer */}
            {isMobile && isSidebarOpen && (
                <div 
                    className={styles.backdrop} 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? '' : styles.collapsed} ${isMobile && isSidebarOpen ? styles.mobileVisible : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <div className={styles.logoSquare}>ACI</div>
                        <span>ACI Platform</span>
                    </div>
                    {isMobile && (
                        <button className={styles.closeSidebarBtn} onClick={() => setSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    )}
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
            <main className={`${styles.main} ${!isSidebarOpen && !isMobile ? styles.mainExpanded : ''}`}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        {!isMobile && (
                            <button
                                className={styles.toggleBtn}
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                            >
                                <MenuIcon size={20} />
                            </button>
                        )}
                        {isMobile && (
                            <button
                                className={styles.toggleBtn}
                                onClick={() => setSidebarOpen(true)}
                            >
                                <MenuIcon size={20} />
                            </button>
                        )}
                        <div className={styles.searchBar}>
                            <Search size={18} />
                            <input type="text" placeholder="Tìm kiếm..." />
                        </div>
                    </div>

                    <div className={styles.headerRight}>
                        {!isMobile && (
                            <>
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
                            </>
                        )}
                        <div className={styles.userProfile}>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{isMobile ? (user?.fullName?.split(' ').pop()) : (user?.fullName || 'Admin User')}</span>
                                {!isMobile && <span className={styles.userRole}>Super Admin</span>}
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

                {/* Bottom Nav for Mobile */}
                {renderBottomNav()}
            </main>
        </div>
    );
};
