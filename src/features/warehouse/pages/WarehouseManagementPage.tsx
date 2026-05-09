import React, { useState } from 'react';
import { Search, Plus, MapPin, Download, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './Warehouse.module.scss';

export const WarehouseManagementPage: React.FC = () => {
    const [warehouses] = useState<any[]>([
        { id: 1, code: 'KHO_TT', name: 'Kho Trung Tâm', address: '123 Nguyễn Văn Linh', status: 'Hoạt động' },
        { id: 2, code: 'KHO_KV1', name: 'Kho Khu Vực 1', address: '456 Lê Lợi', status: 'Hoạt động' },
    ]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Danh Mục Kho Hàng</h1>
                <div className={styles.actions}>
                    <Button variant="outline"><Download size={16} /> Xuất Excel</Button>
                    <Button variant="primary"><Plus size={16} /> Thêm kho mới</Button>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={16} color="#888" />
                        <input type="text" placeholder="Tìm kiếm theo mã kho, tên kho..." />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataGrid}>
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th style={{ width: '150px' }}>Mã Kho</th>
                                <th>Tên Kho</th>
                                <th>Địa chỉ</th>
                                <th style={{ width: '150px', textAlign: 'center' }}>Trạng thái</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.map(w => (
                                <tr key={w.id}>
                                    <td>{w.id}</td>
                                    <td style={{ fontWeight: 500, color: '#1890ff' }}>{w.code}</td>
                                    <td style={{ fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={16} color="#888" />
                                            {w.name}
                                        </div>
                                    </td>
                                    <td>{w.address}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={styles.statusBadge}>{w.status}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <Button variant="outline" style={{ padding: '4px', marginRight: '4px' }}><Edit2 size={14} /></Button>
                                        <Button variant="outline" style={{ padding: '4px', color: '#ff4d4f' }}><Trash2 size={14} /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WarehouseManagementPage;
