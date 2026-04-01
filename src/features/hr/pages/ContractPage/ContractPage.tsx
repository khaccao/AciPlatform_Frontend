
import React, { useEffect, useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    Download,
    Filter,
    Clock,
    CheckCircle,
    Edit2,
    Trash2
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button/Button';
import { hrService, userService } from '../../services/hr.service';
import { Input } from '../../../../shared/ui/Input/Input';
import { Select } from '../../../../shared/ui/Select/Select';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import styles from './ContractPage.module.scss';
import { toast } from 'sonner';
import type { UserContractHistory, ContractType, UserContractHistoryRequest, User } from '../../hr.types';

export const ContractPage: React.FC = () => {
    const [contracts, setContracts] = useState<UserContractHistory[]>([]);
    const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [currentContract, setCurrentContract] = useState<Partial<UserContractHistoryRequest>>({});
    const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [contractsData, typesData, usersData] = await Promise.all([
                hrService.contractHistories.getAll(),
                hrService.contractTypes.getAll(),
                userService.getAllActive()
            ]);
            setContracts(contractsData);
            setContractTypes(typesData);
            setUsers(usersData.data || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setCurrentContract({
            userId: 0,
            contractTypeId: 0,
            signedDate: new Date().toISOString().split('T')[0],
            startDate: new Date().toISOString().split('T')[0],
            note: ''
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (c: UserContractHistory) => {
        setIsEditing(true);
        setSelectedContractId(c.id);
        setCurrentContract({
            userId: c.userId,
            contractTypeId: c.contractTypeId,
            signedDate: c.signedDate?.split('T')[0],
            startDate: c.startDate?.split('T')[0],
            endDate: c.endDate?.split('T')[0],
            note: c.note
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            if (isEditing && selectedContractId) {
                await hrService.contractHistories.update(selectedContractId, currentContract as UserContractHistoryRequest);
                toast.success('Cập nhật hợp đồng thành công');
            } else {
                await hrService.contractHistories.create(currentContract as UserContractHistoryRequest);
                toast.success('Tạo hợp đồng mới thành công');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi lưu hợp đồng');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) return;
        try {
            await hrService.contractHistories.delete(id);
            toast.success('Xóa hợp đồng thành công');
            fetchData();
        } catch (error) {
            toast.error('Không thể xóa hợp đồng');
        }
    };

    const getUserName = (id: number) => {
        return users.find(u => u.id === id)?.fullName || `NV #${id}`;
    };

    const getTypeName = (id: number) => {
        return contractTypes.find(t => t.id === id)?.name || 'N/A';
    };

    const getStatus = (endDate?: string) => {
        if (!endDate) return { label: 'Vô thời hạn', class: styles.active };
        const end = new Date(endDate);
        const now = new Date();
        if (end < now) return { label: 'Đã hết hạn', class: styles.expired };
        const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 30) return { label: 'Sắp hết hạn', class: styles.warning };
        return { label: 'Đang hiệu lực', class: styles.active };
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Quản lý Hợp đồng</h1>
                    <p>Theo dõi và quản lý hợp đồng lao động của nhân viên</p>
                </div>
                <div className={styles.actions}>
                    <Button variant="outline" icon={<Download size={18} />}>Xuất file</Button>
                    <Button variant="primary" icon={<Plus size={18} />} onClick={handleAddClick}>Ký hợp đồng mới</Button>
                </div>
            </header>

            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo ID nhân viên hoặc tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <Filter size={16} />
                        <span>Bộ lọc:</span>
                        <select>
                            <option>Tất cả loại hợp đồng</option>
                            {contractTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <select>
                            <option>Tất cả trạng thái</option>
                            <option>Đang hiệu lực</option>
                            <option>Sắp hết hạn</option>
                            <option>Đã hết hạn</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.statsSummary}>
                <div className={styles.statItem}>
                    <div className={styles.icon} style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
                        <FileText size={20} />
                    </div>
                    <div className={styles.info}>
                        <span className={styles.label}>Tổng hợp đồng</span>
                        <span className={styles.value}>{contracts.length}</span>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.icon} style={{ backgroundColor: '#dcfce7', color: '#22c55e' }}>
                        <CheckCircle size={20} />
                    </div>
                    <div className={styles.info}>
                        <span className={styles.label}>Đang hiệu lực</span>
                        <span className={styles.value}>{contracts.filter(c => getStatus(c.endDate).label === 'Đang hiệu lực').length}</span>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.icon} style={{ backgroundColor: '#ffedd5', color: '#f97316' }}>
                        <Clock size={20} />
                    </div>
                    <div className={styles.info}>
                        <span className={styles.label}>Sắp hết hạn</span>
                        <span className={styles.value}>{contracts.filter(c => getStatus(c.endDate).label === 'Sắp hết hạn').length}</span>
                    </div>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Mã số</th>
                                <th>Nhân viên</th>
                                <th>Loại hợp đồng</th>
                                <th>Ngày ký</th>
                                <th>Ngày hết hạn</th>
                                <th>Trạng thái</th>
                                <th className={styles.actionsColumn}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className={styles.skeletonRow}>
                                        <td colSpan={7}><div className={styles.skeleton}></div></td>
                                    </tr>
                                ))
                            ) : contracts.length > 0 ? (
                                contracts.map((contract) => {
                                    const status = getStatus(contract.endDate);
                                    return (
                                        <tr key={contract.id}>
                                            <td className={styles.id}>HD-{contract.id.toString().padStart(4, '0')}</td>
                                            <td>
                                                <div className={styles.employeeInfo}>
                                                    <div className={styles.avatar}>{getUserName(contract.userId).charAt(0)}</div>
                                                    <span>{getUserName(contract.userId)}</span>
                                                </div>
                                            </td>
                                            <td><span className={styles.typeBadge}>{getTypeName(contract.contractTypeId)}</span></td>
                                            <td>{contract.signedDate ? new Date(contract.signedDate).toLocaleDateString('vi-VN') : '-'}</td>
                                            <td>{contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${status.class}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className={styles.actionsColumn}>
                                                <div className={styles.btnGroup}>
                                                    <button className={styles.actionBtn} title="Sửa" onClick={() => handleEditClick(contract)}><Edit2 size={16} /></button>
                                                    <button className={styles.actionBtn} title="Xóa" onClick={() => handleDelete(contract.id)}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className={styles.empty}>Không tìm thấy hợp đồng nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Sửa hợp đồng' : 'Ký hợp đồng mới'}
                size="lg"
            >
                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGrid}>
                        <Select
                            label="Nhân viên"
                            required
                            options={[
                                { label: '-- Chọn nhân viên --', value: '' },
                                ...users.map(u => ({ label: u.fullName || u.username, value: u.id }))
                            ]}
                            value={currentContract.userId || ''}
                            onChange={(e) => setCurrentContract({ ...currentContract, userId: Number(e.target.value) })}
                        />
                        <Select
                            label="Loại hợp đồng"
                            required
                            options={[
                                { label: '-- Chọn loại hợp đồng --', value: '' },
                                ...contractTypes.map(t => ({ label: t.name, value: t.id }))
                            ]}
                            value={currentContract.contractTypeId || ''}
                            onChange={(e) => setCurrentContract({ ...currentContract, contractTypeId: Number(e.target.value) })}
                        />
                        <Input
                            label="Ngày ký"
                            type="date"
                            required
                            value={currentContract.signedDate || ''}
                            onChange={(e) => setCurrentContract({ ...currentContract, signedDate: e.target.value })}
                        />
                        <Input
                            label="Ngày bắt đầu"
                            type="date"
                            required
                            value={currentContract.startDate || ''}
                            onChange={(e) => setCurrentContract({ ...currentContract, startDate: e.target.value })}
                        />
                        <Input
                            label="Ngày kết thúc"
                            type="date"
                            value={currentContract.endDate || ''}
                            onChange={(e) => setCurrentContract({ ...currentContract, endDate: e.target.value })}
                        />
                        <Input
                            label="Ghi chú"
                            value={currentContract.note || ''}
                            onChange={(e) => setCurrentContract({ ...currentContract, note: e.target.value })}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="submit" variant="primary" isLoading={formLoading}>Lưu hợp đồng</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
