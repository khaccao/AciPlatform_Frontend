
import React, { useEffect, useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Folder,
    FileText
} from 'lucide-react';
import { systemService } from '../../services/system.service';
import type { Menu } from '../../services/system.service';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { toast } from 'sonner';
import styles from './MenuManagement.module.scss';

export const MenuManagement: React.FC = () => {
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

    const handleDeleteClick = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa menu này?')) return;
        try {
            await systemService.deleteMenu(id);
            toast.success('Xóa menu thành công');
            fetchMenus();
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
            fetchMenus();
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
                                    <td>
                                        <div className={styles.menuName}>
                                            {menu.isParent ? <Folder size={16} className={styles.parentIcon} /> : <FileText size={16} className={styles.childIcon} />}
                                            <span style={{ marginLeft: menu.codeParent ? '1.5rem' : '0' }}>{menu.name}</span>
                                        </div>
                                    </td>
                                    <td><code>{menu.code}</code></td>
                                    <td>{menu.order}</td>
                                    <td>
                                        <span className={`${styles.badge} ${menu.isParent ? styles.bgParent : styles.bgChild}`}>
                                            {menu.isParent ? 'Danh mục cha' : 'Menu con'}
                                        </span>
                                    </td>
                                    <td>
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
