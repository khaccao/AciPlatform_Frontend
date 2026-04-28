import React, { useEffect, useState } from 'react';
import { 
    Plus, 
    Search, 
    FileText, 
    Users, 
    Clock, 
    FlaskConical, 
    BarChart3,
    Trash2,
    CheckCircle2
} from 'lucide-react';
import ProjectService from '../../services/project.service';
import type { Project, CreateProjectRequest } from '../../types/project.types';
import { Button } from '../../../../shared/ui/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Input } from '../../../../shared/ui/Input/Input';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import styles from './ProjectList.module.scss';
import { useNavigate } from 'react-router-dom';

const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<CreateProjectRequest>({
        code: '',
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: 0
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await ProjectService.getAll();
            setProjects(data);
        } catch (error) {
            toast.error('Không thể tải danh sách dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!formData.code || !formData.name) {
            toast.error('Vui lòng nhập mã và tên đề tài');
            return;
        }

        try {
            await ProjectService.create(formData);
            toast.success('Tạo đề tài nghiên cứu thành công');
            setIsModalOpen(false);
            setFormData({ code: '', name: '', description: '', startDate: '', endDate: '', budget: 0 });
            fetchProjects();
        } catch (error) {
            toast.error('Lỗi khi tạo đề tài');
        }
    };

    const handleDeleteProject = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa đề tài này?')) return;
        try {
            await ProjectService.delete(id);
            toast.success('Đã xóa đề tài');
            fetchProjects();
        } catch (error) {
            toast.error('Không thể xóa đề tài này');
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Planned': return styles.statusPlanned;
            case 'Ongoing': return styles.statusOngoing;
            case 'Completed': return styles.statusCompleted;
            case 'Suspended': return styles.statusSuspended;
            default: return '';
        }
    };

    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase()) || 
        p.code.toLowerCase().includes(searchText.toLowerCase())
    );

    const stats = {
        total: projects.length,
        ongoing: projects.filter(p => p.status === 'Ongoing').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        avgProgress: projects.length > 0 
            ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length) 
            : 0
    };

    return (
        <div className={styles.container}>
            <div className={styles.breadcrumb}>
                <span>Hệ thống / Nghiên cứu & Phát triển / Quản lý Dự án</span>
            </div>

            <div className={styles.header}>
                <div>
                    <h1>
                        <FlaskConical size={28} className={styles.iconBlue} />
                        Quản lý Dự án Nghiên cứu (R&D)
                    </h1>
                    <p>Hệ thống Quản lý Con người – Dự án – Tri thức chuyên biệt</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    Tạo dự án mới
                </Button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e6f7ff', color: '#1890ff' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Tổng dự án</span>
                        <span className={styles.statValue}>{stats.total}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fff7e6', color: '#faad14' }}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Đang triển khai</span>
                        <span className={styles.statValue}>{stats.ongoing}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#f6ffed', color: '#52c41a' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Đề tài hoàn thành</span>
                        <span className={styles.statValue}>{stats.completed}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#f9f0ff', color: '#722ed1' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Tiến độ trung bình</span>
                        <span className={styles.statValue}>{stats.avgProgress}%</span>
                    </div>
                </div>
            </div>

            <div className={styles.mainCard}>
                <div className={styles.cardHeader}>
                    <h3>Danh sách đề tài nghiên cứu</h3>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm mã hoặc tên đề tài..." 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Mã đề tài</th>
                                <th>Tên dự án nghiên cứu</th>
                                <th>Trạng thái</th>
                                <th>Tiến độ tích lũy</th>
                                <th>Bắt đầu</th>
                                <th>Ngân sách (VNĐ)</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className={styles.textCenter}>Đang tải dữ liệu...</td></tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr><td colSpan={7} className={styles.textCenter}>Chưa có dữ liệu nghiên cứu</td></tr>
                            ) : filteredProjects.map(project => (
                                <tr key={project.id}>
                                    <td><span className={styles.projectCode}>{project.code}</span></td>
                                    <td>
                                        <div 
                                            className={styles.projectName}
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                        >
                                            {project.name}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${getStatusClass(project.status)}`}>
                                            {project.status === 'Ongoing' ? 'Đang thực hiện' : 
                                             project.status === 'Completed' ? 'Hoàn thành' :
                                             project.status === 'Planned' ? 'Lên kế hoạch' : 'Tạm dừng'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.progressContainer}>
                                            <div className={styles.progressBarWrapper}>
                                                <div 
                                                    className={styles.progressBar} 
                                                    style={{ width: `${project.progress || 0}%` }}
                                                />
                                            </div>
                                            <span className={styles.progressText}>{project.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td>{project.startDate ? dayjs(project.startDate).format('DD/MM/YYYY') : '-'}</td>
                                    <td className={styles.textRight}>{project.budget?.toLocaleString() || '0'}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button 
                                                className={styles.iconBtn} 
                                                title="Xem chi tiết"
                                                onClick={() => navigate(`/projects/${project.id}`)}
                                            >
                                                <FileText size={18} />
                                            </button>
                                            <button className={styles.iconBtn} title="Thành viên">
                                                <Users size={18} />
                                            </button>
                                            <button 
                                                className={`${styles.iconBtn} ${styles.btnDelete}`} 
                                                title="Xóa dự án"
                                                onClick={() => handleDeleteProject(project.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Tạo đề tài nghiên cứu mới"
            >
                <div className={styles.modalForm}>
                    <Input 
                        label="Mã đề tài" 
                        value={formData.code} 
                        onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        placeholder="VD: RD-2024-AI"
                    />
                    <Input 
                        label="Tên đề tài nghiên cứu" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Nhập tên dự án nghiên cứu..."
                    />
                    <Input 
                        label="Mô tả mục tiêu" 
                        value={formData.description || ''} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Tóm tắt mục tiêu nghiên cứu..."
                    />
                    <div className={styles.row}>
                        <Input 
                            label="Ngày bắt đầu" 
                            type="date"
                            value={formData.startDate || ''} 
                            onChange={e => setFormData({...formData, startDate: e.target.value})}
                        />
                        <Input 
                            label="Ngày kết thúc" 
                            type="date"
                            value={formData.endDate || ''} 
                            onChange={e => setFormData({...formData, endDate: e.target.value})}
                        />
                    </div>
                    <Input 
                        label="Ngân sách dự kiến (VNĐ)" 
                        type="number"
                        value={String(formData.budget)} 
                        onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                    />
                    <div className={styles.modalFooter}>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleCreateProject}>Tạo đề tài</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectList;
