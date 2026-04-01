import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Button } from '../../../../shared/ui/Button/Button';
import { systemService, type Role, type Menu, type MenuRole } from '../../services/system.service';
import { toast } from 'sonner';
import styles from './RolePermissionModal.module.scss';
import { ChevronRight, ChevronDown, CheckSquare, Square } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    role: Role;
}

export const RolePermissionModal: React.FC<Props> = ({ isOpen, onClose, role }) => {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [rolePermissions, setRolePermissions] = useState<Partial<MenuRole>[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, role.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [menusRes, permsRes] = await Promise.all([
                systemService.getAllMenus(),
                systemService.getRolePermissions(role.id)
            ]);
            setMenus(menusRes || []);
            setRolePermissions(permsRes || []);

            // Expand all parents by default
            const parents = (menusRes || [])
                .filter((m: Menu) => m.isParent)
                .map((m: Menu) => m.code);
            setExpandedGroups(parents);
        } catch (error) {
            toast.error('Không thể tải dữ liệu phân quyền');
        } finally {
            setLoading(false);
        }
    };

    const getPermission = (menuCode: string) => {
        return rolePermissions.find(p => p.menuCode === menuCode) || {
            menuCode,
            view: false,
            add: false,
            edit: false,
            delete: false,
            approve: false
        };
    };

    const toggleAll = (menuCode: string, checked: boolean) => {
        const menu = menus.find(m => m.code === menuCode);
        if (!menu) return;

        setRolePermissions(prev => {
            const existing = prev.find(p => p.menuCode === menuCode);
            let updated;
            const newPerm = {
                menuId: menu.id,
                menuCode: menu.code,
                userRoleId: role.id,
                view: checked,
                add: checked,
                edit: checked,
                delete: checked,
                approve: checked
            };

            if (existing) {
                updated = prev.map(p =>
                    p.menuCode === menuCode ? { ...p, ...newPerm } : p
                );
            } else {
                updated = [...prev, newPerm];
            }
            return updated;
        });
    };

    const togglePermission = (menuCode: string, field: keyof MenuRole) => {
        const menu = menus.find(m => m.code === menuCode);
        if (!menu) return;

        setRolePermissions(prev => {
            const existing = prev.find(p => p.menuCode === menuCode) || {
                menuId: menu.id,
                menuCode: menu.code,
                userRoleId: role.id,
                view: false,
                add: false,
                edit: false,
                delete: false,
                approve: false
            };

            const newValue = !existing[field];
            const updatedPerm = { ...existing, [field]: newValue };

            // If any action (add/edit/delete/approve) is checked, force VIEW to true
            if (newValue && field !== 'view') {
                updatedPerm.view = true;
            }

            // Sync back to array
            const existsInPrev = prev.some(p => p.menuCode === menuCode);
            if (existsInPrev) {
                return prev.map(p => p.menuCode === menuCode ? updatedPerm : p);
            } else {
                return [...prev, updatedPerm];
            }
        });
    };

    const toggleGroup = (code: string) => {
        setExpandedGroups(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await systemService.updateRolePermissions(role.id, rolePermissions as MenuRole[]);
            toast.success('Lưu phân quyền thành công');
            onClose();
        } catch (error) {
            toast.error('Không thể lưu phân quyền');
        } finally {
            setLoading(false);
        }
    };

    const renderMenuRow = (menu: Menu, depth = 0) => {
        const perm = getPermission(menu.code);
        const hasChildren = menus.some(m => m.codeParent === menu.code);
        const isExpanded = expandedGroups.includes(menu.code);
        const isAllChecked = perm.view && perm.add && perm.edit && perm.delete && perm.approve;

        return (
            <React.Fragment key={menu.id}>
                <tr className={`${styles.row} ${depth > 0 ? styles.childRow : ''}`}>
                    <td style={{ paddingLeft: `${depth * 24 + 12}px` }}>
                        <div className={styles.menuNameCell}>
                            <Checkbox checked={!!isAllChecked} onChange={() => toggleAll(menu.code, !isAllChecked)} />
                            {hasChildren && (
                                <button onClick={() => toggleGroup(menu.code)} className={styles.toggleBtn}>
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            )}
                            <span className={menu.isParent ? styles.parentName : ''} style={{ marginLeft: '8px' }}>{menu.name}</span>
                        </div>
                    </td>
                    <td className={styles.checkCell}>
                        <Checkbox checked={!!perm.view} onChange={() => togglePermission(menu.code, 'view')} />
                    </td>
                    <td className={styles.checkCell}>
                        <Checkbox checked={!!perm.add} onChange={() => togglePermission(menu.code, 'add')} />
                    </td>
                    <td className={styles.checkCell}>
                        <Checkbox checked={!!perm.edit} onChange={() => togglePermission(menu.code, 'edit')} />
                    </td>
                    <td className={styles.checkCell}>
                        <Checkbox checked={!!perm.delete} onChange={() => togglePermission(menu.code, 'delete')} />
                    </td>
                    <td className={styles.checkCell}>
                        <Checkbox checked={!!perm.approve} onChange={() => togglePermission(menu.code, 'approve')} />
                    </td>
                </tr>
                {hasChildren && isExpanded &&
                    menus.filter(m => m.codeParent === menu.code)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(m => renderMenuRow(m, depth + 1))
                }
            </React.Fragment>
        );
    };

    const parentMenus = menus.filter(m => !m.codeParent || m.codeParent === '').sort((a, b) => a.order - b.order);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Phân quyền: ${role.title}`}
            size="xl"
        >
            <div className={styles.container}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Menu / Chức năng</th>
                                <th>Xem</th>
                                <th>Thêm</th>
                                <th>Sửa</th>
                                <th>Xóa</th>
                                <th>Duyệt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parentMenus.map(m => renderMenuRow(m))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.footer}>
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={handleSave} isLoading={loading}>Lưu phân quyền</Button>
                </div>
            </div>
        </Modal>
    );
};

const Checkbox: React.FC<{ checked: boolean, onChange: () => void }> = ({ checked, onChange }) => (
    <button className={styles.checkbox} onClick={onChange}>
        {checked ? <CheckSquare size={20} color="#3b82f6" fill="#eff6ff" /> : <Square size={20} color="#d1d5db" />}
    </button>
);
