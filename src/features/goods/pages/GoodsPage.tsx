import React, { useEffect, useState } from 'react';
import {
    Search,
    Package,
    Layers,
    Warehouse,
    QrCode,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Filter,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '../../../shared/components/Button/Button';
import { goodsService } from '../services/goods.service';
import type { Good } from '../goods.types';
import { toast } from 'sonner';
import styles from './GoodsPage.module.scss';

export const GoodsPage: React.FC = () => {
    const [goods, setGoods] = useState<Good[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchGoods = async () => {
        try {
            setLoading(true);
            const response = await goodsService.getAll({
                searchText: searchTerm,
                page,
                pageSize
            });
            setGoods(response.data || []);
            setTotalItems(response.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch goods', error);
            toast.error('Không thể tải danh sách hàng hóa');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoods();
    }, [page, searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchGoods();
    };

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            await goodsService.syncAccountGood();
            toast.success('Đồng bộ hàng hóa thành công');
            fetchGoods();
        } catch (error) {
            toast.error('Đồng bộ thất bại');
        } finally {
            setIsSyncing(false);
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 1: return <span className={`${styles.statusBadge} ${styles.available}`}>Còn hàng</span>;
            case 0: return <span className={`${styles.statusBadge} ${styles.outOfStock}`}>Hết hàng</span>;
            default: return <span className={`${styles.statusBadge}`}>N/A</span>;
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Danh mục Hàng hóa</h1>
                    <p>Quản lý tồn kho, thông tin sản phẩm và mã QR.</p>
                </div>
                <div className={styles.actions}>
                    <Button 
                        variant="outline" 
                        icon={<RefreshCw size={18} className={isSyncing ? styles.spin : ''} />} 
                        onClick={handleSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
                    </Button>
                </div>
            </header>

            <div className={styles.filtersCard}>
                <form className={styles.searchBox} onSubmit={handleSearch}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hàng, mã hàng, tài khoản..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
                <div className={styles.quickFilters}>
                    <button className={styles.filterBtn}><Filter size={16} /> Lọc nâng cao</button>
                    <div className={styles.divider}></div>
                    <div className={styles.stats}>
                        Hiển thị <strong>{goods.length}</strong> / <strong>{totalItems}</strong> mặt hàng
                    </div>
                </div>
            </div>

            <div className={styles.goodsGrid}>
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className={styles.skeletonCard}></div>
                    ))
                ) : goods.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Package size={48} />
                        <p>Không tìm thấy hàng hóa nào trong kho</p>
                    </div>
                ) : (
                    goods.map((good) => (
                        <div key={good.id} className={styles.goodCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.imagePlaceholder}>
                                    {good.image1 ? <img src={good.image1} alt={good.goodName} /> : <ImageIcon size={32} />}
                                </div>
                                <div className={styles.cardMain}>
                                    <h3 className={styles.goodName}>{good.goodName}</h3>
                                    <span className={styles.goodCode}>{good.goodCode}</span>
                                </div>
                                {getStatusLabel(good.status)}
                            </div>
                            
                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <Warehouse size={16} />
                                    <span>{good.warehouseName || 'Kho mặc định'}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <Layers size={16} />
                                    <span>Loại: {good.goodsType || 'Chưa phân loại'}</span>
                                </div>
                                <div className={styles.stockInfo}>
                                    <div className={styles.stockItem}>
                                        <span className={styles.label}>Số lượng</span>
                                        <span className={styles.value}>{good.quantity}</span>
                                    </div>
                                    <div className={styles.stockItem}>
                                        <span className={styles.label}>Tài khoản</span>
                                        <span className={styles.value}>{good.account}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.qrInfo}>
                                    <QrCode size={16} />
                                    <span>{good.qrCode}</span>
                                </div>
                                <button className={styles.detailBtn}>Chi tiết</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.pagination}>
                <button 
                    className={styles.pageBtn} 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    <ChevronLeft size={20} /> Trước
                </button>
                <div className={styles.pageNumbers}>
                    Trang <strong>{page}</strong>
                </div>
                <button 
                    className={styles.pageBtn} 
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * pageSize >= totalItems}
                >
                    Sau <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};
