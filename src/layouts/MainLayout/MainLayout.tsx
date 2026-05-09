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
    CheckSquare,
    FileText,
    ClipboardCheck,
    PackagePlus,
    List,
    UserPlus,
    FileSearch,
    BookOpen,
    Wallet,
    Home,
    Layers,
    Warehouse,
    ChevronDown
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
    const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('expandedMenus');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Persist expanded menus to cache
    useEffect(() => {
        localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus));
    }, [expandedMenus]);

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
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const toggleGroup = (menuCode: string) => {
        setExpandedMenus(prev => 
            prev.includes(menuCode) 
                ? prev.filter(code => code !== menuCode)
                : [...prev, menuCode]
        );
    };

    const menus = user?.menus || [];

    const IconMap: Record<string, React.ReactNode> = {
        'dashboard': <LayoutDashboard size={18} />,
        'hr': <Users size={18} />,
        'hr/employees': <Users size={18} />,
        'hr/organization': <GitBranch size={18} />,
        'hr/contracts': <Briefcase size={18} />,
        'hr/timekeeping': <Clock size={18} />,
        'hr/face-attendance': <Camera size={18} />,
        'hr/salary': <CreditCard size={18} />,
        'settings': <Settings size={18} />,
        'system': <Settings size={18} />,
        'system/roles': <Shield size={18} />,
        'system/security': <ShieldCheck size={18} />,
        'system/menus': <MenuIcon size={18} />,
        'users': <Users size={18} />,
        'menus': <MenuIcon size={18} />,
        'dakenh': <Share2 size={18} />,
        'dakenh/facebook': <Facebook size={18} />,
        'fleet': <Truck size={18} />,
        '/fleet': <Truck size={18} />,
        'thuongmai': <Briefcase size={18} />,
        '/thuongmai': <Briefcase size={18} />,
        'customer': <Users size={18} />,
        '/customer': <Users size={18} />,
        'goods': <Package size={18} />,
        '/goods': <Package size={18} />,
        'accounting/payment-voucher': <FileText size={18} />,
        '/accounting/payment-voucher': <FileText size={18} />,
        'accounting/approve-voucher': <ClipboardCheck size={18} />,
        '/accounting/approve-voucher': <ClipboardCheck size={18} />,
        'accounting/warehouse-receipt': <PackagePlus size={18} />,
        '/accounting/warehouse-receipt': <PackagePlus size={18} />,
    };

    const AllIcons: Record<string, React.ReactNode> = {
        'LayoutDashboard': <LayoutDashboard size={18} />,
        'Users': <Users size={18} />,
        'CreditCard': <CreditCard size={18} />,
        'FileText': <FileText size={18} />,
        'ClipboardCheck': <ClipboardCheck size={18} />,
        'PackagePlus': <PackagePlus size={18} />,
        'Package': <Package size={18} />,
        'Briefcase': <Briefcase size={18} />,
        'Settings': <Settings size={18} />,
        'Shield': <Shield size={18} />,
        'ShieldCheck': <ShieldCheck size={18} />,
        'Menu': <MenuIcon size={18} />,
        'Truck': <Truck size={18} />,
        'Camera': <Camera size={18} />,
        'GitBranch': <GitBranch size={18} />,
        'Share2': <Share2 size={18} />,
        'Facebook': <Facebook size={18} />,
        'Clock': <Clock size={18} />,
        'List': <List size={18} />,
        'UserPlus': <UserPlus size={18} />,
        'FileSearch': <FileSearch size={18} />,
        'BookOpen': <BookOpen size={18} />,
        'Wallet': <Wallet size={18} />,
        'Home': <Home size={18} />,
        'Layers': <Layers size={18} />,
        'Warehouse': <Warehouse size={18} />
    };

    const getIcon = (menu: any, cleanPath: string) => {
        if (menu.icon && AllIcons[menu.icon]) {
            return AllIcons[menu.icon];
        }
        return IconMap[menu.menuCode] || IconMap[cleanPath.substring(1)] || <MenuIcon size={18} />;
    };

    const renderMenuItems = () => {
        const sortedMenus = [...menus].sort((a, b) => (a.order || 0) - (b.order || 0));
        const parentMenus = sortedMenus.filter(m => m.isParent || (!m.codeParent && !m.menuCode.includes('/')));

        return parentMenus.map(menu => {
            const children = sortedMenus.filter(m => m.codeParent === menu.menuCode && m.id !== menu.id);
            const hasChildren = children.length > 0;
            const isExpanded = expandedMenus.includes(menu.menuCode);
            const cleanPath = menu.menuCode.startsWith('/') ? menu.menuCode : `/${menu.menuCode}`;

            if (hasChildren) {
                return (
                    <div key={menu.id} className={`${styles.navGroup} ${isSidebarOpen ? '' : styles.navGroupCollapsed}`}>
                        <div 
                            className={`${styles.navItem} ${styles.navGroupToggle}`} 
                            onClick={() => toggleGroup(menu.menuCode)}
                        >
                            {getIcon(menu, cleanPath)}
                            <span>{menu.name}</span>
                            {isSidebarOpen && (
                                <div className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
                                    <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                                </div>
                            )}
                        </div>
                        
                        <div className={`${styles.navChildren} ${isExpanded ? styles.navChildrenOpen : ''}`}>
                            {children.map(child => {
                                const childPath = child.menuCode.startsWith('/') ? child.menuCode : `/${child.menuCode}`;
                                return (
                                    <Link
                                        key={child.id}
                                        to={childPath}
                                        className={`${styles.navItem} ${styles.navSubItem} ${isActive(childPath) ? styles.active : ''}`}
                                        title={child.name}
                                    >
                                        <div className={styles.dotIndicator} />
                                        <span>{child.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            }

            return (
                <Link
                    key={menu.id}
                    to={cleanPath}
                    className={`${styles.navItem} ${isActive(cleanPath) ? styles.active : ''}`}
                    title={menu.name}
                >
                    {getIcon(menu, cleanPath)}
                    <span>{menu.name}</span>
                </Link>
            );
        });
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
