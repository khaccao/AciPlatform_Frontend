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
    ChevronDown,
    Compass,
    BarChart,
    UserCheck,
    Map
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, updateUser } from '../../features/auth/store/auth.slice';
import { authService } from '../../features/auth/services/auth.service';
import { useMediaQuery } from '../../shared/hooks/useMediaQuery';
import styles from './MainLayout.module.scss';
import { toast } from 'sonner';
import hotelService from '../../features/hotel/services/hotel.service';

interface CompanyOption {
    code?: string;
    name?: string;
    isHotel?: boolean;
}

const getInitialCompanyCode = () => {
    const stored = localStorage.getItem('selectedCompanyCode') || localStorage.getItem('selectedHotelCode') || localStorage.getItem('dbName');
    if (stored) return stored;

    try {
        return JSON.parse(localStorage.getItem('user') || '{}')?.companyCode || '';
    } catch {
        return '';
    }
};

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
    const [companies, setCompanies] = useState<CompanyOption[]>([]);
    const [selectedCompanyCode, setSelectedCompanyCode] = useState(getInitialCompanyCode());
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

    useEffect(() => {
        hotelService.getCompanies()
            .then((items) => {
                setCompanies(items);
                if (!getInitialCompanyCode() && items?.[0]?.code) {
                    setSelectedCompanyCode(items[0].code);
                    hotelService.setCompanyCode(items[0].code);
                }
            })
            .catch(() => setCompanies([]));
    }, []);

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

    const handleCompanyChange = (code: string) => {
        setSelectedCompanyCode(code);
        hotelService.setCompanyCode(code);
        window.dispatchEvent(new CustomEvent('companyCodeChanged', { detail: code }));
        window.dispatchEvent(new Event('hotelCodeChanged'));
        window.location.reload();
    };

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
        'hotel': <Home size={18} />,
        'hotel/dashboard': <LayoutDashboard size={18} />,
        'hotel/room-map': <Map size={18} />,
        'hotel/room-rack': <Layers size={18} />,
        'hotel/bookings': <BookOpen size={18} />,
        'hotel/vehicles': <Truck size={18} />,
        'hotel/tours': <Compass size={18} />,
        'hotel/guides': <UserCheck size={18} />,
        'hotel/guests': <Users size={18} />,
        'hotel/reports': <BarChart size={18} />,
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
        'Warehouse': <Warehouse size={18} />,
        'Compass': <Compass size={18} />,
        'BarChart': <BarChart size={18} />,
        'UserCheck': <UserCheck size={18} />,
        'Map': <Map size={18} />,
        'Hotel': <Home size={18} />,
    };

    const getIcon = (menu: any, cleanPath: string) => {
        if (menu.icon && AllIcons[menu.icon]) {
            return AllIcons[menu.icon];
        }
        return IconMap[menu.menuCode] || IconMap[cleanPath.substring(1)] || <MenuIcon size={18} />;
    };

    const renderMenuItems = () => {
        const sortedMenus = [...menus].sort((a, b) => ((a.order || a.Order || 0) - (b.order || b.Order || 0)));
        
        const parentMenus = sortedMenus.filter(m => {
            const isP = m.isParent || m.IsParent;
            const codeP = m.codeParent || m.CodeParent;
            const mCode = m.menuCode || m.Code || '';
            return isP || (!codeP && !mCode.includes('/'));
        });

        return parentMenus.map(menu => {
            const mCode = menu.menuCode || menu.Code || '';
            const mName = menu.name || menu.Name || '';
            const children = sortedMenus.filter(m => {
                const codeP = m.codeParent || m.CodeParent;
                return codeP === mCode && m.id !== menu.id;
            });
            const hasChildren = children.length > 0;
            const isExpanded = expandedMenus.includes(mCode);
            const cleanPath = mCode.startsWith('/') ? mCode : `/${mCode}`;

            if (hasChildren) {
                return (
                    <div key={menu.id} className={`${styles.navGroup} ${isSidebarOpen ? '' : styles.navGroupCollapsed}`}>
                        <div 
                            className={`${styles.navItem} ${styles.navGroupToggle} ${isExpanded ? styles.navGroupToggleActive : ''}`} 
                            onClick={() => toggleGroup(mCode)}
                        >
                            <span className={styles.parentName}>{mName}</span>
                            {isSidebarOpen && (
                                <div className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
                                    <ChevronDown size={14} />
                                </div>
                            )}
                        </div>
                        
                        <div className={`${styles.navChildren} ${isExpanded ? styles.navChildrenOpen : ''}`}>
                            <div className={styles.verticalLine} />
                            {children.map(child => {
                                const cCode = child.menuCode || child.Code || '';
                                const cName = child.name || child.Name || '';
                                const childPath = cCode.startsWith('/') ? cCode : `/${cCode}`;
                                return (
                                    <Link
                                        key={child.id}
                                        to={childPath}
                                        className={`${styles.navItem} ${styles.navSubItem} ${isActive(childPath) ? styles.active : ''}`}
                                        title={cName}
                                    >
                                        <div className={styles.subItemIcon}>
                                            {getIcon(child, childPath)}
                                        </div>
                                        <span>{cName}</span>
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
                    title={mName}
                >
                    {getIcon(menu, cleanPath)}
                    <span>{mName}</span>
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

                <div className={styles.companySwitcher}>
                    <select value={selectedCompanyCode} onChange={(e) => handleCompanyChange(e.target.value)} title="Chọn công ty">
                        {companies.length === 0 ? (
                            <option value={selectedCompanyCode}>{selectedCompanyCode || 'Chọn công ty'}</option>
                        ) : companies.map(company => (
                            <option key={company.code} value={company.code}>
                                {company.code} - {company.name}{company.isHotel ? ' (Hotel)' : ''}
                            </option>
                        ))}
                    </select>
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
