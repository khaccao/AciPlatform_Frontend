import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Settings, 
    Users, 
    CheckSquare, 
    FileText, 
    History, 
    Plus, 
    Upload,
    Calendar,
    Briefcase,
    Clock,
    BarChart3,
    Trash2
} from 'lucide-react';
import { userService } from '../../../hr/services/hr.service';
import ProjectService from '../../services/project.service';
import type { Project, ProjectTask } from '../../types/project.types';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Input } from '../../../../shared/ui/Input/Input';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import styles from './ProjectDetail.module.scss';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'knowledge' | 'history'>('overview');
    const [loading, setLoading] = useState(true);

    // Modal state for creating task
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    
    const [newTaskData, setNewTaskData] = useState({
        name: '',
        description: '',
        weight: 1,
        dueDate: '',
        assignedToUserId: undefined as number | undefined
    });

    const [newMemberData, setNewMemberData] = useState({
        userId: undefined as number | undefined,
        role: 'Researcher'
    });

    useEffect(() => {
        if (id) {
            fetchData();
            fetchEmployees();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const pId = Number(id);
            const [pData, tData, mData] = await Promise.all([
                ProjectService.getById(pId),
                ProjectService.getTasks(pId),
                ProjectService.getMembers(pId)
            ]);
            setProject(pData);
            setTasks(tData);
            setMembers(mData);
        } catch (error) {
            toast.error('Không thể tải thông tin dự án');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await userService.getAllActive();
            setEmployees(response.data || []);
        } catch (error) {
            console.error('Failed to fetch employees');
        }
    };

    const handleCreateTask = async () => {
        if (!newTaskData.name.trim()) {
            toast.error('Vui lòng nhập tên công việc');
            return;
        }

        try {
            await ProjectService.createTask({
                projectId: Number(id),
                ...newTaskData
            });
            toast.success('Giao việc thành công');
            setIsTaskModalOpen(false);
            setNewTaskData({ name: '', description: '', weight: 1, dueDate: '', assignedToUserId: undefined });
            fetchData();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi giao việc');
        }
    };

    const handleAddMember = async () => {
        if (!newMemberData.userId) {
            toast.error('Vui lòng chọn nhân sự');
            return;
        }

        try {
            await ProjectService.addMember(Number(id), newMemberData.userId, newMemberData.role);
            toast.success('Thêm thành viên thành công');
            setIsMemberModalOpen(false);
            setNewMemberData({ userId: undefined, role: 'Researcher' });
            fetchData();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thêm thành viên');
        }
    };

    const handleRemoveMember = async (userId: number) => {
        if (!window.confirm('Xóa thành viên này khỏi dự án?')) return;
        try {
            await ProjectService.removeMember(Number(id), userId);
            toast.success('Đã xóa thành viên');
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi xóa');
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm('Xóa công việc này?')) return;
        try {
            await ProjectService.deleteTask(taskId);
            toast.success('Đã xóa công việc');
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi xóa');
        }
    };

    const handleUpdateTaskStatus = async (taskId: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'Todo' ? 'InProgress' : 
                         currentStatus === 'InProgress' ? 'Review' : 'Done';
        
        try {
            await ProjectService.updateTaskProgress(taskId, nextStatus === 'Done' ? 100 : 50, nextStatus);
            toast.success('Cập nhật trạng thái thành công');
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi cập nhật');
        }
    };

    if (loading) return <div className={styles.loading}>Đang tải thông tin dự án...</div>;
    if (!project) return <div className={styles.error}>Không tìm thấy dự án</div>;

    return (
        <div className={styles.container}>
            {/* Header / Breadcrumb */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/projects')}>
                    <ArrowLeft size={20} />
                    Quay lại danh sách
                </button>
                <div className={styles.actions}>
                    <Button variant="outline" onClick={() => toast.info('Tính năng đang phát triển')}>
                        <Settings size={18} /> Cài đặt
                    </Button>
                    <Button onClick={() => setIsMemberModalOpen(true)}>
                        <Plus size={18} /> Thêm thành viên
                    </Button>
                </div>
            </div>

            {/* Project Summary info */}
            <div className={styles.projectCard}>
                <div className={styles.mainInfo}>
                    <div className={styles.titleInfo}>
                        <div className={styles.codeBadge}>{project.code}</div>
                        <h1>{project.name}</h1>
                        <span className={styles.statusBadge}>{project.status}</span>
                    </div>
                    <p className={styles.description}>{project.description}</p>
                    
                    <div className={styles.metaGrid}>
                        <div className={styles.metaItem}>
                            <Calendar size={16} />
                            <span>Bắt đầu: {dayjs(project.startDate).format('DD/MM/YYYY')}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <Calendar size={16} />
                            <span>Kết thúc: {dayjs(project.endDate).format('DD/MM/YYYY')}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <Briefcase size={16} />
                            <span>Ngân sách: {project.budget?.toLocaleString()} VNĐ</span>
                        </div>
                    </div>
                </div>

                <div className={styles.progressSection}>
                    <div className={styles.progressCircle}>
                        <svg viewBox="0 0 36 36" className={styles.circularChart}>
                            <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className={styles.circle} strokeDasharray={`${project.progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className={styles.percentage}>{project.progress}%</div>
                    </div>
                    <span className={styles.progressLabel}>Tiến độ tổng thể</span>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className={styles.tabsContainer}>
                <div 
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <BarChart3 size={18} /> Tổng quan
                </div>
                <div 
                    className={`${styles.tab} ${activeTab === 'tasks' ? styles.active : ''}`}
                    onClick={() => setActiveTab('tasks')}
                >
                    <CheckSquare size={18} /> Công việc & Giao việc
                </div>
                <div 
                    className={`${styles.tab} ${activeTab === 'knowledge' ? styles.active : ''}`}
                    onClick={() => setActiveTab('knowledge')}
                >
                    <FileText size={18} /> Tri thức & Tài liệu
                </div>
                <div 
                    className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <History size={18} /> Nhật ký nghiên cứu
                </div>
            </div>

            {/* Content Area */}
            <div className={styles.contentArea}>
                {activeTab === 'overview' && (
                    <div className={styles.overviewPane}>
                        <div className={styles.grid2}>
                            <Card title="Chuyên gia & Nhân sự" icon={<Users />}>
                                <div className={styles.memberList}>
                                    {members.length === 0 ? (
                                        <div className={styles.emptySmall}>Chưa có thành viên dự án</div>
                                    ) : (
                                        members.map(m => (
                                            <div key={m.id} className={styles.memberItem}>
                                                <div className={styles.memberInfo}>
                                                    <div className={styles.memberName}>{m.fullName}</div>
                                                    <div className={styles.memberRoleStatus}>
                                                        <span className={`${styles.statusIndicator} ${
                                                            m.status === 'Active' ? styles.active : 
                                                            m.status === 'OnLeave' ? styles.leave : 
                                                            m.status === 'Suspended' ? styles.suspended : 
                                                            m.status === 'Completed' ? styles.completed : styles.leave
                                                        }`} title={m.status} />
                                                        <span className={styles.memberRole}>{m.role || 'Nghiên cứu viên'}</span>
                                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                                                            ({m.status === 'Active' ? 'Đang hoạt động' : 
                                                              m.status === 'OnLeave' ? 'Nghỉ phép' : 
                                                              m.status === 'Suspended' ? 'Tạm dừng' : 
                                                              m.status === 'Completed' ? 'Đã hoàn thành' : m.status})
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    className={styles.removeBtn}
                                                    onClick={() => handleRemoveMember(m.userId)}
                                                >
                                                    Loại bỏ
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                            <Card title="Phân bổ Thời gian" icon={<Clock />}>
                                <div className={styles.timeline}>
                                    <div className={styles.timePoint}>
                                        <div className={styles.point} />
                                        <div className={styles.info}>
                                            <strong>Bắt đầu dự án</strong>
                                            <span>{dayjs(project.startDate).format('DD MMM, YYYY')}</span>
                                        </div>
                                    </div>
                                    <div className={styles.timeLine} />
                                    <div className={styles.timePointBusy}>
                                        <div className={styles.point} />
                                        <div className={styles.info}>
                                            <strong>Giai đoạn hiện tại</strong>
                                            <span>
                                                {project.status === 'Ongoing' ? 'Đang thực hiện nghiên cứu' : 
                                                 project.status === 'Planned' ? 'Thẩm định hồ sơ' : 'Đã nghiệm thu'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.timeLineDashed} />
                                    <div className={styles.timePointNext}>
                                        <div className={styles.point} />
                                        <div className={styles.info}>
                                            <strong>Dự kiến nghiệm thu</strong>
                                            <span>{dayjs(project.endDate).format('DD MMM, YYYY')}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className={styles.tasksPane}>
                        <div className={styles.paneHeader}>
                            <h3>Danh mục công việc nghiên cứu</h3>
                            <Button onClick={() => setIsTaskModalOpen(true)}>
                                <Plus size={18} /> Giao việc mới
                            </Button>
                        </div>

                        <div className={styles.taskList}>
                            {tasks.length === 0 ? (
                                <div className={styles.empty}>Chưa có công việc nào được giao cho dự án này.</div>
                            ) : (
                                tasks.map(task => (
                                    <div key={task.id} className={styles.taskItem}>
                                        <div className={styles.taskMain}>
                                            <div className={styles.taskCheck}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={task.status === 'Done'} 
                                                    onChange={() => handleUpdateTaskStatus(task.id, task.status)}
                                                />
                                            </div>
                                            <div className={styles.taskInfo}>
                                                <div className={styles.taskName}>{task.name}</div>
                                                <div className={styles.taskMeta}>
                                                    <Tag>Trọng số: {task.weight}</Tag>
                                                    <Tag color={task.status === 'Done' ? 'success' : task.status === 'InProgress' ? 'proc' : 'warn'}>
                                                        {task.status}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.taskRight}>
                                            <div className={styles.assignedTo}>
                                                <Users size={14} /> {task.assignedToFullName || 'Chưa phân phối'}
                                            </div>
                                            <div className={styles.dueDate}>
                                                <History size={14} /> {task.dueDate ? dayjs(task.dueDate).format('DD/MM') : 'N/A'}
                                            </div>
                                            <div className={styles.taskProgress}>
                                                <div className={styles.miniProgress} style={{ width: `${task.progress}%` }} />
                                            </div>
                                            <button 
                                                className={styles.deleteTaskBtn}
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'knowledge' && (
                    <div className={styles.knowledgePane}>
                        <div className={styles.paneHeader}>
                            <h3>Kho lưu trữ Tri thức & Tài liệu nghiên cứu</h3>
                            <Button variant="outline"><Upload size={18} /> Tải lên tài liệu</Button>
                        </div>
                        <div className={styles.knowledgeGrid}>
                            <div className={styles.docCard}>
                                <FileText size={40} className={styles.docIcon} />
                                <div className={styles.docName}>Báo cáo khảo sát thực địa_V1.pdf</div>
                                <div className={styles.docMeta}>PDF • 2.4 MB • 2 ngày trước</div>
                            </div>
                            <div className={styles.docCard}>
                                <FileText size={40} className={styles.docIcon} />
                                <div className={styles.docName}>Dữ liệu số liệu thô_Phân tích hóa.xlsx</div>
                                <div className={styles.docMeta}>XLSX • 1.1 MB • 5 ngày trước</div>
                            </div>
                            <div className={styles.uploadPlaceholder}>
                                <Plus size={32} />
                                <span>Kéo thả tri thức vào đây</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Task Modal */}
            <Modal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                title="Giao nhiệm vụ nghiên cứu mới"
            >
                <div className={styles.taskForm}>
                    <Input 
                        label="Tên nhiệm vụ" 
                        value={newTaskData.name}
                        onChange={e => setNewTaskData({...newTaskData, name: e.target.value})}
                        placeholder="VD: Phân tích mẫu đất giai đoạn 1"
                    />
                    <Input 
                        label="Mô tả chi tiết (Nội dung nghiên cứu)" 
                        value={newTaskData.description}
                        onChange={e => setNewTaskData({...newTaskData, description: e.target.value})}
                        placeholder="Mô tả phương pháp và kết quả cần đạt được"
                    />
                    <div className={styles.grid2}>
                        <Input 
                            label="Trọng số (Độ khó)" 
                            type="number"
                            value={String(newTaskData.weight)}
                            onChange={e => setNewTaskData({...newTaskData, weight: Number(e.target.value)})}
                        />
                        <Input 
                            label="Hạn chót" 
                            type="date"
                            value={newTaskData.dueDate}
                            onChange={e => setNewTaskData({...newTaskData, dueDate: e.target.value})}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                            Phân công chuyên gia
                        </label>
                        <select 
                            className={styles.select}
                            value={newTaskData.assignedToUserId || ''}
                            onChange={e => setNewTaskData({...newTaskData, assignedToUserId: e.target.value ? Number(e.target.value) : undefined})}
                        >
                            <option value="">-- Chọn nhân sự --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.modalActions}>
                        <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleCreateTask}>Giao việc</Button>
                    </div>
                </div>
            </Modal>

            {/* Member Modal */}
            <Modal
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                title="Bổ sung chuyên gia vào dự án"
            >
                <div className={styles.taskForm}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                            Chọn nhân sự từ hệ thống
                        </label>
                        <select 
                            className={styles.select}
                            value={newMemberData.userId || ''}
                            onChange={e => setNewMemberData({...newMemberData, userId: e.target.value ? Number(e.target.value) : undefined})}
                        >
                            <option value="">-- Chọn chuyên gia --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.username})</option>
                            ))}
                        </select>
                    </div>
                    <Input 
                        label="Vai trò trong dự án (VD: Chủ nhiệm, Thư ký...)" 
                        value={newMemberData.role}
                        onChange={e => setNewMemberData({...newMemberData, role: e.target.value})}
                    />
                    <div className={styles.modalActions}>
                        <Button variant="outline" onClick={() => setIsMemberModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleAddMember}>Bổ nhiệm</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Helper Components
const Card: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({ title, icon, children }) => (
    <div className={styles.card}>
        <div className={styles.cardTitle}>
            {icon} {title}
        </div>
        <div className={styles.cardBody}>
            {children}
        </div>
    </div>
);

const Tag: React.FC<{children: React.ReactNode, color?: 'success' | 'proc' | 'warn' | 'default'}> = ({ children, color = 'default' }) => (
    <span className={`${styles.tag} ${styles[`tag-${color}`]}`}>{children}</span>
);

export default ProjectDetail;
