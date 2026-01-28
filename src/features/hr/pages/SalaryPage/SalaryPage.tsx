
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
import styles from './SalaryPage.module.scss';
import { toast } from 'sonner';
import type { Allowance, SalaryType } from '../../hr.types';

export const SalaryPage: React.FC = () => {
    const [allowances, setAllowances] = useState<Allowance[]>([]);
    const [salaryTypes, setSalaryTypes] = useState<SalaryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'allowances' | 'salaryTypes'>('allowances');

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
                    <Button variant="primary" icon={<Plus size={18} />}>Thêm cấu trúc mới</Button>
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
                                                        <button className={styles.actionBtn}><Edit2 size={16} /></button>
                                                        <button className={styles.actionBtn}><Trash2 size={16} /></button>
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
                                                        <button className={styles.actionBtn}><Edit2 size={16} /></button>
                                                        <button className={styles.actionBtn}><Trash2 size={16} /></button>
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
        </div>
    );
};
