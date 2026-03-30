
import React, { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Trash2,
    Eye,
    GraduationCap,
    Award,
    Heart,
    FileCheck,
    Trophy,
    Gavel,
    Camera,
    UserCheck
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { hrService, userService } from '../../services/hr.service';
import type { User, UserRequest, Department, PositionDetail, Company } from '../../hr.types';
import { Input } from '../../../../shared/ui/Input/Input';
import { Select } from '../../../../shared/ui/Select/Select';
import styles from './EmployeePage.module.scss';
import { toast } from 'sonner';

export const EmployeePage: React.FC = () => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // CRUD Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<UserRequest>>({});
    const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Dropdown data
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<PositionDetail[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);

    // Detail Modal State
    const [viewingEmployee, setViewingEmployee] = useState<User | null>(null);
    const [detailTab, setDetailTab] = useState<'info' | 'education' | 'certificates' | 'family' | 'achievements' | 'decisions' | 'contracts'>('info');
    const [detailLoading, setDetailLoading] = useState(false);
    const [extraData, setExtraData] = useState<any>({
        degrees: [],
        certificates: [],
        relatives: [],
        contracts: [],
        achievements: [],
        decisions: []
    });

    // Sub-CRUD State (Degrees, Certificates, Relatives, Achievements, Decisions)
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [subModalType, setSubModalType] = useState<'degree' | 'certificate' | 'relative' | 'achievement' | 'decision'>('degree');
    const [isEditingSub, setIsEditingSub] = useState(false);
    const [currentSubData, setCurrentSubData] = useState<any>({});
    const [editingSubId, setEditingSubId] = useState<number | null>(null);
    const [subFormLoading, setSubFormLoading] = useState(false);

    // Additional dropdown data
    const [decisionTypes, setDecisionTypes] = useState<any[]>([]);
    const [allRoles, setAllRoles] = useState<any[]>([]);

    // Face Registration State
    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
    const [registeringUserId, setRegisteringUserId] = useState<number | null>(null);
    const faceVideoRef = React.useRef<HTMLVideoElement>(null);
    const faceCanvasRef = React.useRef<HTMLCanvasElement>(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll({
                searchText: searchTerm,
                page: page,
                pageSize: pageSize
            });
            // Matching backend response structure { Data: User[], TotalItems: number }
            setEmployees(response.data || []);
            setTotalItems(response.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch employees', error);
            toast.error('Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [depts, poss, dTypes, roles, comps] = await Promise.all([
                hrService.departments.getAll(),
                hrService.positions.getAll(),
                hrService.decisionTypes.getAll(),
                userService.getRoles(),
                hrService.companies.getAll()
            ]);
            setDepartments(depts);
            setPositions(poss);
            setDecisionTypes(dTypes || []);
            setAllRoles(roles?.data || roles || []);
            setCompanies(comps);
        } catch (error) {
            console.error('Failed to fetch dropdown data', error);
        }
    };

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchEmployeeDetails = async (empId: number) => {
        try {
            setDetailLoading(true);
            const [degrees, certificates, relatives, achievements, decisions, contracts] = await Promise.all([
                hrService.degrees.getByUser(empId),
                hrService.certificates.getByUser(empId),
                hrService.relatives.getByUser(empId),
                hrService.achievements.getByUser(empId),
                hrService.decisions.getByUser(empId),
                hrService.contractHistories.getAll()
            ]);

            setExtraData({
                degrees,
                certificates,
                relatives,
                achievements,
                decisions,
                contracts: contracts.filter((c: any) => c.userId === empId)
            });
        } catch (error) {
            toast.error('Không thể tải chi tiết nhân viên');
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [page, searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchEmployees();
    };

    const handleViewDetail = (emp: User) => {
        setViewingEmployee(emp);
        setDetailTab('info');
        fetchEmployeeDetails(emp.id);
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setEditingEmployeeId(null);
        setCurrentUser({
            username: '',
            password: '123456', // Default password
            fullName: '',
            email: '',
            phone: '',
            departmentId: undefined,
            positionDetailId: undefined,
            gender: 1,
            birthDay: '',
            address: '',
            companyCode: '',
        });
        setIsFormModalOpen(true);
    };

    const handleEditClick = (emp: User) => {
        setIsEditing(true);
        setEditingEmployeeId(emp.id);
        setCurrentUser({
            username: emp.username,
            fullName: emp.fullName,
            email: emp.email,
            phone: emp.phone,
            departmentId: emp.departmentId,
            positionDetailId: emp.positionDetailId,
            gender: emp.gender,
            birthDay: emp.birthDay ? new Date(emp.birthDay).toISOString().split('T')[0] : '',
            address: emp.address,
            userRoleIds: emp.userRoleIds,
            companyCode: emp.companyCode
        });
        setIsFormModalOpen(true);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);

            // Clean up data before sending
            const dataToSave: UserRequest = {
                username: currentUser.username || '',
                fullName: currentUser.fullName,
                email: currentUser.email,
                phone: currentUser.phone,
                departmentId: currentUser.departmentId,
                positionDetailId: currentUser.positionDetailId,
                gender: currentUser.gender,
                birthDay: currentUser.birthDay || undefined, // undefined will be stripped from JSON, backend will see null
                address: currentUser.address,
                userRoleIds: currentUser.userRoleIds,
                password: currentUser.password,
                companyCode: currentUser.companyCode
            };

            if (isEditing && editingEmployeeId) {
                await userService.update(editingEmployeeId, dataToSave);
                toast.success('Cập nhật nhân viên thành công');
            } else {
                await userService.create(dataToSave);
                toast.success('Thêm nhân viên mới thành công');
            }
            setIsFormModalOpen(false);
            fetchEmployees();
        } catch (error: any) {
            console.error('Failed to save user', error);
            const errorMsg = error.response?.data?.errors
                ? JSON.stringify(error.response.data.errors)
                : (error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin');
            toast.error(`Lỗi: ${errorMsg}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleFaceRegisterOpen = async (userId: number) => {
        setRegisteringUserId(userId);
        setIsFaceModalOpen(true);
        setTimeout(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (faceVideoRef.current) {
                    faceVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                toast.error("Không thể mở Camera");
            }
        }, 300);
    };

    const handleCaptureFace = async () => {
        if (!faceVideoRef.current || !faceCanvasRef.current || !registeringUserId) return;
        const canvas = faceCanvasRef.current;
        const video = faceVideoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        const image = canvas.toDataURL('image/jpeg');

        try {
            await userService.updateFaceImage(registeringUserId, image);
            toast.success("Đăng ký khuôn mặt thành công");
            setIsFaceModalOpen(false);
            const stream = video.srcObject as MediaStream;
            stream?.getTracks().forEach(t => t.stop());
            fetchEmployees();
        } catch (err) {
            toast.error("Lỗi khi lưu ảnh khuôn mặt");
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
        try {
            await userService.delete(id);
            toast.success('Xóa nhân viên thành công');
            fetchEmployees();
        } catch (error) {
            toast.error('Không thể xóa nhân viên');
        }
    };

    // Sub-CRUD Handlers
    const handleAddSubClick = (type: 'degree' | 'certificate' | 'relative' | 'achievement' | 'decision') => {
        setSubModalType(type);
        setIsEditingSub(false);
        setEditingSubId(null);
        setCurrentSubData({ userId: viewingEmployee?.id });
        setIsSubModalOpen(true);
    };

    const handleEditSubClick = (type: 'degree' | 'certificate' | 'relative' | 'achievement' | 'decision', data: any) => {
        setSubModalType(type);
        setIsEditingSub(true);
        setEditingSubId(data.id);
        setCurrentSubData({ ...data });
        setIsSubModalOpen(true);
    };

    const handleSaveSub = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubFormLoading(true);
            const service = subModalType === 'degree' ? hrService.degrees :
                subModalType === 'certificate' ? hrService.certificates :
                    subModalType === 'relative' ? hrService.relatives :
                        subModalType === 'achievement' ? hrService.achievements :
                            hrService.decisions;

            if (isEditingSub && editingSubId) {
                await service.update(editingSubId, currentSubData);
                toast.success('Cập nhật thành công');
            } else {
                await service.create(currentSubData);
                toast.success('Thêm thành công');
            }
            setIsSubModalOpen(false);
            if (viewingEmployee) fetchEmployeeDetails(viewingEmployee.id);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi lưu thông tin');
        } finally {
            setSubFormLoading(false);
        }
    };

    const handleDeleteSub = async (type: 'degree' | 'certificate' | 'relative' | 'achievement' | 'decision', id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
        try {
            const service = type === 'degree' ? hrService.degrees :
                type === 'certificate' ? hrService.certificates :
                    type === 'relative' ? hrService.relatives :
                        type === 'achievement' ? hrService.achievements :
                            hrService.decisions;
            await service.delete(id);
            toast.success('Xóa thành công');
            if (viewingEmployee) fetchEmployeeDetails(viewingEmployee.id);
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Quản lý Nhân viên</h1>
                    <p>Quản lý hồ sơ, thông tin và trạng thái làm việc của nhân viên.</p>
                </div>
                <div className={styles.actions}>
                    <Button variant="outline" icon={<Filter size={18} />}>Lọc</Button>
                    <Button variant="primary" icon={<Plus size={18} />} onClick={handleAddClick}>Thêm nhân viên</Button>
                </div>
            </header>

            <div className={styles.contentCard}>
                <div className={styles.tableToolbar}>
                    <form className={styles.searchBox} onSubmit={handleSearch}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã NV, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    <div className={styles.stats}>
                        Tổng số: <strong>{totalItems}</strong> nhân viên
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nhân viên</th>
                                <th>Bộ phận / Chức vụ</th>
                                <th>Liên hệ</th>
                                <th>Ngày vào làm</th>
                                <th>Trạng thái</th>
                                <th className={styles.actionsColumn}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className={styles.skeletonRow}>
                                        <td colSpan={6}><div className={styles.skeleton}></div></td>
                                    </tr>
                                ))
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={styles.emptyState}>
                                        Không tìm thấy nhân viên nào
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp) => (
                                    <tr key={emp.id}>
                                        <td>
                                            <div className={styles.empInfo}>
                                                <div className={styles.avatar}>
                                                    {emp.fullName?.charAt(0) || 'U'}
                                                </div>
                                                <div className={styles.empMeta}>
                                                    <span className={styles.name}>{emp.fullName}</span>
                                                    <span className={styles.code}>ID: {emp.username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.deptInfo}>
                                                <span className={styles.dept}>{emp.departmentName || 'Chưa cập nhật'}</span>
                                                <span className={styles.pos}>{emp.positionName || 'Nhân viên'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.contactInfo}>
                                                <span className={styles.contactItem}><Mail size={14} /> {emp.email || '-'}</span>
                                                <span className={styles.contactItem}><Phone size={14} /> {emp.phone || '-'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.dateInfo}>
                                                <Calendar size={14} />
                                                {emp.createdDate ? new Date(emp.createdDate).toLocaleDateString('vi-VN') : '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${emp.status === 1 ? styles.active : styles.inactive}`}>
                                                {emp.status === 1 ? 'Đang làm việc' : 'Đã nghỉ việc'}
                                            </span>
                                        </td>
                                        <td className={styles.actionsColumn}>
                                            <div className={styles.actionBtns}>
                                                <button 
                                                    className={`${styles.actionBtn} ${emp.faceImage ? styles.registered : ''}`} 
                                                    onClick={() => handleFaceRegisterOpen(emp.id)} 
                                                    title={emp.faceImage ? "Đã đăng ký khuôn mặt" : "Đăng ký khuôn mặt"}
                                                >
                                                    {emp.faceImage ? <UserCheck size={18} /> : <Camera size={18} />}
                                                </button>
                                                <button className={styles.actionBtn} onClick={() => handleViewDetail(emp)} title="Xem hồ sơ">
                                                    <Eye size={18} />
                                                </button>
                                                <button className={styles.actionBtn} onClick={() => handleEditClick(emp)} title="Sửa">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className={styles.actionBtn} onClick={() => handleDeleteUser(emp.id)} title="Xóa">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <div className={styles.pageInfo}>
                        Hiển thị {Math.min((page - 1) * pageSize + 1, totalItems)} - {Math.min(page * pageSize, totalItems)} trên {totalItems}
                    </div>
                    <div className={styles.pageBtns}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span>Trang {page}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * pageSize >= totalItems}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Employee Detail Modal */}
            <Modal
                isOpen={!!viewingEmployee}
                onClose={() => setViewingEmployee(null)}
                title={`Hồ sơ Nhân viên: ${viewingEmployee?.fullName}`}
                size="xl"
                footer={<Button onClick={() => setViewingEmployee(null)}>Đóng</Button>}
            >
                <div className={styles.modalContent}>
                    <div className={styles.modalSidebar}>
                        <button
                            className={`${styles.modalTab} ${detailTab === 'info' ? styles.active : ''}`}
                            onClick={() => setDetailTab('info')}
                        >
                            <Mail size={18} /> Thông tin chung
                        </button>
                        <button
                            className={`${styles.modalTab} ${detailTab === 'education' ? styles.active : ''}`}
                            onClick={() => setDetailTab('education')}
                        >
                            <GraduationCap size={18} /> Học vấn & Bằng cấp
                        </button>
                        <button
                            className={`${styles.modalTab} ${detailTab === 'certificates' ? styles.active : ''}`}
                            onClick={() => setDetailTab('certificates')}
                        >
                            <Award size={18} /> Chứng chỉ
                        </button>
                        <button
                            className={`${styles.modalTab} ${detailTab === 'family' ? styles.active : ''}`}
                            onClick={() => setDetailTab('family')}
                        >
                            <Heart size={18} /> Người thân
                        </button>
                        <button
                            className={`${styles.modalTab} ${detailTab === 'achievements' ? styles.active : ''}`}
                            onClick={() => setDetailTab('achievements')}
                        >
                            <Trophy size={18} /> Thành tích
                        </button>
                        <button
                            className={`${styles.modalTab} ${detailTab === 'decisions' ? styles.active : ''}`}
                            onClick={() => setDetailTab('decisions')}
                        >
                            <Gavel size={18} /> Quyết định
                        </button>
                        <button
                            className={`${styles.modalTab} ${detailTab === 'contracts' ? styles.active : ''}`}
                            onClick={() => setDetailTab('contracts')}
                        >
                            <FileCheck size={18} /> Hợp đồng
                        </button>
                    </div>

                    <div className={styles.modalMain}>
                        {detailLoading ? (
                            <div className={styles.loadingPulse}>Đang tải dữ liệu hồ sơ...</div>
                        ) : (
                            <div className={styles.tabContent}>
                                {detailTab === 'info' && (
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoGroup}>
                                            <label>Họ và tên</label>
                                            <p>{viewingEmployee?.fullName}</p>
                                        </div>
                                        <div className={styles.infoGroup}>
                                            <label>Mã nhân viên</label>
                                            <p>{viewingEmployee?.username}</p>
                                        </div>
                                        <div className={styles.infoGroup}>
                                            <label>Email</label>
                                            <p>{viewingEmployee?.email || 'N/A'}</p>
                                        </div>
                                        <div className={styles.infoGroup}>
                                            <label>Số điện thoại</label>
                                            <p>{viewingEmployee?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                                {detailTab === 'education' && (
                                    <div className={styles.listSection}>
                                        <div className={styles.listHeader}>
                                            <h3>Bằng cấp & Học vị</h3>
                                            <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => handleAddSubClick('degree')}>Thêm mới</Button>
                                        </div>
                                        {extraData.degrees.length > 0 ? extraData.degrees.map((d: any) => (
                                            <div key={d.id} className={styles.listItem}>
                                                <div className={styles.itemInfo}>
                                                    <h4>{d.name}</h4>
                                                    <p>{d.school} - {d.graduationYear}</p>
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <button onClick={() => handleEditSubClick('degree', d)}><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDeleteSub('degree', d.id)}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        )) : <p className={styles.empty}>Chưa có dữ liệu học vấn</p>}
                                    </div>
                                )}
                                {detailTab === 'certificates' && (
                                    <div className={styles.listSection}>
                                        <div className={styles.listHeader}>
                                            <h3>Chứng chỉ & Chứng nhận</h3>
                                            <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => handleAddSubClick('certificate')}>Thêm mới</Button>
                                        </div>
                                        {extraData.certificates.length > 0 ? extraData.certificates.map((c: any) => (
                                            <div key={c.id} className={styles.listItem}>
                                                <div className={styles.itemInfo}>
                                                    <h4>{c.name}</h4>
                                                    <p>Cấp bởi: {c.issuer} - {c.issueDate ? new Date(c.issueDate).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <button onClick={() => handleEditSubClick('certificate', c)}><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDeleteSub('certificate', c.id)}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        )) : <p className={styles.empty}>Chưa có chứng chỉ nào</p>}
                                    </div>
                                )}
                                {detailTab === 'family' && (
                                    <div className={styles.listSection}>
                                        <div className={styles.listHeader}>
                                            <h3>Người thân & Liên hệ khẩn cấp</h3>
                                            <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => handleAddSubClick('relative')}>Thêm mới</Button>
                                        </div>
                                        {extraData.relatives.length > 0 ? extraData.relatives.map((r: any) => (
                                            <div key={r.id} className={styles.listItem}>
                                                <div className={styles.itemInfo}>
                                                    <h4>{r.name} ({r.relationship})</h4>
                                                    <p>SĐT: {r.phone} - Địa chỉ: {r.address}</p>
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <button onClick={() => handleEditSubClick('relative', r)}><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDeleteSub('relative', r.id)}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        )) : <p className={styles.empty}>Chưa có thông tin người thân</p>}
                                    </div>
                                )}
                                {detailTab === 'achievements' && (
                                    <div className={styles.listSection}>
                                        <div className={styles.listHeader}>
                                            <h3>Thành tích & Khen thưởng</h3>
                                            <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => handleAddSubClick('achievement')}>Thêm mới</Button>
                                        </div>
                                        {extraData.achievements.length > 0 ? extraData.achievements.map((a: any) => (
                                            <div key={a.id} className={styles.listItem}>
                                                <div className={styles.itemInfo}>
                                                    <h4>{a.title}</h4>
                                                    <p>{a.description} - {a.achievedDate ? new Date(a.achievedDate).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <button onClick={() => handleEditSubClick('achievement', a)}><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDeleteSub('achievement', a.id)}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        )) : <p className={styles.empty}>Chưa có thành tích nào</p>}
                                    </div>
                                )}
                                {detailTab === 'decisions' && (
                                    <div className={styles.listSection}>
                                        <div className={styles.listHeader}>
                                            <h3>Quyết định</h3>
                                            <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => handleAddSubClick('decision')}>Thêm mới</Button>
                                        </div>
                                        {extraData.decisions.length > 0 ? extraData.decisions.map((d: any) => (
                                            <div key={d.id} className={styles.listItem}>
                                                <div className={styles.itemInfo}>
                                                    <h4>{d.title}</h4>
                                                    <p>Hiệu lực: {d.effectiveDate ? new Date(d.effectiveDate).toLocaleDateString() : 'N/A'} - Hết hạn: {d.expiredDate ? new Date(d.expiredDate).toLocaleDateString() : 'Vô thời hạn'}</p>
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <button onClick={() => handleEditSubClick('decision', d)}><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDeleteSub('decision', d.id)}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        )) : <p className={styles.empty}>Chưa có quyết định nào</p>}
                                    </div>
                                )}
                                {detailTab === 'contracts' && (
                                    <div className={styles.listSection}>
                                        {extraData.contracts.length > 0 ? extraData.contracts.map((c: any) => (
                                            <div key={c.id} className={styles.listItem}>
                                                <h4>Hợp đồng #{c.id}</h4>
                                                <p>Ngày ký: {c.signedDate} - Trạng thái: {c.endDate || 'Vô thời hạn'}</p>
                                            </div>
                                        )) : <p>Chưa có lịch sử hợp đồng</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Create/Edit Employee Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={isEditing ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
                size="lg"
            >
                <form onSubmit={handleSaveUser} className={styles.form}>
                    <div className={styles.formGrid}>
                        <Input
                            label="Tên đăng nhập"
                            required
                            disabled={isEditing}
                            value={currentUser.username}
                            onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                        />
                        {!isEditing && (
                            <Input
                                label="Mật khẩu"
                                type="password"
                                required
                                value={currentUser.password}
                                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                            />
                        )}
                        <Input
                            label="Họ và tên"
                            required
                            value={currentUser.fullName}
                            onChange={(e) => setCurrentUser({ ...currentUser, fullName: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={currentUser.email}
                            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                        />
                        <Input
                            label="Số điện thoại"
                            value={currentUser.phone}
                            onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                        />
                        <Select
                            label="Bộ phận"
                            options={[
                                { label: '-- Chọn bộ phận --', value: '' },
                                ...departments.map(d => ({ label: d.name, value: d.id }))
                            ]}
                            value={currentUser.departmentId || ''}
                            onChange={(e) => setCurrentUser({ ...currentUser, departmentId: e.target.value ? Number(e.target.value) : undefined })}
                        />
                        <Select
                            label="Chức vụ"
                            options={[
                                { label: '-- Chọn chức vụ --', value: '' },
                                ...positions.map(p => ({ label: p.name, value: p.id }))
                            ]}
                            value={currentUser.positionDetailId || ''}
                            onChange={(e) => setCurrentUser({ ...currentUser, positionDetailId: e.target.value ? Number(e.target.value) : undefined })}
                        />
                        <Select
                            label="Giới tính"
                            options={[
                                { label: 'Nam', value: 1 },
                                { label: 'Nữ', value: 0 }
                            ]}
                            value={currentUser.gender ?? 1}
                            onChange={(e) => setCurrentUser({ ...currentUser, gender: Number(e.target.value) })}
                        />
                        <Input
                            label="Ngày sinh"
                            type="date"
                            value={currentUser.birthDay || ''}
                            onChange={(e) => setCurrentUser({ ...currentUser, birthDay: e.target.value })}
                        />
                        <Input
                            label="Địa chỉ"
                            value={currentUser.address || ''}
                            onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
                        />
                        <Select
                            label="Công ty"
                            options={[
                                { label: '-- Chọn công ty --', value: '' },
                                ...companies.map(c => ({ label: `${c.code} - ${c.name || ''}`, value: c.code }))
                            ]}
                            value={currentUser.companyCode || ''}
                            onChange={(e) => setCurrentUser({ ...currentUser, companyCode: e.target.value })}
                        />
                        <Select
                            label="Nhóm quyền"
                            options={[
                                { label: '-- Chọn nhóm quyền --', value: '' },
                                ...allRoles.map(r => ({ label: r.title || r.code, value: r.id.toString() }))
                            ]}
                            value={currentUser.userRoleIds || ''}
                            onChange={(e) => setCurrentUser({ ...currentUser, userRoleIds: e.target.value })}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Hủy</Button>
                        <Button type="submit" variant="primary" isLoading={formLoading}>
                            {isEditing ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Sub-CRUD Modal (Degree, Certificate, Relative) */}
            <Modal
                isOpen={isSubModalOpen}
                onClose={() => setIsSubModalOpen(false)}
                title={`${isEditingSub ? 'Sửa' : 'Thêm'} ${subModalType === 'degree' ? 'Bằng cấp/Học vị' :
                    subModalType === 'certificate' ? 'Chứng chỉ' :
                        subModalType === 'relative' ? 'Người thân' :
                            subModalType === 'achievement' ? 'Thành tích' : 'Quyết định'
                    }`}
                size="md"
            >
                <form onSubmit={handleSaveSub} className={styles.subForm}>
                    {subModalType === 'degree' && (
                        <>
                            <Input
                                label="Tên bằng cấp"
                                required
                                value={currentSubData.name || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, name: e.target.value })}
                            />
                            <Input
                                label="Trường đào tạo"
                                value={currentSubData.school || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, school: e.target.value })}
                            />
                            <Input
                                label="Năm tốt nghiệp"
                                type="number"
                                value={currentSubData.graduationYear || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, graduationYear: Number(e.target.value) })}
                            />
                            <Input
                                label="Mô tả"
                                value={currentSubData.description || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, description: e.target.value })}
                            />
                        </>
                    )}

                    {subModalType === 'certificate' && (
                        <>
                            <Input
                                label="Tên chứng chỉ"
                                required
                                value={currentSubData.name || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, name: e.target.value })}
                            />
                            <Input
                                label="Nơi cấp"
                                value={currentSubData.issuer || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, issuer: e.target.value })}
                            />
                            <div className={styles.formGrid}>
                                <Input
                                    label="Ngày cấp"
                                    type="date"
                                    value={currentSubData.issueDate ? new Date(currentSubData.issueDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setCurrentSubData({ ...currentSubData, issueDate: e.target.value })}
                                />
                                <Input
                                    label="Ngày hết hạn"
                                    type="date"
                                    value={currentSubData.expiryDate ? new Date(currentSubData.expiryDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setCurrentSubData({ ...currentSubData, expiryDate: e.target.value })}
                                />
                            </div>
                            <Input
                                label="Ghi chú"
                                value={currentSubData.note || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, note: e.target.value })}
                            />
                        </>
                    )}

                    {subModalType === 'relative' && (
                        <>
                            <Input
                                label="Họ tên người thân"
                                required
                                value={currentSubData.name || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, name: e.target.value })}
                            />
                            <Input
                                label="Quan hệ"
                                required
                                placeholder="VD: Bố, Mẹ, Vợ, Chồng..."
                                value={currentSubData.relationship || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, relationship: e.target.value })}
                            />
                            <Input
                                label="Số điện thoại"
                                value={currentSubData.phone || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, phone: e.target.value })}
                            />
                            <Input
                                label="Địa chỉ"
                                value={currentSubData.address || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, address: e.target.value })}
                            />
                            <Input
                                label="Ghi chú"
                                value={currentSubData.note || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, note: e.target.value })}
                            />
                        </>
                    )}

                    {subModalType === 'achievement' && (
                        <>
                            <Input
                                label="Tiêu đề thành tích"
                                required
                                value={currentSubData.title || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, title: e.target.value })}
                            />
                            <Input
                                label="Mô tả"
                                value={currentSubData.description || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, description: e.target.value })}
                            />
                            <Input
                                label="Ngày đạt được"
                                type="date"
                                value={currentSubData.achievedDate ? new Date(currentSubData.achievedDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, achievedDate: e.target.value })}
                            />
                            <Input
                                label="Ghi chú"
                                value={currentSubData.note || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, note: e.target.value })}
                            />
                        </>
                    )}

                    {subModalType === 'decision' && (
                        <>
                            <Select
                                label="Loại quyết định"
                                required
                                options={[
                                    { label: '-- Chọn loại --', value: '' },
                                    ...decisionTypes.map(dt => ({ label: dt.name, value: dt.id }))
                                ]}
                                value={currentSubData.decisionTypeId || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, decisionTypeId: Number(e.target.value) })}
                            />
                            <Input
                                label="Tiêu đề quyết định"
                                required
                                value={currentSubData.title || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, title: e.target.value })}
                            />
                            <Input
                                label="Mô tả"
                                value={currentSubData.description || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, description: e.target.value })}
                            />
                            <div className={styles.formGrid}>
                                <Input
                                    label="Ngày hiệu lực"
                                    type="date"
                                    value={currentSubData.effectiveDate ? new Date(currentSubData.effectiveDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setCurrentSubData({ ...currentSubData, effectiveDate: e.target.value })}
                                />
                                <Input
                                    label="Ngày hết hạn"
                                    type="date"
                                    value={currentSubData.expiredDate ? new Date(currentSubData.expiredDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setCurrentSubData({ ...currentSubData, expiredDate: e.target.value })}
                                />
                            </div>
                            <Input
                                label="URL File đính kèm"
                                value={currentSubData.fileUrl || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, fileUrl: e.target.value })}
                            />
                            <Input
                                label="Ghi chú"
                                value={currentSubData.note || ''}
                                onChange={(e) => setCurrentSubData({ ...currentSubData, note: e.target.value })}
                            />
                        </>
                    )}

                    <div className={styles.formActions}>
                        <Button type="button" variant="outline" onClick={() => setIsSubModalOpen(false)}>Hủy</Button>
                        <Button type="submit" variant="primary" isLoading={subFormLoading}>
                            {isEditingSub ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Face Registration Modal */}
            <Modal
                isOpen={isFaceModalOpen}
                onClose={() => {
                    setIsFaceModalOpen(false);
                    if (faceVideoRef.current) {
                        const stream = faceVideoRef.current.srcObject as MediaStream;
                        stream?.getTracks().forEach(t => t.stop());
                    }
                }}
                title="Đăng ký Khuôn mặt Nhân viên"
                size="md"
            >
                <div className={styles.faceModalContent}>
                    <div className={styles.cameraPreview}>
                        <video ref={faceVideoRef} autoPlay playsInline muted />
                        <canvas ref={faceCanvasRef} style={{ display: 'none' }} />
                        <div className={styles.focusFrame}>
                            <div className={styles.focusCorner} />
                            <div className={styles.focusCorner} />
                            <div className={styles.focusCorner} />
                            <div className={styles.focusCorner} />
                        </div>
                    </div>
                    <div className={styles.faceModalActions}>
                        <Button variant="primary" icon={<Camera size={18} />} onClick={handleCaptureFace}>
                            Chụp ảnh & Đăng ký
                        </Button>
                        <p className={styles.faceNote}>Đảm bảo khuôn mặt nhân viên nằm trong khung hình và đủ ánh sáng.</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
