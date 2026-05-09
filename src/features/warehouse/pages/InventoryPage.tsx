import React, { useState } from 'react';
import { Search, Filter, Download, Package } from 'lucide-react';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './Warehouse.module.scss';

export const InventoryPage: React.FC = () => {
    const [inventories] = useState<any[]>([
        { id: 1, goodsCode: 'SP001', goodsName: 'Laptop Dell XPS 15', unit: 'Cái', quantity: 15, price: 35000000, warehouse: 'Kho Trung Tâm' },
        { id: 2, goodsCode: 'SP002', goodsName: 'Bàn phím cơ Logitech', unit: 'Chiếc', quantity: 42, price: 2500000, warehouse: 'Kho Trung Tâm' },
        { id: 3, goodsCode: 'SP003', goodsName: 'Chuột không dây', unit: 'Chiếc', quantity: 120, price: 850000, warehouse: 'Kho Khu Vực 1' },
    ]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Báo Cáo Tồn Kho</h1>
                <div className={styles.actions}>
                    <Button variant="outline"><Filter size={16} /> Lọc dữ liệu</Button>
                    <Button variant="outline"><Download size={16} /> Xuất Excel</Button>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={16} color="#888" />
                        <input type="text" placeholder="Tìm kiếm theo mã vật tư, tên vật tư..." />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataGrid}>
                        <thead>
                            <tr>
                                <th style={{ width: '120px' }}>Mã Vật Tư</th>
                                <th>Tên Vật Tư / Hàng Hoá</th>
                                <th>ĐVT</th>
                                <th>Kho Hàng</th>
                                <th style={{ textAlign: 'right' }}>Số lượng tồn</th>
                                <th style={{ textAlign: 'right' }}>Đơn giá bình quân</th>
                                <th style={{ textAlign: 'right' }}>Giá trị tồn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventories.map(inv => (
                                <tr key={inv.id}>
                                    <td style={{ fontWeight: 500, color: '#1890ff' }}>{inv.goodsCode}</td>
                                    <td style={{ fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Package size={16} color="#888" />
                                            {inv.goodsName}
                                        </div>
                                    </td>
                                    <td>{inv.unit}</td>
                                    <td>{inv.warehouse}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{inv.quantity.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right' }}>{inv.price.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#f56c6c' }}>{(inv.quantity * inv.price).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                                <td colSpan={6} style={{ textAlign: 'right' }}>Tổng cộng:</td>
                                <td style={{ textAlign: 'right', color: '#f56c6c' }}>
                                    {inventories.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
