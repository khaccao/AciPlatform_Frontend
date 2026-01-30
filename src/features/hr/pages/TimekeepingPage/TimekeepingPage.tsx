
import React, { useEffect, useState } from 'react';
import {
    Calendar as CalendarIcon,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Watch,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    Plus
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button/Button';
import { hrService, userService } from '../../services/hr.service';
import { Input } from '../../../../shared/ui/Input/Input';
import { Select } from '../../../../shared/ui/Select/Select';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import styles from './TimekeepingPage.module.scss';
import { toast } from 'sonner';
import type { TimeKeepingEntry, User } from '../../hr.types';

export const TimekeepingPage: React.FC = () => {
    const [entries, setEntries] = useState<TimeKeepingEntry[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'calendar'>('list');

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<Partial<TimeKeepingEntry>>({});
    const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);

    useEffect(() => {
        fetchTimekeeping();
    }, []);

    const fetchTimekeeping = async () => {
        try {
            setLoading(true);
            const [data, usersData] = await Promise.all([
                hrService.timekeeping.getAll(),
                userService.getAllActive()
            ]);
            setEntries(data);
            setUsers(usersData.data || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu chấm công');
        } finally {
            setLoading(false);
        }
    };

    const getTimeString = (dateStr?: string) => {
        if (!dateStr) return '';
        if (!dateStr.includes('T')) return dateStr;
        return dateStr.split('T')[1].substring(0, 5);
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setCurrentEntry({
            userId: 0,
            workDate: new Date().toISOString().split('T')[0],
            checkIn: '08:00',
            checkOut: '17:00'
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (e: TimeKeepingEntry) => {
        setIsEditing(true);
        setSelectedEntryId(e.id);
        setCurrentEntry({
            userId: e.userId,
            workDate: e.workDate.split('T')[0],
            checkIn: getTimeString(e.checkIn),
            checkOut: getTimeString(e.checkOut),
            note: e.note
        });
        setIsModalOpen(true);
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setFormLoading(true);

            // Create full ISO strings for CheckIn/CheckOut by combining workDate
            const dateStr = currentEntry.workDate || new Date().toISOString().split('T')[0];

            const formatTime = (timeStr?: string) => {
                if (!timeStr) return undefined;
                if (timeStr.includes('T')) return timeStr; // Already ISO
                return `${dateStr}T${timeStr}:00`;
            };

            const dataToSave = {
                ...currentEntry,
                userId: Number(currentEntry.userId),
                workDate: dateStr,
                checkIn: formatTime(currentEntry.checkIn),
                checkOut: formatTime(currentEntry.checkOut)
            };

            if (isEditing && selectedEntryId) {
                await hrService.timekeeping.update(selectedEntryId, dataToSave as TimeKeepingEntry);
                toast.success('Cập nhật chấm công thành công');
            } else {
                await hrService.timekeeping.create(dataToSave as TimeKeepingEntry);
                toast.success('Thêm chấm công thành công');
            }
            setIsModalOpen(false);
            fetchTimekeeping();
        } catch (error: any) {
            console.error('Failed to save timekeeping', error);
            const errorMsg = error.response?.data?.errors
                ? JSON.stringify(error.response.data.errors)
                : (error.response?.data?.message || 'Có lỗi xảy ra khi lưu chấm công');
            toast.error(`Lỗi: ${errorMsg}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
        try {
            await hrService.timekeeping.delete(id);
            toast.success('Xóa thành công');
            fetchTimekeeping();
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    const getUserName = (id: number) => {
        return users.find(u => u.id === id)?.fullName || `NV #${id}`;
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
                    <Button variant="outline" icon={<Plus size={18} />} onClick={handleAddClick}>Thêm chấm công</Button>
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
                                                    <div className={styles.avatar}>{getUserName(entry.userId).charAt(0)}</div>
                                                    <span>{getUserName(entry.userId)}</span>
                                                </div>
                                            </td>
                                            <td>{new Date(entry.workDate).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <div className={styles.timeInline}>
                                                    <ArrowUpRight size={14} className={styles.checkIn} />
                                                    {entry.checkIn ? getTimeString(entry.checkIn) : '--:--'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.timeInline}>
                                                    <ArrowDownLeft size={14} className={styles.checkOut} />
                                                    {entry.checkOut ? getTimeString(entry.checkOut) : '--:--'}
                                                </div>
                                            </td>
                                            <td className={styles.hours}>{entry.workingHours || 0}h</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${entry.checkIn ? styles.full : styles.missing}`}>
                                                    {entry.checkIn ? 'Đã chấm công' : 'Chưa chấm công'}
                                                </span>
                                            </td>
                                            <td className={styles.note}>{entry.note || '-'}</td>
                                            <td className={styles.actions}>
                                                <button className={styles.actionBtn} onClick={() => handleEditClick(entry)}><Edit2 size={16} /></button>
                                                <button className={styles.actionBtn} onClick={() => handleDelete(entry.id)}><Trash2 size={16} /></button>
                                            </td>
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Sửa chấm công' : 'Thêm chấm công mới'}
                size="md"
            >
                <form onSubmit={handleSave} className={styles.form}>
                    <Select
                        label="Nhân viên"
                        required
                        options={[
                            { label: '-- Chọn nhân viên --', value: '' },
                            ...users.map(u => ({ label: u.fullName || u.username, value: u.id }))
                        ]}
                        value={currentEntry.userId || ''}
                        onChange={(e) => setCurrentEntry({ ...currentEntry, userId: Number(e.target.value) })}
                    />
                    <Input
                        label="Ngày làm việc"
                        type="date"
                        required
                        value={currentEntry.workDate || ''}
                        onChange={(e) => setCurrentEntry({ ...currentEntry, workDate: e.target.value })}
                    />
                    <div className={styles.formGrid}>
                        <Input
                            label="Giờ vào"
                            type="time"
                            value={currentEntry.checkIn || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, checkIn: e.target.value })}
                        />
                        <Input
                            label="Giờ ra"
                            type="time"
                            value={currentEntry.checkOut || ''}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, checkOut: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Ghi chú"
                        value={currentEntry.note || ''}
                        onChange={(e) => setCurrentEntry({ ...currentEntry, note: e.target.value })}
                    />
                    <div className={styles.formActions}>
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="submit" variant="primary" isLoading={formLoading}>Lưu</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
