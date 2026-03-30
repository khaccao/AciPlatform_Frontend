import { useState, useEffect } from 'react';
import { 
    Truck, 
    MapPin, 
    Clock, 
    Fuel, 
    Plus, 
    Search, 
    MoreVertical, 
    ChevronRight,
    Map
} from 'lucide-react';
import { fleetService } from '../../services/fleet.service';
import type { Car, RoadRoute, DriverRouter } from '../../services/fleet.types';
import styles from './FleetManagementPage.module.scss';
import { toast } from 'sonner';

type ActiveTab = 'cars' | 'routes' | 'assignments';

export const FleetManagementPage = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('cars');
    const [cars, setCars] = useState<Car[]>([]);
    const [routes, setRoutes] = useState<RoadRoute[]>([]);
    const [assignments, setAssignments] = useState<DriverRouter[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'cars') {
                const res = await fleetService.getCarList();
                setCars(res.data || []);
            } else if (activeTab === 'routes') {
                const res = await fleetService.getRoadRoutes();
                setRoutes(res.data?.items || []);
            } else if (activeTab === 'assignments') {
                const res = await fleetService.getDriverRouters();
                setAssignments(res.data?.items || []);
            }
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu vận tải');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Quản lý Vận tải</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}> Theo dõi đội xe, lộ trình và định mức xăng dầu hành trình.</p>
                </div>
                <button className={styles.btnPrimary}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Thêm mới
                </button>
            </div>

            <div className={styles.tabs}>
                <div 
                    className={`${styles.tab} ${activeTab === 'cars' ? styles.active : ''}`}
                    onClick={() => setActiveTab('cars')}
                >
                    <Truck size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Đội xe
                </div>
                <div 
                    className={`${styles.tab} ${activeTab === 'routes' ? styles.active : ''}`}
                    onClick={() => setActiveTab('routes')}
                >
                    <Map size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Tuyến đường
                </div>
                <div 
                    className={`${styles.tab} ${activeTab === 'assignments' ? styles.active : ''}`}
                    onClick={() => setActiveTab('assignments')}
                >
                    <Clock size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Phân công & Lộ trình
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải dữ liệu...</div>
            ) : (
                <div className={styles.grid}>
                    {activeTab === 'cars' && cars.map(car => (
                        <div key={car.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.licensePlate}>{car.licensePlates}</div>
                                <span className={`${styles.statusBadge} ${styles.statusActive}`}>Đang hoạt động</span>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '14px' }}>{car.note || 'Không có ghi chú'}</p>
                            
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}><Fuel size={14} style={{ display: 'inline', marginRight: '4px' }} /> Nhiên liệu (L/km)</div>
                                    <div className={styles.statValue}>{car.fuelAmount || 0}</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}><ChevronRight size={14} style={{ display: 'inline', marginRight: '4px' }} /> Định mức (km)</div>
                                    <div className={styles.statValue}>{car.mileageAllowance || 0}</div>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.btnOutline} style={{ flex: 1 }}>Chi tiết</button>
                                <button className={styles.btnOutline} style={{ minWidth: '40px', padding: '10px' }}>
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'routes' && routes.map(route => (
                        <div key={route.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div style={{ fontSize: '18px', fontWeight: '700' }}>{route.name}</div>
                                <span style={{ color: '#3b82f6', fontWeight: '600' }}>#{route.code}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                                <MapPin size={16} /> {route.roadRouteDetail}
                            </div>
                            <div style={{ marginTop: '12px', padding: '8px', background: '#f8fafc', borderRadius: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Số chuyến định mức:</span>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{route.numberOfTrips} chuyến</div>
                            </div>
                            <div className={styles.actions}>
                                <button className={styles.btnOutline} style={{ flex: 1 }}>Cấu hình điểm dừng</button>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'assignments' && assignments.map(a => (
                        <div key={a.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div style={{ fontWeight: '700' }}>{a.licensePlates} - {a.driver}</div>
                                <span className={`${styles.statusBadge} ${a.status === 'Running' ? styles.statusActive : styles.statusAlert}`}>
                                    {a.status === 'Running' ? 'Đang chạy' : 'Hoàn thành'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Ngày đi:</span>
                                    <span>{new Date(a.date).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Tuyến đường:</span>
                                    <span>{a.roadRouteName}</span>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button className={styles.btnOutline} style={{ flex: 1 }}>Theo dõi</button>
                            </div>
                        </div>
                    ))}

                    {!loading && (activeTab === 'cars' ? !cars.length : activeTab === 'routes' ? !routes.length : !assignments.length) && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
                            <div style={{ color: '#cbd5e1', marginBottom: '16px' }}><Search size={48} style={{ margin: '0 auto' }} /></div>
                            <p style={{ color: '#64748b' }}>Chưa có dữ liệu cho mục này.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
