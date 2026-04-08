import React, { useEffect, useState } from 'react';
import {
    Search,
    Plus,
    Mail,
    Phone,
    MapPin,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    User,
    RefreshCw
} from 'lucide-react';
import { Button } from '../../../shared/components/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { customersService } from '../services/customers.service';
import type { Customer } from '../customers.types';
import { toast } from 'sonner';
import styles from './CustomerPage.module.scss';

export const CustomerPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});
    const [formLoading, setFormLoading] = useState(false);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customersService.getAll({
                searchText: searchTerm,
                page,
                pageSize
            });
            setCustomers(response.data || []);
            setTotalItems(response.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch customers', error);
            toast.error('Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCustomers();
    };

    const handleAddClick = async () => {
        setIsEditing(false);
        setFormLoading(true);
        try {
            const codeRes = await customersService.getCode();
            setCurrentCustomer({
                code: codeRes.data,
                name: '',
                phone: '',
                email: '',
                address: '',
                gender: 1
            });
            setIsFormModalOpen(true);
        } catch (error) {
            toast.error('Không thể khởi tạo mã khách hàng');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditClick = (customer: Customer) => {
        setIsEditing(true);
        setCurrentCustomer({ ...customer });
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;
        try {
            await customersService.delete(id);
            toast.success('Xóa khách hàng thành công');
            fetchCustomers();
        } catch (error) {
            toast.error('Không thể xóa khách hàng');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            if (isEditing && currentCustomer.id) {
                await customersService.update(currentCustomer.id, currentCustomer);
                toast.success('Cập nhật khách hàng thành công');
            } else {
                await customersService.create(currentCustomer);
                toast.success('Thêm khách hàng mới thành công');
            }
            setIsFormModalOpen(false);
            fetchCustomers();
        } catch (error: any) {
            toast.error(error.response?.data?.msg || 'Có lỗi xảy ra khi lưu thông tin');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Quản lý Khách hàng</h1>
                    <p>Hệ thống quản lý thông tin khách hàng và đối tác.</p>
                </div>
                <div className={styles.actions}>
                    <Button variant="outline" icon={<RefreshCw size={18} />} onClick={fetchCustomers}>Làm mới</Button>
                    <Button variant="primary" icon={<Plus size={18} />} onClick={handleAddClick}>Thêm khách hàng</Button>
                </div>
            </header>

            <div className={styles.contentCard}>
                <div className={styles.tableToolbar}>
                    <form className={styles.searchBox} onSubmit={handleSearch}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, mã, số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    <div className={styles.stats}>
                        Tổng cộng: <strong>{totalItems}</strong> khách hàng
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Liên hệ</th>
                                <th>Địa chỉ</th>
                                <th>Ngày tạo</th>
                                <th className={styles.actionsColumn}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className={styles.skeletonRow}>
                                        <td colSpan={5}><div className={styles.skeleton}></div></td>
                                    </tr>
                                ))
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>
                                        Chưa có dữ liệu khách hàng
                                    </td>
                                </tr>
                            ) : (
                                customers.map((cus) => (
                                    <tr key={cus.id}>
                                        <td>
                                            <div className={styles.customerInfo}>
                                                <div className={styles.avatar}>
                                                    {cus.avatar ? <img src={cus.avatar} alt="" /> : <User size={20} />}
                                                </div>
                                                <div className={styles.meta}>
                                                    <span className={styles.name}>{cus.name}</span>
                                                    <span className={styles.code}>{cus.code}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.contactInfo}>
                                                <span className={styles.contactItem}><Phone size={14} /> {cus.phone || '-'}</span>
                                                <span className={styles.contactItem}><Mail size={14} /> {cus.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.addressInfo}>
                                                <MapPin size={14} />
                                                <span>{cus.address || 'Chưa cập nhật'}</span>
                                            </div>
                                        </td>
                                        <td>{cus.createdDate ? new Date(cus.createdDate).toLocaleDateString('vi-VN') : '-'}</td>
                                        <td className={styles.actionsColumn}>
                                            <div className={styles.actionBtns}>
                                                <button className={styles.editBtn} onClick={() => handleEditClick(cus)} title="Chỉnh sửa">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteClick(cus.id)} title="Xóa">
                                                    <Trash2 size={16} />
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
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                            <ChevronLeft size={18} />
                        </button>
                        <span>Trang {page}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= totalItems}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={isEditing ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
                size="md"
            >
                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGrid}>
                        <Input
                            label="Mã khách hàng"
                            value={currentCustomer.code || ''}
                            disabled
                        />
                        <Input
                            label="Tên khách hàng"
                            required
                            value={currentCustomer.name || ''}
                            onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
                        />
                        <Input
                            label="Số điện thoại"
                            required
                            value={currentCustomer.phone || ''}
                            onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={currentCustomer.email || ''}
                            onChange={(e) => setCurrentCustomer({ ...currentCustomer, email: e.target.value })}
                        />
                        <div className={styles.fullWidth}>
                            <Input
                                label="Địa chỉ"
                                value={currentCustomer.address || ''}
                                onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
                            />
                        </div>
                        <Select
                            label="Giới tính"
                            options={[
                                { label: 'Nam', value: 1 },
                                { label: 'Nữ', value: 2 },
                                { label: 'Khác', value: 0 }
                            ]}
                            value={currentCustomer.gender ?? 1}
                            onChange={(e) => setCurrentCustomer({ ...currentCustomer, gender: Number(e.target.value) })}
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
        </div>
    );
};
