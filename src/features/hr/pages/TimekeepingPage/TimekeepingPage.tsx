
import React, { useEffect, useState } from 'react';
import {
    Calendar as CalendarIcon,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Watch,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button/Button';
import { hrService } from '../../services/hr.service';
import styles from './TimekeepingPage.module.scss';
import { toast } from 'sonner';
import type { TimeKeepingEntry } from '../../hr.types';

export const TimekeepingPage: React.FC = () => {
    const [entries, setEntries] = useState<TimeKeepingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'calendar'>('list');

    useEffect(() => {
        fetchTimekeeping();
    }, []);

    const fetchTimekeeping = async () => {
        try {
            setLoading(true);
            const data = await hrService.timekeeping.getAll();
            setEntries(data);
        } catch (error) {
            toast.error('Không thể tải dữ liệu chấm công');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Đi làm đúng giờ', value: '92%', icon: <CheckCircle2 size={20} />, color: '#22c55e' },
        { label: 'Đi muộn/Về sớm', value: '5%', icon: <Watch size={20} />, color: '#f59e0b' },
        { label: 'Nghỉ có phép', value: '3%', icon: <CalendarIcon size={20} />, color: '#0ea5e9' },
        { label: 'Nghỉ không phép', value: '0%', icon: <XCircle size={20} />, color: '#ef4444' },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Chấm công & Thời gian</h1>
                    <p>Theo dõi thời gian làm việc và chuyên cần của nhân viên</p>
                </div>
                <div className={styles.actions}>
                    <div className={styles.viewTabs}>
                        <button
                            className={`${styles.viewTab} ${view === 'list' ? styles.active : ''}`}
                            onClick={() => setView('list')}
                        >
                            Danh sách
                        </button>
                        <button
                            className={`${styles.viewTab} ${view === 'calendar' ? styles.active : ''}`}
                            onClick={() => setView('calendar')}
                        >
                            Lịch
                        </button>
                    </div>
                    <Button variant="primary" icon={<Watch size={18} />}>Chốt công tháng</Button>
                </div>
            </header>

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            <span className={styles.statValue}>{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input type="text" placeholder="Tìm kiếm nhân viên..." />
                    </div>
                    <div className={styles.dateSelector}>
                        <button><CalendarIcon size={16} /> Tháng này</button>
                    </div>
                </div>

                {view === 'list' ? (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nhân viên</th>
                                    <th>Ngày làm việc</th>
                                    <th>Giờ vào</th>
                                    <th>Giờ ra</th>
                                    <th>Tổng giờ</th>
                                    <th>Trạng thái</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i}><td colSpan={7} className={styles.skeleton}></td></tr>
                                    ))
                                ) : entries.length > 0 ? (
                                    entries.map((entry) => (
                                        <tr key={entry.id}>
                                            <td>
                                                <div className={styles.user}>
                                                    <div className={styles.avatar}>ID:{entry.userId}</div>
                                                    <span>Nhân viên #{entry.userId}</span>
                                                </div>
                                            </td>
                                            <td>{new Date(entry.workDate).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <div className={styles.timeInline}>
                                                    <ArrowUpRight size={14} className={styles.checkIn} />
                                                    {entry.checkIn || '--:--'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.timeInline}>
                                                    <ArrowDownLeft size={14} className={styles.checkOut} />
                                                    {entry.checkOut || '--:--'}
                                                </div>
                                            </td>
                                            <td className={styles.hours}>{entry.workingHours || 0}h</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${entry.checkIn ? styles.full : styles.missing}`}>
                                                    {entry.checkIn ? 'Đã chấm công' : 'Chưa chấm công'}
                                                </span>
                                            </td>
                                            <td className={styles.note}>{entry.note || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={7} className={styles.empty}>Không có dữ liệu chấm công</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.calendarPlaceholder}>
                        <CalendarIcon size={48} />
                        <p>Tính năng Lịch Chấm Công đang được hoàn thiện</p>
                    </div>
                )}
            </div>
        </div>
    );
};
