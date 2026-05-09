
import React, { useEffect, useState } from 'react';
import {
    Plus, Edit2, Trash2, Search, Folder, FileText,
    LayoutDashboard, Users, CreditCard, ClipboardCheck,
    PackagePlus, Package, Briefcase, Settings, Shield,
    Menu as MenuIcon, Truck, Camera, GitBranch, Share2,
    Database, Activity, DollarSign, Home, ShoppingCart,
    Store, Building, MapPin, Calendar, Bell, ChevronDown, Check
} from 'lucide-react';
import { systemService } from '../../services/system.service';
import type { Menu } from '../../services/system.service';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../../auth/store/auth.slice';
import { authService } from '../../../auth/services/auth.service';
import styles from './MenuManagement.module.scss';

const ICON_OPTIONS = [
    { value: 'LayoutDashboard', label: 'Dashboard', icon: LayoutDashboard },
    { value: 'Users', label: 'Nhân sự / Khách hàng', icon: Users },
    { value: 'CreditCard', label: 'Thanh toán', icon: CreditCard },
    { value: 'FileText', label: 'Chứng từ', icon: FileText },
    { value: 'ClipboardCheck', label: 'Duyệt chi', icon: ClipboardCheck },
    { value: 'PackagePlus', label: 'Nhập kho', icon: PackagePlus },
    { value: 'Package', label: 'Hàng hóa', icon: Package },
    { value: 'Briefcase', label: 'Công việc / Hợp đồng', icon: Briefcase },
    { value: 'Settings', label: 'Cài đặt', icon: Settings },
    { value: 'Shield', label: 'Phân quyền', icon: Shield },
    { value: 'Menu', label: 'Danh mục', icon: MenuIcon },
    { value: 'Truck', label: 'Đội xe', icon: Truck },
    { value: 'Camera', label: 'Chấm công', icon: Camera },
    { value: 'GitBranch', label: 'Sơ đồ tổ chức', icon: GitBranch },
    { value: 'Share2', label: 'Đa kênh', icon: Share2 },
    { value: 'Database', label: 'Dữ liệu', icon: Database },
    { value: 'Activity', label: 'Hoạt động', icon: Activity },
    { value: 'DollarSign', label: 'Tài chính', icon: DollarSign },
    { value: 'Home', label: 'Trang chủ', icon: Home },
    { value: 'ShoppingCart', label: 'Bán hàng', icon: ShoppingCart },
    { value: 'Store', label: 'Cửa hàng', icon: Store },
    { value: 'Building', label: 'Công ty', icon: Building },
    { value: 'MapPin', label: 'Vị trí', icon: MapPin },
    { value: 'Calendar', label: 'Lịch biểu', icon: Calendar },
    { value: 'Bell', label: 'Thông báo', icon: Bell },
];

const CustomIconSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedIcon = ICON_OPTIONS.find(i => i.value === value);

    return (
        <div className={styles.iconSelectContainer} style={{ position: 'relative', width: '100%' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Biểu tượng (Icon)</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem', border: '1px solid #dcdfe6', borderRadius: '4px',
                    cursor: 'pointer', backgroundColor: '#fff', minHeight: '38px'
                }}
            >
                {selectedIcon ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <selectedIcon.icon size={18} color="#555" />
                        <span>{selectedIcon.label}</span>
                    </div>
                ) : (
                    <span style={{ color: '#999' }}>-- Chọn biểu tượng --</span>
                )}
                <ChevronDown size={16} color="#999" />
            </div>
            
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    marginTop: '4px', backgroundColor: '#fff', border: '1px solid #e4e7ed',
                    borderRadius: '4px', boxShadow: '0 2px 12px 0 rgba(0,0,0,.1)',
                    zIndex: 100, maxHeight: '250px', overflowY: 'auto'
                }}>
                    <div 
                        onClick={() => { onChange(''); setIsOpen(false); }}
                        style={{ padding: '8px 12px', cursor: 'pointer', color: '#999', fontSize: '0.875rem' }}
                    >
                        -- Bỏ chọn biểu tượng --
                    </div>
                    {ICON_OPTIONS.map((opt) => (
                        <div 
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 12px', cursor: 'pointer',
                                backgroundColor: value === opt.value ? '#f0f7ff' : 'transparent',
                                color: value === opt.value ? '#1890ff' : '#333'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f7fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value === opt.value ? '#f0f7ff' : 'transparent'}
                        >
                            <opt.icon size={18} color={value === opt.value ? '#1890ff' : '#555'} />
                            <span style={{ flex: 1, fontSize: '0.875rem' }}>{opt.label}</span>
                            {value === opt.value && <Check size={16} color="#1890ff" />}
                        </div>
                    ))}
                </div>
            )}
            {/* Overlay to close dropdown */}
            {isOpen && <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />}
        </div>
    );
};

