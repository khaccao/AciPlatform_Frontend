
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
    FileCheck
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button/Button';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { hrService, userService } from '../../services/hr.service';
import styles from './EmployeePage.module.scss';
import { toast } from 'sonner';

export const EmployeePage: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Detail Modal State
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
    const [detailTab, setDetailTab] = useState<'info' | 'education' | 'certificates' | 'family' | 'contracts'>('info');
    const [detailLoading, setDetailLoading] = useState(false);
    const [extraData, setExtraData] = useState<any>({
        degrees: [],
        certificates: [],
        relatives: [],
        contracts: []
    });

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll({
                searchText: searchTerm,
                page: page,
                pageSize: pageSize
            });
            setEmployees(response.items || []);
            setTotalItems(response.totalCount || 0);
        } catch (error) {
            console.error('Failed to fetch employees', error);
            toast.error('Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeDetails = async (empId: number) => {
        try {
            setDetailLoading(true);
            const [degrees, certificates, relatives, contracts] = await Promise.all([
                hrService.degrees.getAll(), // These should ideally be filtered by userId if backend supports it
                hrService.certificates.getAll(),
                hrService.relatives.getAll(),
                hrService.contractHistories.getAll()
            ]);

            // Filter data for this specific user (Mocking filtering if API doesn't support it directly)
            setExtraData({
                degrees: degrees.filter((d: any) => d.userId === empId),
                certificates: certificates.filter((c: any) => c.userId === empId),
                relatives: relatives.filter((r: any) => r.userId === empId),
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

    const handleViewDetail = (emp: any) => {
        setSelectedEmployee(emp);
        setDetailTab('info');
        fetchEmployeeDetails(emp.id);
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
                    <Button variant="primary" icon={<Plus size={18} />}>Thêm nhân viên</Button>
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
                                                <button className={styles.actionBtn} onClick={() => handleViewDetail(emp)} title="Xem hồ sơ">
                                                    <Eye size={18} />
                                                </button>
                                                <button className={styles.actionBtn} title="Sửa"><Edit2 size={18} /></button>
                                                <button className={styles.actionBtn} title="Xóa"><Trash2 size={18} /></button>
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
                isOpen={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                title={`Hồ sơ Nhân viên: ${selectedEmployee?.fullName}`}
                size="xl"
                footer={<Button onClick={() => setSelectedEmployee(null)}>Đóng</Button>}
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
                                            <p>{selectedEmployee?.fullName}</p>
                                        </div>
                                        <div className={styles.infoGroup}>
                                            <label>Mã nhân viên</label>
                                            <p>{selectedEmployee?.username}</p>
                                        </div>
                                        <div className={styles.infoGroup}>
                                            <label>Email</label>
                                            <p>{selectedEmployee?.email || 'N/A'}</p>
                                        </div>
                                        <div className={styles.infoGroup}>
                                            <label>Số điện thoại</label>
                                            <p>{selectedEmployee?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                                {detailTab === 'education' && (
                                    <div className={styles.listSection}>
                                        {extraData.degrees.length > 0 ? extraData.degrees.map((d: any) => (
                                            <div key={d.id} className={styles.listItem}>
                                                <h4>{d.name}</h4>
                                                <p>{d.school} - {d.graduationYear}</p>
                                            </div>
                                        )) : <p>Chưa có dữ liệu học vấn</p>}
                                    </div>
                                )}
                                {detailTab === 'certificates' && (
                                    <div className={styles.listSection}>
                                        {extraData.certificates.length > 0 ? extraData.certificates.map((c: any) => (
                                            <div key={c.id} className={styles.listItem}>
                                                <h4>{c.name}</h4>
                                                <p>Cấp bởi: {c.issuer} - {c.issueDate}</p>
                                            </div>
                                        )) : <p>Chưa có chứng chỉ nào</p>}
                                    </div>
                                )}
                                {detailTab === 'family' && (
                                    <div className={styles.listSection}>
                                        {extraData.relatives.length > 0 ? extraData.relatives.map((r: any) => (
                                            <div key={r.id} className={styles.listItem}>
                                                <h4>{r.name} ({r.relationship})</h4>
                                                <p>SĐT: {r.phone}</p>
                                            </div>
                                        )) : <p>Chưa có thông tin người thân</p>}
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
        </div>
    );
};
