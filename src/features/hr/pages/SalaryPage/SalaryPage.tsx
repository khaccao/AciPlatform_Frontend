
import React, { useEffect, useState } from 'react';
import {
    CreditCard,
    Plus,
    Search,
    DollarSign,
    TrendingUp,
    PieChart,
    ChevronRight,
    Edit2,
    Trash2
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button/Button';
import { hrService } from '../../services/hr.service';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import styles from './SalaryPage.module.scss';
import { toast } from 'sonner';
import type { Allowance, SalaryType } from '../../hr.types';

export const SalaryPage: React.FC = () => {
    const [allowances, setAllowances] = useState<Allowance[]>([]);
    const [salaryTypes, setSalaryTypes] = useState<SalaryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'allowances' | 'salaryTypes'>('allowances');

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Allowance Form
    const [currentAllowance, setCurrentAllowance] = useState<Partial<Allowance>>({});
    const [selectedAllowanceId, setSelectedAllowanceId] = useState<number | null>(null);

    // SalaryType Form
    const [currentSalaryType, setCurrentSalaryType] = useState<Partial<SalaryType>>({});
    const [selectedSalaryId, setSelectedSalaryId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [allowanceData, salaryData] = await Promise.all([
                hrService.allowances.getAll(),
                hrService.salaryTypes.getAll()
            ]);
            setAllowances(allowanceData);
            setSalaryTypes(salaryData);
        } catch (error) {
            toast.error('Không thể tải dữ liệu lương');
        } finally {
            setLoading(false);
        }
    };

    // Allowance Handlers
    const handleAddAllowance = () => {
        setIsEditing(false);
        setCurrentAllowance({ name: '', amount: 0, code: '', description: '' });
        setIsModalOpen(true);
    };

    const handleEditAllowance = (a: Allowance) => {
        setIsEditing(true);
        setSelectedAllowanceId(a.id);
        setCurrentAllowance({ ...a });
        setIsModalOpen(true);
    };

    const handleSaveAllowance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            if (isEditing && selectedAllowanceId) {
                await hrService.allowances.update(selectedAllowanceId, currentAllowance as Allowance);
                toast.success('Cập nhật phụ cấp thành công');
            } else {
                await hrService.allowances.create(currentAllowance as Allowance);
                toast.success('Thêm phụ cấp thành công');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi lưu phụ cấp');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteAllowance = async (id: number) => {
        if (!window.confirm('Xóa phụ cấp này?')) return;
        try {
            await hrService.allowances.delete(id);
            toast.success('Đã xóa');
            fetchData();
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    // SalaryType Handlers
    const handleAddSalaryType = () => {
        setIsEditing(false);
        setCurrentSalaryType({ name: '', baseAmount: 0, code: '', formula: '' });
        setIsModalOpen(true);
    };

    const handleEditSalaryType = (s: SalaryType) => {
        setIsEditing(true);
        setSelectedSalaryId(s.id);
        setCurrentSalaryType({ ...s });
        setIsModalOpen(true);
    };

    const handleSaveSalaryType = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            if (isEditing && selectedSalaryId) {
                await hrService.salaryTypes.update(selectedSalaryId, currentSalaryType as SalaryType);
                toast.success('Cập nhật loại lương thành công');
            } else {
                await hrService.salaryTypes.create(currentSalaryType as SalaryType);
                toast.success('Thêm loại lương thành công');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi lưu loại lương');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteSalaryType = async (id: number) => {
        if (!window.confirm('Xóa loại lương này?')) return;
        try {
            await hrService.salaryTypes.delete(id);
            toast.success('Đã xóa');
            fetchData();
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Lương & Phúc lợi</h1>
                    <p>Quản lý các loại lương, phụ cấp và cấu trúc thu nhập</p>
                </div>
                <div className={styles.actions}>
                    <Button variant="outline" icon={<PieChart size={18} />}>Thống kê</Button>
                    <Button variant="primary" icon={<Plus size={18} />} onClick={activeTab === 'allowances' ? handleAddAllowance : handleAddSalaryType}>
                        {activeTab === 'allowances' ? 'Thêm phụ cấp' : 'Thêm loại lương'}
                    </Button>
                </div>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'allowances' ? styles.active : ''}`}
                    onClick={() => setActiveTab('allowances')}
                >
                    Phụ cấp
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'salaryTypes' ? styles.active : ''}`}
                    onClick={() => setActiveTab('salaryTypes')}
                >
                    Loại lương
                </button>
            </div>

            <div className={styles.grid}>
                <div className={styles.mainContent}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>{activeTab === 'allowances' ? 'Danh sách phụ cấp' : 'Các loại lương cơ bản'}</h3>
                            <div className={styles.searchBox}>
                                <Search size={18} />
                                <input type="text" placeholder="Tìm kiếm..." />
                            </div>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Mã số</th>
                                        <th>Tên gọi</th>
                                        <th>Mức tiền</th>
                                        <th>Mô tả</th>
                                        <th className={styles.actionsColumn}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className={styles.loading}>Đang tải...</td></tr>
                                    ) : activeTab === 'allowances' ? (
                                        allowances.map((item) => (
                                            <tr key={item.id}>
                                                <td className={styles.code}>{item.code || `AL-${item.id}`}</td>
                                                <td className={styles.name}>{item.name}</td>
                                                <td className={styles.amount}>{formatCurrency(item.amount)}</td>
                                                <td className={styles.desc}>{item.description || '-'}</td>
                                                <td className={styles.actionsColumn}>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.actionBtn} onClick={() => handleEditAllowance(item)}><Edit2 size={16} /></button>
                                                        <button className={styles.actionBtn} onClick={() => handleDeleteAllowance(item.id)}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        salaryTypes.map((item) => (
                                            <tr key={item.id}>
                                                <td className={styles.code}>{item.code || `SL-${item.id}`}</td>
                                                <td className={styles.name}>{item.name}</td>
                                                <td className={styles.amount}>{formatCurrency(item.baseAmount)}</td>
                                                <td className={styles.desc}>{item.formula || '-'}</td>
                                                <td className={styles.actionsColumn}>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.actionBtn} onClick={() => handleEditSalaryType(item)}><Edit2 size={16} /></button>
                                                        <button className={styles.actionBtn} onClick={() => handleDeleteSalaryType(item.id)}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.miniCard}>
                        <h4>Tổng chi lương tháng</h4>
                        <div className={styles.miniStat}>
                            <span className={styles.statValue}>~ 2.4B</span>
                            <span className={styles.statTrend}><TrendingUp size={14} /> +4.2%</span>
                        </div>
                    </div>

                    <div className={styles.quickLinks}>
                        <h4>Thao tác nhanh</h4>
                        <button className={styles.quickLink}>
                            <div className={styles.qlIcon}><DollarSign size={18} /></div>
                            <span>Tính lương tháng</span>
                            <ChevronRight size={16} />
                        </button>
                        <button className={styles.quickLink}>
                            <div className={styles.qlIcon}><CreditCard size={18} /></div>
                            <span>Cấu hình thuế TNCN</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Allowance Modal */}
            {activeTab === 'allowances' && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditing ? 'Sửa phụ cấp' : 'Thêm phụ cấp mới'}
                    size="md"
                >
                    <form onSubmit={handleSaveAllowance} className={styles.form}>
                        <Input
                            label="Tên phụ cấp"
                            required
                            value={currentAllowance.name || ''}
                            onChange={(e) => setCurrentAllowance({ ...currentAllowance, name: e.target.value })}
                        />
                        <Input
                            label="Mã phụ cấp"
                            value={currentAllowance.code || ''}
                            onChange={(e) => setCurrentAllowance({ ...currentAllowance, code: e.target.value })}
                        />
                        <Input
                            label="Số tiền"
                            type="number"
                            required
                            value={currentAllowance.amount || 0}
                            onChange={(e) => setCurrentAllowance({ ...currentAllowance, amount: Number(e.target.value) })}
                        />
                        <Input
                            label="Mô tả"
                            value={currentAllowance.description || ''}
                            onChange={(e) => setCurrentAllowance({ ...currentAllowance, description: e.target.value })}
                        />
                        <div className={styles.formActions}>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="submit" variant="primary" isLoading={formLoading}>Lưu</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* SalaryType Modal */}
            {activeTab === 'salaryTypes' && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditing ? 'Sửa loại lương' : 'Thêm loại lương mới'}
                    size="md"
                >
                    <form onSubmit={handleSaveSalaryType} className={styles.form}>
                        <Input
                            label="Tên loại lương"
                            required
                            value={currentSalaryType.name || ''}
                            onChange={(e) => setCurrentSalaryType({ ...currentSalaryType, name: e.target.value })}
                        />
                        <Input
                            label="Mã loại"
                            value={currentSalaryType.code || ''}
                            onChange={(e) => setCurrentSalaryType({ ...currentSalaryType, code: e.target.value })}
                        />
                        <Input
                            label="Mức cơ bản"
                            type="number"
                            required
                            value={currentSalaryType.baseAmount || 0}
                            onChange={(e) => setCurrentSalaryType({ ...currentSalaryType, baseAmount: Number(e.target.value) })}
                        />
                        <Input
                            label="Công thức"
                            value={currentSalaryType.formula || ''}
                            onChange={(e) => setCurrentSalaryType({ ...currentSalaryType, formula: e.target.value })}
                        />
                        <div className={styles.formActions}>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="submit" variant="primary" isLoading={formLoading}>Lưu</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};
