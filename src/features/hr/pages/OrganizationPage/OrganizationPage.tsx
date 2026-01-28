
import React, { useEffect, useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Search
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button/Button';
import { hrService } from '../../services/hr.service';
import styles from './OrganizationPage.module.scss';
import { toast } from 'sonner';
import type { Department, PositionDetail } from '../../hr.types';

export const OrganizationPage: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<PositionDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dept' | 'pos'>('dept');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptData, posData] = await Promise.all([
                hrService.departments.getAll(),
                hrService.positions.getAll()
            ]);
            setDepartments(deptData);
            setPositions(posData);
        } catch (error) {
            console.error('Failed to fetch org data', error);
            toast.error('Không thể tải dữ liệu tổ chức');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Cơ cấu Tổ chức</h1>
                    <p>Quản lý phòng ban, bộ phận và hệ thống chức danh trong doanh nghiệp.</p>
                </div>
                <div className={styles.actions}>
                    <Button variant="primary" leftIcon={<Plus size={18} />}>
                        {activeTab === 'dept' ? 'Thêm phòng ban' : 'Thêm chức vụ'}
                    </Button>
                </div>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'dept' ? styles.active : ''}`}
                    onClick={() => setActiveTab('dept')}
                >
                    Phòng ban
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'pos' ? styles.active : ''}`}
                    onClick={() => setActiveTab('pos')}
                >
                    Chức vụ
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'dept' ? (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>Danh sách Phòng ban</h3>
                            <div className={styles.searchBox}>
                                <Search size={16} />
                                <input type="text" placeholder="Tìm phòng ban..." />
                            </div>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Mã PB</th>
                                        <th>Tên phòng ban</th>
                                        <th>Phòng ban cha</th>
                                        <th>Sắp xếp</th>
                                        <th className={styles.actionsColumn}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className={styles.loading}>Đang tải...</td></tr>
                                    ) : departments.length === 0 ? (
                                        <tr><td colSpan={5} className={styles.empty}>Chưa có phòng ban nào</td></tr>
                                    ) : departments.map(dept => (
                                        <tr key={dept.id}>
                                            <td><span className={styles.code}>{dept.code || '---'}</span></td>
                                            <td><span className={styles.name}>{dept.name}</span></td>
                                            <td>{departments.find(d => d.id === dept.parentId)?.name || '-'}</td>
                                            <td>{dept.order || 0}</td>
                                            <td className={styles.actionsColumn}>
                                                <div className={styles.actionBtns}>
                                                    <button className={styles.actionBtn}><Edit2 size={16} /></button>
                                                    <button className={styles.actionBtn}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>Danh sách Chức vụ</h3>
                            <div className={styles.searchBox}>
                                <Search size={16} />
                                <input type="text" placeholder="Tìm chức vụ..." />
                            </div>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Mã CV</th>
                                        <th>Tên chức vụ</th>
                                        <th>Phòng ban</th>
                                        <th>Ghi chú</th>
                                        <th className={styles.actionsColumn}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className={styles.loading}>Đang tải...</td></tr>
                                    ) : positions.length === 0 ? (
                                        <tr><td colSpan={5} className={styles.empty}>Chưa có chức vụ nào</td></tr>
                                    ) : positions.map(pos => (
                                        <tr key={pos.id}>
                                            <td><span className={styles.code}>{pos.code || '---'}</span></td>
                                            <td><span className={styles.name}>{pos.name}</span></td>
                                            <td>{departments.find(d => d.id === pos.departmentId)?.name || 'Tất cả'}</td>
                                            <td>{pos.note || '-'}</td>
                                            <td className={styles.actionsColumn}>
                                                <div className={styles.actionBtns}>
                                                    <button className={styles.actionBtn}><Edit2 size={16} /></button>
                                                    <button className={styles.actionBtn}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
