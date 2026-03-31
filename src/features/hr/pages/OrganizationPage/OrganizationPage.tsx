
import React, { useEffect, useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Search
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button/Button';
import { hrService } from '../../services/hr.service';
import { Input } from '../../../../shared/ui/Input/Input';
import { Select } from '../../../../shared/ui/Select/Select';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import styles from './OrganizationPage.module.scss';
import { toast } from 'sonner';
import type { Department, PositionDetail, DepartmentRequest, PositionDetailRequest } from '../../hr.types';

export const OrganizationPage: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<PositionDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dept' | 'pos'>('dept');

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Department Form State
    const [currentDept, setCurrentDept] = useState<Partial<DepartmentRequest>>({});
    const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

    // Position Form State
    const [currentPos, setCurrentPos] = useState<Partial<PositionDetailRequest>>({});
    const [selectedPosId, setSelectedPosId] = useState<number | null>(null);

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

    // Handlers for Department
    const handleAddDept = () => {
        setIsEditing(false);
        setCurrentDept({ name: '', code: '', order: 0 });
        setIsModalOpen(true);
    };

    const handleEditDept = (dept: Department) => {
        setIsEditing(true);
        setSelectedDeptId(dept.id);
        setCurrentDept({
            name: dept.name,
            code: dept.code,
            parentId: dept.parentId,
            order: dept.order
        });
        setIsModalOpen(true);
    };

    const handleSaveDept = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            if (isEditing && selectedDeptId) {
                await hrService.departments.update(selectedDeptId, currentDept as DepartmentRequest);
                toast.success('Cập nhật phòng ban thành công');
            } else {
                await hrService.departments.create(currentDept as DepartmentRequest);
                toast.success('Thêm phòng ban mới thành công');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi lưu phòng ban');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteDept = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) return;
        try {
            await hrService.departments.delete(id);
            toast.success('Xóa phòng ban thành công');
            fetchData();
        } catch (error) {
            toast.error('Không thể xóa phòng ban');
        }
    };

    // Handlers for Position
    const handleAddPos = () => {
        setIsEditing(false);
        setCurrentPos({ name: '', code: '', note: '', order: 0 });
        setIsModalOpen(true);
    };

    const handleEditPos = (pos: PositionDetail) => {
        setIsEditing(true);
        setSelectedPosId(pos.id);
        setCurrentPos({
            name: pos.name,
            code: pos.code,
            departmentId: pos.departmentId,
            note: pos.note,
            order: pos.order
        });
        setIsModalOpen(true);
    };

    const handleSavePos = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            if (isEditing && selectedPosId) {
                await hrService.positions.update(selectedPosId, currentPos as PositionDetailRequest);
                toast.success('Cập nhật chức vụ thành công');
            } else {
                await hrService.positions.create(currentPos as PositionDetailRequest);
                toast.success('Thêm chức vụ mới thành công');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi lưu chức vụ');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeletePos = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa chức vụ này?')) return;
        try {
            await hrService.positions.delete(id);
            toast.success('Xóa chức vụ thành công');
            fetchData();
        } catch (error) {
            toast.error('Không thể xóa chức vụ');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Cơ cấu Tổ chức</h1>
                    <p>Quản lý phòng ban, bộ phận và hệ thống chức danh trong doanh nghiệp.</p>
                </div>
                <div className={styles.actions}>
                    <Button variant="primary" icon={<Plus size={18} />} onClick={activeTab === 'dept' ? handleAddDept : handleAddPos}>
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
                                            <td data-label="Mã PB"><span className={styles.code}>{dept.code || '---'}</span></td>
                                            <td data-label="Tên phòng ban"><span className={styles.name}>{dept.name}</span></td>
                                            <td data-label="Phòng ban cha">{departments.find(d => d.id === dept.parentId)?.name || '-'}</td>
                                            <td data-label="Sắp xếp">{dept.order || 0}</td>
                                            <td data-label="Thao tác" className={styles.actionsColumn}>
                                                <div className={styles.actionBtns}>
                                                    <button className={styles.actionBtn} onClick={() => handleEditDept(dept)}><Edit2 size={16} /></button>
                                                    <button className={styles.actionBtn} onClick={() => handleDeleteDept(dept.id)}><Trash2 size={16} /></button>
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
                                            <td data-label="Mã CV"><span className={styles.code}>{pos.code || '---'}</span></td>
                                            <td data-label="Tên chức vụ"><span className={styles.name}>{pos.name}</span></td>
                                            <td data-label="Phòng ban">{departments.find(d => d.id === pos.departmentId)?.name || 'Tất cả'}</td>
                                            <td data-label="Ghi chú">{pos.note || '-'}</td>
                                            <td data-label="Thao tác" className={styles.actionsColumn}>
                                                <div className={styles.actionBtns}>
                                                    <button className={styles.actionBtn} onClick={() => handleEditPos(pos)}><Edit2 size={16} /></button>
                                                    <button className={styles.actionBtn} onClick={() => handleDeletePos(pos.id)}><Trash2 size={16} /></button>
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

            {/* Department Modal */}
            {activeTab === 'dept' && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditing ? 'Sửa phòng ban' : 'Thêm phòng ban mới'}
                    size="md"
                >
                    <form onSubmit={handleSaveDept} className={styles.form}>
                        <Input
                            label="Tên phòng ban"
                            required
                            value={currentDept.name}
                            onChange={(e) => setCurrentDept({ ...currentDept, name: e.target.value })}
                        />
                        <Input
                            label="Mã phòng ban"
                            value={currentDept.code}
                            onChange={(e) => setCurrentDept({ ...currentDept, code: e.target.value })}
                        />
                        <Select
                            label="Phòng ban cha"
                            options={[
                                { label: '-- Cấp cao nhất --', value: '' },
                                ...departments.filter(d => d.id !== selectedDeptId).map(d => ({ label: d.name, value: d.id }))
                            ]}
                            value={currentDept.parentId || ''}
                            onChange={(e) => setCurrentDept({ ...currentDept, parentId: e.target.value ? Number(e.target.value) : undefined })}
                        />
                        <Input
                            label="Thứ tự hiển thị"
                            type="number"
                            value={currentDept.order}
                            onChange={(e) => setCurrentDept({ ...currentDept, order: Number(e.target.value) })}
                        />
                        <div className={styles.formActions}>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="submit" variant="primary" isLoading={formLoading}>Lưu</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Position Modal */}
            {activeTab === 'pos' && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditing ? 'Sửa chức vụ' : 'Thêm chức vụ mới'}
                    size="md"
                >
                    <form onSubmit={handleSavePos} className={styles.form}>
                        <Input
                            label="Tên chức vụ"
                            required
                            value={currentPos.name}
                            onChange={(e) => setCurrentPos({ ...currentPos, name: e.target.value })}
                        />
                        <Input
                            label="Mã chức vụ"
                            value={currentPos.code}
                            onChange={(e) => setCurrentPos({ ...currentPos, code: e.target.value })}
                        />
                        <Select
                            label="Thuộc phòng ban"
                            options={[
                                { label: '-- Tất cả phòng ban --', value: '' },
                                ...departments.map(d => ({ label: d.name, value: d.id }))
                            ]}
                            value={currentPos.departmentId || ''}
                            onChange={(e) => setCurrentPos({ ...currentPos, departmentId: e.target.value ? Number(e.target.value) : undefined })}
                        />
                        <Input
                            label="Ghi chú"
                            value={currentPos.note}
                            onChange={(e) => setCurrentPos({ ...currentPos, note: e.target.value })}
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

