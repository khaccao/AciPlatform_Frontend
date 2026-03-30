import { useState, useEffect } from 'react';
import { 
    Plus, Edit2, Trash2, 
    Truck, Fuel, Clock, MapPin, Navigation, Map, 
    ChevronRight, ShieldAlert, X, Save 
} from 'lucide-react';
import { fleetService } from '../../services/fleet.service';
import type { Car, RoadRoute, DriverRouter } from '../../services/fleet.types';
import styles from './FleetManagementPage.module.scss';
import { toast } from 'sonner';
import { useAppSelector } from '../../../../app/hooks';

type ActiveTab = 'fleets' | 'cars' | 'routes' | 'assignments' | 'petrol' | 'points';

export const FleetManagementPage = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('fleets');
    const [fleets, setFleets] = useState<any[]>([]);
    const [cars, setCars] = useState<Car[]>([]);
    const [routes, setRoutes] = useState<RoadRoute[]>([]);
    const [assignments, setAssignments] = useState<DriverRouter[]>([]);
    const [petrols, setPetrols] = useState<any[]>([]);
    const [points, setPoints] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const user = useAppSelector((state: any) => state.auth.user);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let res: any;
            switch (activeTab) {
                case 'fleets':
                    res = await fleetService.getCarFleets();
                    console.log('Fleets Data:', res);
                    setFleets(res.data || []);
                    break;
                case 'cars':
                    res = await fleetService.getCarList();
                    console.log('Cars Data:', res);
                    setCars(res || []);
                    // Load fleets for select
                    if (fleets.length === 0) {
                        const fleetRes = await fleetService.getCarFleetList();
                        setFleets(fleetRes || []);
                    }
                    break;
                case 'routes':
                    res = await fleetService.getRoadRoutes();
                    console.log('Routes Data:', res);
                    setRoutes(res.data || []);
                    break;
                case 'assignments':
                    res = await fleetService.getDriverRouters();
                    console.log('Assignments Data:', res);
                    setAssignments(res.data || []);
                    break;
                case 'petrol':
                    res = await fleetService.getPetrolConsumptions();
                    console.log('Petrol Data:', res);
                    setPetrols(res.data || []);
                    // Load cars + routes for dropdowns
                    const carRes = await fleetService.getCarList();
                    setCars(carRes || []);
                    const routeRes = await fleetService.getRoadRoutes();
                    setRoutes(routeRes.data || []);
                    break;
                case 'points':
                    res = await fleetService.getPoints();
                    console.log('Points Data:', res);
                    setPoints(res.data || []);
                    break;
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item: any = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({ ...item });
        } else {
            if (activeTab === 'fleets') setFormData({ name: '', description: '' });
            if (activeTab === 'cars') setFormData({ licensePlates: '', note: '', fuelAmount: 0, mileageAllowance: 0, carFleetId: '' });
            if (activeTab === 'routes') setFormData({ code: '', name: '', roadRouteDetail: '', numberOfTrips: 1 });
            if (activeTab === 'assignments') setFormData({ date: new Date().toISOString().split('T')[0], status: 'Active' });
            if (activeTab === 'petrol') setFormData({ date: new Date().toISOString().split('T')[0], petroPrice: 0, advanceAmount: 0 });
            if (activeTab === 'points') setFormData({ code: '', name: '', amount: 0 });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
        try {
            if (activeTab === 'fleets') await fleetService.deleteCarFleet(id);
            if (activeTab === 'cars') await fleetService.deleteCar(id);
            if (activeTab === 'routes') await fleetService.deleteRoadRoute(id);
            if (activeTab === 'assignments') await fleetService.deleteDriverRouter(id);
            if (activeTab === 'petrol') await fleetService.deletePetrol(id);
            if (activeTab === 'points') await fleetService.deletePoint(id);
            
            toast.success('Xóa thành công');
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi xóa dữ liệu');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalData = { ...formData };
        if (activeTab === 'petrol' && user) {
            finalData.userId = user.id;
        }

        console.log('Sending Data:', finalData);
        try {
            let res: any;
            if (activeTab === 'fleets') {
                res = editingItem ? await fleetService.updateCarFleet(editingItem.id, finalData) : await fleetService.createCarFleet(finalData);
            } else if (activeTab === 'cars') {
                res = editingItem ? await fleetService.updateCar(editingItem.id, finalData) : await fleetService.createCar(finalData);
            } else if (activeTab === 'routes') {
                res = editingItem ? await fleetService.updateRoadRoute(editingItem.id, finalData) : await fleetService.createRoadRoute(finalData);
            } else if (activeTab === 'petrol') {
                res = editingItem ? await fleetService.updatePetrol(editingItem.id, finalData) : await fleetService.createPetrol(finalData);
            } else if (activeTab === 'points') {
                res = editingItem ? await fleetService.updatePoint(editingItem.id, finalData) : await fleetService.createPoint(finalData);
            }
            
            console.log('API Response:', res);
            if (res.code === 200 || res.status === 200) {
                toast.success('Đã lưu thành công');
                setIsModalOpen(false);
                fetchData();
            } else {
                toast.error(res.message || 'Lưu không thành công');
            }
        } catch (error: any) {
            console.error('Save Error:', error);
            const msg = error.response?.data?.message || 'Lỗi hệ thống';
            toast.error(msg);
        }
    };

    const handleStartTrip = async (petrolId: number) => {
        try {
            await fleetService.startDriverRouter(petrolId);
            toast.success('Đã bắt đầu chuyến đi');
            setActiveTab('assignments');
        } catch (error) {
            toast.error('Không thể bắt đầu chuyến đi');
        }
    };

    const handleFinishTrip = async (petrolId: number) => {
        try {
            await fleetService.finishDriverRouter(petrolId);
            toast.success('Đã kết thúc chuyến đi');
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi kết thúc chuyến đi');
        }
    };

    const renderCard = (item: any) => {
        switch (activeTab) {
            case 'fleets':
                return (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.itemTitle}>{item.name}</div>
                            <div className={styles.itemActions}>
                                <button onClick={() => handleOpenModal(item)} title="Sửa" className={styles.iconBtn}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} title="Xóa" className={`${styles.iconBtn} ${styles.btnDanger}`}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <p className={styles.cardNote}>{item.description || 'Không có mô tả'}</p>
                        <div className={styles.badgeLine}>{item.carCount || 0} xe trong đội</div>
                    </div>
                );
            case 'cars':
                const fleetName = fleets.find(f => f.id === item.carFleetId)?.name || 'Chưa phân đội';
                return (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.licensePlate}>{item.licensePlates}</div>
                            <div className={styles.itemActions}>
                                <button onClick={() => handleOpenModal(item)} title="Sửa" className={styles.iconBtn}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} title="Xóa" className={`${styles.iconBtn} ${styles.btnDanger}`}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className={styles.badgeLine} style={{ background: '#e0f2fe', color: '#0369a1' }}>
                            <Truck size={14} /> {fleetName}
                        </div>
                        <p className={styles.cardNote}>{item.note || 'Không có ghi chú'}</p>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}><Fuel size={14} /> Nhiên liệu</div>
                                <div className={styles.statValue}>{item.fuelAmount} L/km</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}><ChevronRight size={14} /> Định mức</div>
                                <div className={styles.statValue}>{item.mileageAllowance} km</div>
                            </div>
                        </div>
                    </div>
                );
            case 'routes':
                return (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.itemTitle}>{item.name}</div>
                            <div className={styles.itemActions}>
                                <button onClick={() => handleOpenModal(item)} title="Sửa" className={styles.iconBtn}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} title="Xóa" className={`${styles.iconBtn} ${styles.btnDanger}`}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className={styles.routeCode}>#{item.code}</div>
                        <div className={styles.itemDetail}><MapPin size={16} /> {item.roadRouteDetail || 'Chưa định nghĩa chi tiết'}</div>
                        <div className={styles.badgeLine}>{item.numberOfTrips} chuyến định kỳ</div>
                    </div>
                );
            case 'assignments':
                return (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.itemTitle}>{item.licensePlates} - {item.driverName || 'N/A'}</div>
                            <div className={styles.itemActions}>
                                {item.status !== 'Finish' && (
                                    <button onClick={() => handleFinishTrip(item.petrolConsumptionId)} title="Kết thúc" className={styles.iconBtn} style={{ color: '#ef4444' }}>
                                        <X size={16} />
                                    </button>
                                )}
                                <button onClick={() => handleDelete(item.id)} title="Xóa" className={`${styles.iconBtn} ${styles.btnDanger}`}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className={styles.itemDetail}><Clock size={16} /> {new Date(item.date).toLocaleDateString()}</div>
                        <div className={styles.itemDetail}><Map size={16} /> {item.roadRouteName}</div>
                        <div style={{ marginTop: '12px' }}>
                            <span className={`${styles.statusBadge} ${item.status === 'Running' ? styles.statusActive : styles.statusAlert}`}>
                                {item.status === 'Running' ? 'Đang đi' : 'Đã xong'}
                            </span>
                        </div>
                    </div>
                );
            case 'petrol':
                return (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.itemTitle}>Phiếu #{item.id} - {item.licensePlates || 'Xe ẩn'}</div>
                            <div className={styles.itemActions}>
                                <button onClick={() => handleStartTrip(item.id)} title="Bắt đầu chạy" className={styles.iconBtn} style={{ color: '#10b981' }}>
                                    <ChevronRight size={18} />
                                </button>
                                <button onClick={() => handleOpenModal(item)} title="Sửa" className={styles.iconBtn}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} title="Xóa" className={`${styles.iconBtn} ${styles.btnDanger}`}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className={styles.itemDetail}><Clock size={16} /> {new Date(item.date).toLocaleDateString()}</div>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>Giá xăng</div>
                                <div className={styles.statValue}>{item.petroPrice?.toLocaleString()} đ</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>Tiền ứng</div>
                                <div className={styles.statValue}>{item.advanceAmount?.toLocaleString()} đ</div>
                            </div>
                        </div>
                    </div>
                );
            case 'points':
                return (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.itemTitle}>{item.name}</div>
                            <div className={styles.itemActions}>
                                <button onClick={() => handleOpenModal(item)} className={styles.iconBtn}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className={`${styles.iconBtn} ${styles.btnDanger}`}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className={styles.routeCode}>Mã: {item.code}</div>
                        <div className={styles.badgeLine}>Phí: {item.amount?.toLocaleString()} đ</div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Quản lý Vận tải</h1>
                    <p className={styles.subtitle}>Thiết lập và theo dõi lộ trình vận chuyển toàn hệ thống.</p>
                </div>
                <button onClick={() => handleOpenModal()} className={styles.btnPrimary}>
                    <Plus size={20} /> Thêm mới
                </button>
            </div>

            <div className={styles.tabButtons}>
                <button className={`${styles.tabBtn} ${activeTab === 'fleets' ? styles.active : ''}`} onClick={() => setActiveTab('fleets')}>
                    <Truck size={18} /> Đội xe
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'cars' ? styles.active : ''}`} onClick={() => setActiveTab('cars')}>
                    <Truck size={18} /> Danh sách xe
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'routes' ? styles.active : ''}`} onClick={() => setActiveTab('routes')}>
                    <MapPin size={18} /> Tuyến đường
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'assignments' ? styles.active : ''}`} onClick={() => setActiveTab('assignments')}>
                    <Navigation size={18} /> Lịch trình
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'petrol' ? styles.active : ''}`} onClick={() => setActiveTab('petrol')}>
                    <Fuel size={18} /> Xăng dầu
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'points' ? styles.active : ''}`} onClick={() => setActiveTab('points')}>
                    <ShieldAlert size={18} /> Điểm chốt
                </button>
            </div>

            <div className={styles.grid}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Clock size={40} />
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'fleets' && (fleets.length > 0 ? fleets.map(renderCard) : <div className={styles.emptyState}><Truck size={40} /><p>Chưa có đội xe nào</p></div>)}
                        {activeTab === 'cars' && (cars.length > 0 ? cars.map(renderCard) : <div className={styles.emptyState}><Truck size={40} /><p>Chưa có xe nào</p></div>)}
                        {activeTab === 'routes' && (routes.length > 0 ? routes.map(renderCard) : <div className={styles.emptyState}><MapPin size={40} /><p>Chưa có tuyến đường nào</p></div>)}
                        {activeTab === 'assignments' && (assignments.length > 0 ? assignments.map(renderCard) : <div className={styles.emptyState}><Navigation size={40} /><p>Chưa có lịch trình nào</p></div>)}
                        {activeTab === 'petrol' && (petrols.length > 0 ? petrols.map(renderCard) : <div className={styles.emptyState}><Fuel size={40} /><p>Chưa có dữ liệu xăng dầu</p></div>)}
                        {activeTab === 'points' && (points.length > 0 ? points.map(renderCard) : <div className={styles.emptyState}><ShieldAlert size={40} /><p>Chưa có điểm chốt nào</p></div>)}
                    </>
                )}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{editingItem ? 'Cập nhật' : 'Thêm mới'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}><X /></button>
                        </div>
                        <form onSubmit={handleSave} className={styles.modalForm}>
                            {activeTab === 'fleets' && (
                                <>
                                    <div className={styles.formGroup}><label>Tên đội xe</label><input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Đội xe số 1" /></div>
                                    <div className={styles.formGroup}><label>Mô tả</label><textarea rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Nhập mô tả về đội xe này" /></div>
                                </>
                            )}

                            {activeTab === 'cars' && (
                                <>
                                    <div className={styles.formGroup}>
                                        <label>Thuộc đội xe</label>
                                        <select 
                                            value={formData.carFleetId || ''} 
                                            onChange={e => setFormData({...formData, carFleetId: e.target.value ? parseInt(e.target.value) : ''})}
                                        >
                                            <option value="">-- Chọn đội --</option>
                                            {fleets.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}><label>Biển số</label><input value={formData.licensePlates || ''} onChange={e => setFormData({...formData, licensePlates: e.target.value})} /></div>
                                        <div className={styles.formGroup}><label>Ghi chú</label><input value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})} /></div>
                                    </div>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}><label>Nhiên liệu (L/km)</label><input type="number" step="0.1" value={formData.fuelAmount || 0} onChange={e => setFormData({...formData, fuelAmount: parseFloat(e.target.value)})} /></div>
                                        <div className={styles.formGroup}><label>Định mức (km)</label><input type="number" value={formData.mileageAllowance || 0} onChange={e => setFormData({...formData, mileageAllowance: parseFloat(e.target.value)})} /></div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'routes' && (
                                <>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}><label>Mã tuyến</label><input value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} /></div>
                                        <div className={styles.formGroup}><label>Số chuyến</label><input type="number" value={formData.numberOfTrips || 1} onChange={e => setFormData({...formData, numberOfTrips: parseInt(e.target.value)})} /></div>
                                    </div>
                                    <div className={styles.formGroup}><label>Tên tuyến</label><input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                                    <div className={styles.formGroup}><label>Chi tiết lộ trình</label><textarea rows={3} value={formData.roadRouteDetail || ''} onChange={e => setFormData({...formData, roadRouteDetail: e.target.value})} placeholder="VD: Sài Gòn - Đà Lạt" /></div>
                                </>
                            )}

                            {activeTab === 'petrol' && (
                                <>
                                    <div className={styles.formGroup}>
                                        <label>Xe đổ xăng</label>
                                        <select 
                                            value={formData.carId || ''} 
                                            onChange={e => setFormData({...formData, carId: parseInt(e.target.value)})}
                                            required
                                        >
                                            <option value="">-- Chọn xe --</option>
                                            {cars.map(car => (
                                                <option key={car.id} value={car.id}>{car.licensePlates}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Tuyến đường</label>
                                        <select 
                                            value={formData.roadRouteId || ''} 
                                            onChange={e => setFormData({...formData, roadRouteId: parseInt(e.target.value)})}
                                        >
                                            <option value="">-- Chọn tuyến --</option>
                                            {routes.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}><label>Ngày đổ xăng</label><input type="date" value={formData.date?.split('T')[0] || ''} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}><label>Km bắt đầu</label><input type="number" value={formData.kmFrom || 0} onChange={e => setFormData({...formData, kmFrom: parseFloat(e.target.value)})} /></div>
                                        <div className={styles.formGroup}><label>Km kết thúc</label><input type="number" value={formData.kmTo || 0} onChange={e => setFormData({...formData, kmTo: parseFloat(e.target.value)})} /></div>
                                    </div>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}><label>Giá xăng</label><input type="number" value={formData.petroPrice || 0} onChange={e => setFormData({...formData, petroPrice: parseFloat(e.target.value)})} /></div>
                                        <div className={styles.formGroup}><label>Tiền ứng</label><input type="number" value={formData.advanceAmount || 0} onChange={e => setFormData({...formData, advanceAmount: parseFloat(e.target.value)})} /></div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'points' && (
                                <>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}><label>Mã trạm</label><input value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} /></div>
                                        <div className={styles.formGroup}><label>Phí (đ)</label><input type="number" value={formData.amount || 0} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} /></div>
                                    </div>
                                    <div className={styles.formGroup}><label>Tên trạm kiểm soát</label><input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                                </>
                            )}

                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnOutline}>Hủy</button>
                                <button type="submit" className={styles.btnPrimary}><Save size={18} /> Lưu thông tin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
