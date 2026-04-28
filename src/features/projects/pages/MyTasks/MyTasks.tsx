import React, { useState, useEffect } from 'react';
import ProjectService from '../../services/project.service';
import type { ProjectTask } from '../../types/project.types';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { toast } from 'sonner';
import { 
    Clock, 
    AlertCircle, 
    BookOpen,
    Send
} from 'lucide-react';
import dayjs from 'dayjs';
import styles from './MyTasks.module.scss';

const MyTasks: React.FC = () => {
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportData, setReportData] = useState({
        progress: 0,
        status: '',
        note: ''
    });

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const data = await ProjectService.getMyTasks();
            setTasks(data);
        } catch (error) {
            toast.error('Không thể tải nhiệm vụ của bạn');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReport = (task: ProjectTask) => {
        setSelectedTask(task);
        setReportData({
            progress: task.progress,
            status: task.status,
            note: ''
        });
        setIsReportModalOpen(true);
    };

    const handleSubmitReport = async () => {
        if (!selectedTask) return;
        try {
            await ProjectService.updateTaskProgress(
                selectedTask.id, 
                reportData.progress, 
                reportData.status
            );
            toast.success('Báo cáo tiến độ thành công');
            setIsReportModalOpen(false);
            fetchMyTasks();
        } catch (error) {
            toast.error('Gửi báo cáo thất bại');
        }
    };

    const getStatusLevel = (status: string) => {
        switch (status) {
            case 'Todo': return { label: 'Chờ thực hiện', color: '#64748b' };
            case 'InProgress': return { label: 'Đang nghiên cứu', color: '#3b82f6' };
            case 'Review': return { label: 'Chờ thẩm định', color: '#f59e0b' };
            case 'Done': return { label: 'Hoàn thành', color: '#10b981' };
            default: return { label: status, color: '#64748b' };
        }
    };

    if (loading) return <div className={styles.loading}>Đang tải nhiệm vụ nghiên cứu...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Nhiệm vụ của tôi</h1>
                    <p>Theo dõi và báo cáo tiến độ các đề tài nghiên cứu được giao</p>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>{tasks.length}</span>
                        <span className={styles.statLab}>Tổng task</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>
                            {tasks.filter(t => t.status !== 'Done').length}
                        </span>
                        <span className={styles.statLab}>Đang làm</span>
                    </div>
                </div>
            </div>

            <div className={styles.taskList}>
                {tasks.length === 0 ? (
                    <div className={styles.empty}>
                        <BookOpen size={48} />
                        <p>Bạn chưa được giao nhiệm vụ nghiên cứu nào</p>
                    </div>
                ) : (
                    tasks.map(task => {
                        const status = getStatusLevel(task.status);
                        const isOverdue = dayjs().isAfter(dayjs(task.dueDate)) && task.status !== 'Done';

                        return (
                            <div key={task.id} className={styles.taskCard}>
                                <div className={styles.taskMain}>
                                    <div className={styles.taskIcon} style={{ background: `${status.color}15`, color: status.color }}>
                                        <Clock size={20} />
                                    </div>
                                    <div className={styles.taskInfo}>
                                        <h3>{task.name}</h3>
                                        <p>{task.description || 'Không có mô tả chi tiết'}</p>
                                        <div className={styles.taskMeta}>
                                            <span className={styles.metaItem}>
                                                <Clock size={14} /> Hạn: {dayjs(task.dueDate).format('DD/MM/YYYY')}
                                                {isOverdue && <span className={styles.overdue}><AlertCircle size={12} /> Quá hạn</span>}
                                            </span>
                                            <span className={styles.statusTag} style={{ color: status.color, background: `${status.color}10` }}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.taskAction}>
                                    <div className={styles.progressCircle}>
                                        <svg viewBox="0 0 36 36">
                                            <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className={styles.circle} style={{ strokeDasharray: `${task.progress}, 100` }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        </svg>
                                        <span>{task.progress}%</span>
                                    </div>
                                    <Button variant="outline" onClick={() => handleOpenReport(task)}>
                                        Cập nhật tiến độ <Send size={16} style={{ marginLeft: '8px' }} />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Modal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Báo cáo tiến độ đề tài"
            >
                <div className={styles.reportForm}>
                    <p className={styles.taskRef}>Nhiệm vụ: <strong>{selectedTask?.name}</strong></p>
                    
                    <div className={styles.formGroup}>
                        <label>Tiến độ thực tế (%)</label>
                        <div className={styles.sliderWrapper}>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={reportData.progress}
                                onChange={e => setReportData({...reportData, progress: Number(e.target.value)})}
                            />
                            <span className={styles.rangeVal}>{reportData.progress}%</span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Trạng thái công việc</label>
                        <select 
                            className={styles.select}
                            value={reportData.status}
                            onChange={e => setReportData({...reportData, status: e.target.value})}
                        >
                            <option value="Todo">Chờ thực hiện</option>
                            <option value="InProgress">Đang triển khai</option>
                            <option value="Review">Gửi thẩm định (Review)</option>
                            <option value="Done">Hoàn thành</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ghi chú nghiên cứu / Kết quả sơ bộ</label>
                        <textarea 
                            className={styles.textarea}
                            placeholder="Nhập ghi chú hoặc kết quả nghiên cứu trong giai đoạn này..."
                            value={reportData.note}
                            onChange={e => setReportData({...reportData, note: e.target.value})}
                        />
                    </div>

                    <div className={styles.modalFooter}>
                        <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleSubmitReport}>Gửi báo cáo</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MyTasks;
