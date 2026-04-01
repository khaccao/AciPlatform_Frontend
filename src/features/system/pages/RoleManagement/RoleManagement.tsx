import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { systemService, type Role } from '../../services/system.service';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Input } from '../../../../shared/ui/Input/Input';
import { toast } from 'sonner';
import { RolePermissionModal } from './RolePermissionModal';
import styles from './RoleManagement.module.scss';

import { useAppSelector } from '../../../../app/hooks';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { hrService } from '../../../hr/services/hr.service'; // For companies

export const RoleManagement: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<Partial<Role>>({
        code: '',
        title: '',
        note: '',
        parentId: undefined,
        companyCode: ''
    });

    // SuperAdmin Company Filter
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('');
    const isSuperAdmin = user?.roleName?.includes('SuperAdmin');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const fetchRoles = async () => {
        try {
            // Pass company filter if SuperAdmin and selected
            const data = await systemService.getRoles(selectedCompanyFilter);
            setRoles(data || []);
        } catch (error) {
            toast.error('Không thể tải danh sách quyền');
        }
    };

    const fetchCompanies = async () => {
        if (isSuperAdmin) {
            try {
                const data = await hrService.getCompanies();
                setCompanies(data || []);
            } catch (error) {
                console.error("Failed to load companies");
            }
        }
    }

    useEffect(() => {
        fetchCompanies();
        fetchRoles();
    }, [selectedCompanyFilter]); // Refetch when filter changes

    const toggleRow = (roleId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(roleId)) {
            newExpanded.delete(roleId);
        } else {
            newExpanded.add(roleId);
        }
        setExpandedRows(newExpanded);
    };

    const handleOpenCreate = () => {
        setSelectedRole(null);
        // If filtering by company, default new role to that company
        setFormData({
            code: '',
            title: '',
            note: '',
            parentId: undefined,
            companyCode: selectedCompanyFilter || user?.companyCode || ''
        });
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            code: role.code,
            title: role.title,
            note: role.note,
            parentId: role.parentId,
            companyCode: role.companyCode
        });
        setIsEditModalOpen(true);
    };

    const handleOpenPermissions = (role: Role) => {
        setSelectedRole(role);
        setIsPermissionModalOpen(true);
    };

    const handleSaveRole = async () => {
        if (!formData.title?.trim()) {
            toast.error('Vui lòng nhập tên nhóm quyền');
            return;
        }

        try {
            if (selectedRole) {
                await systemService.updateRole(selectedRole.id, {
                    ...selectedRole,
                    ...formData,
                    parentId: formData.parentId || undefined // Ensure undefined is sent if empty
                });
                toast.success('Cập nhật thành công');
            } else {
                await systemService.createRole(formData);
                toast.success('Tạo mới thành công');
            }
            setIsEditModalOpen(false);
            fetchRoles();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa quyền này?')) return;
        try {
            await systemService.deleteRole(id);
            toast.success('Xóa thành công');
            fetchRoles();
        } catch (error) {
            toast.error('Không thể xóa quyền này');
        }
    };


    // Recursive Render Function
    const renderRoleRow = (role: Role, level: number = 0) => {
        // Find children
        const children = roles.filter(r => r.parentId === role.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedRows.has(role.id);

        return (
            <React.Fragment key={role.id}>
                <tr className={level > 0 ? styles.childRow : ''}>
                    <td className={styles.code} style={{ paddingLeft: `${level * 24 + 12}px` }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {hasChildren && (
                                <button
                                    onClick={() => toggleRow(role.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '4px', padding: 0 }}
                                >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            )}
                            {!hasChildren && level > 0 && <span style={{ width: '20px' }} />}
                            {role.code}
                        </div>
                    </td>
                    <td className={styles.title}>{role.title}</td>
                    <td className={styles.note}>{role.note}</td>
                    {isSuperAdmin && <td>{role.companyCode}</td>}
                    <td className={styles.actions}>
                        <button
                            className={styles.actionBtn}
                            onClick={() => handleOpenPermissions(role)}
                            title="Phân quyền menu"
                        >
                            <Shield size={18} color="#10b981" />
                        </button>
                        <button className={styles.actionBtn} onClick={() => handleOpenEdit(role)}>
                            <Edit size={18} color="#3b82f6" />
                        </button>
                        {!role.isNotAllowDelete && (
                            <button className={styles.actionBtn} onClick={() => handleDeleteRole(role.id)}>
                                <Trash2 size={18} color="#ef4444" />
                            </button>
                        )}
                    </td>
                </tr>
                {isExpanded && children.map(child => renderRoleRow(child, level + 1))}
            </React.Fragment>
        );
    };

    // Get root nodes (roles with no parent OR parent not in the list)
    const rootRoles = roles.filter(r => !r.parentId || !roles.some(parent => parent.id === r.parentId));


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Quản lý Nhóm quyền</h1>
                    <p>Quản lý các vai trò và phân quyền trong hệ thống</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {isSuperAdmin && (
                        <select
                            style={{
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                cursor: 'pointer'
                            }}
                            value={selectedCompanyFilter}
                            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                        >
                            <option value="">-- Tất cả công ty --</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                            ))}
                        </select>
                    )}
                    <Button onClick={handleOpenCreate}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        Tạo quyền mới
                    </Button>
                </div>
            </div>

            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Tên nhóm quyền</th>
                            <th>Mô tả</th>
                            {isSuperAdmin && <th>Công ty</th>}
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rootRoles.map(role => renderRoleRow(role))}
                        {rootRoles.length === 0 && (
                            <tr>
                                <td colSpan={isSuperAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '20px' }}>
                                    Chưa có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={selectedRole ? 'Chỉnh sửa Nhóm quyền' : 'Tạo Nhóm quyền mới'}
            >
                <div className={styles.form}>
                    <Input
                        label="Mã nhóm quyền (VD: SALE)"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        disabled={!!selectedRole}
                    />
                    <Input
                        label="Tên nhóm quyền"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />

                    {/* SuperAdmin can edit CompanyCode */}
                    {isSuperAdmin && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                Công ty
                            </label>
                            <select
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                                value={formData.companyCode || ''}
                                onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })}
                            >
                                <option value="">-- Hệ thống (Global) --</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Add Parent Role Selector */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                            Nhóm quyền cha (Tùy chọn)
                        </label>
                        <select
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            value={formData.parentId || ''}
                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : undefined })}
                        >
                            <option value="">-- Không có cha --</option>
                            {roles
                                .filter(r => r.id !== selectedRole?.id) // Prevent self-parenting
                                .map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.title} ({r.code})
                                    </option>
                                ))}
                        </select>
                    </div>

                    <Input
                        label="Mô tả"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                    <div className={styles.modalFooter}>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleSaveRole}>Lưu</Button>
                    </div>
                </div>
            </Modal>

            {selectedRole && (
                <RolePermissionModal
                    isOpen={isPermissionModalOpen}
                    onClose={() => setIsPermissionModalOpen(false)}
                    role={selectedRole}
                />
            )}
        </div>
    );
};