export const MenuManagement: React.FC = () => {
    const dispatch = useDispatch();
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMenu, setCurrentMenu] = useState<Partial<Menu>>({
        order: 1,
        isParent: false
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const data = await systemService.getAllMenus();
            setMenus(data);
        } catch (error) {
            toast.error('Không thể tải danh sách menu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setCurrentMenu({
            order: menus.length + 1,
            isParent: false,
            code: '',
            name: ''
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (menu: Menu) => {
        setIsEditing(true);
        setCurrentMenu({ ...menu });
        setIsModalOpen(true);
    };

    const refreshGlobalMenu = async () => {
        try {
            const response = await authService.refreshMenu();
            if (response && response.data) {
                // Ensure proper casing matching Redux User shape if necessary.
                // Assuming authService.refreshMenu returns data directly suitable for updateUser
                dispatch(updateUser({
                    id: response.data.Id || response.data.id,
                    username: response.data.Username || response.data.username,
                    fullName: response.data.Fullname || response.data.fullname,
                    roleName: response.data.RoleName || response.data.roleName,
                    menus: response.data.Menus || response.data.menus,
                    avatar: response.data.Avatar || response.data.avatar,
                    companyCode: response.data.CompanyCode || response.data.companyCode,
                }));
            }
        } catch (error) {
            console.error("Failed to refresh global menus", error);
        }
    };

    const handleDeleteClick = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa menu này?')) return;
        try {
            await systemService.deleteMenu(id);
            toast.success('Xóa menu thành công');
            await fetchMenus();
            await refreshGlobalMenu();
        } catch (error) {
            toast.error('Không thể xóa menu');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            const menuToSave = { ...currentMenu };
            if (menuToSave.isParent) {
                menuToSave.codeParent = "";
            }
            
            if (isEditing && currentMenu.id) {
                await systemService.updateMenu(currentMenu.id, menuToSave);
                toast.success('Cập nhật menu thành công');
            } else {
                await systemService.createMenu(menuToSave);
                toast.success('Thêm menu mới thành công');
            }
            setIsModalOpen(false);
            await fetchMenus();
            await refreshGlobalMenu();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Lỗi khi lưu thông tin menu';
            toast.error(errorMsg);
        } finally {
            setFormLoading(false);
        }
    };

    // Organize menus into tree structure

    const filteredMenus = menus.filter(m =>
        (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Quản lý Menu</h1>
                    <p>Cấu hình hệ thống menu điều hướng</p>
                </div>
                <Button onClick={handleAddClick}>
                    <Plus size={18} /> Thêm Menu
                </Button>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm menu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tên Menu</th>
                            <th>Mã CODE</th>
                            <th>Thứ tự</th>
                            <th>Loại</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</td></tr>
                        ) : filteredMenus.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Không có dữ liệu</td></tr>
                        ) : (
                            filteredMenus.map(menu => (
                                <tr key={menu.id}>
                                    <td data-label="Tên Menu">
                                        <div className={styles.menuName}>
                                            {menu.isParent ? <Folder size={16} className={styles.parentIcon} /> : <FileText size={16} className={styles.childIcon} />}
                                            <span style={{ marginLeft: menu.codeParent ? '1.5rem' : '0' }}>{menu.name}</span>
                                        </div>
                                    </td>
                                    <td data-label="Mã CODE"><code>{menu.code}</code></td>
                                    <td data-label="Thứ tự">{menu.order}</td>
                                    <td data-label="Loại">
                                        <span className={`${styles.badge} ${menu.isParent ? styles.bgParent : styles.bgChild}`}>
                                            {menu.isParent ? 'Danh mục cha' : 'Menu con'}
                                        </span>
                                    </td>
                                    <td data-label="Thao tác">
                                        <div className={styles.actions}>
                                            <button onClick={() => handleEditClick(menu)} title="Sửa"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteClick(menu.id)} title="Xóa" className={styles.delete}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Sửa Menu' : 'Thêm Menu Mới'}
                size="md"
            >
                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGrid}>
                        <Input
                            label="Tên Menu"
                            required
                            value={currentMenu.name || ''}
                            onChange={(e) => setCurrentMenu({ ...currentMenu, name: e.target.value })}
                        />
                        <Input
                            label="Mã CODE (URL)"
                            required
                            value={currentMenu.code || ''}
                            onChange={(e) => setCurrentMenu({ ...currentMenu, code: e.target.value })}
                            placeholder="VD: hr/employees"
                        />
                        <Input
                            label="Thứ tự hiển thị"
                            type="number"
                            value={currentMenu.order || 0}
                            onChange={(e) => setCurrentMenu({ ...currentMenu, order: Number(e.target.value) })}
                        />
                        <div className={styles.checkboxGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={currentMenu.isParent || false}
                                    onChange={(e) => setCurrentMenu({ ...currentMenu, isParent: e.target.checked })}
                                />
                                <span>Là danh mục cha</span>
                            </label>
                        </div>
                        {!currentMenu.isParent && (
                            <div className={styles.selectField}>
                                <label>Thuộc danh mục</label>
                                <select
                                    value={currentMenu.codeParent || ''}
                                    onChange={(e) => setCurrentMenu({ ...currentMenu, codeParent: e.target.value })}
                                >
                                    <option value="">-- Không có (Menu cấp 1) --</option>
                                    {menus.filter(m => m.isParent).map(m => (
                                        <option key={m.id} value={m.code}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <CustomIconSelect
                            value={currentMenu.icon || ''}
                            onChange={(val) => setCurrentMenu({ ...currentMenu, icon: val })}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="submit" isLoading={formLoading}>Lưu thay đổi</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
