import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { VehicleDto, VehicleRentalDto } from '../services/hotel.service';

const VEHICLE_STATUS: Record<string, { label: string; cls: string }> = {
  AVAILABLE:  { label: 'Sẵn sàng',  cls: 'available' },
  RENTED:     { label: 'Đang thuê', cls: 'rented' },
  MAINTENANCE:{ label: 'Bảo trì',   cls: 'oos' },
  DAMAGED:    { label: 'Hư hỏng',   cls: 'dirty' },
};

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [rentals, setRentals] = useState<VehicleRentalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fleet' | 'rentals'>('fleet');
  const [showModal, setShowModal] = useState(false);
  const [returnModal, setReturnModal] = useState<VehicleRentalDto | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    vehicleCode: '', guestName: '', guestPhone: '', rentFrom: '', rentTo: '', depositAmount: 0, notes: '',
  });
  const [returnForm, setReturnForm] = useState({ fuelLevel: 100, damageFee: 0, depositReturned: 0, notes: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [v, r] = await Promise.all([hotelService.getVehicles(), hotelService.getActiveRentals()]);
      setVehicles(v);
      setRentals(r);
    } catch { toast.error('Lỗi tải dữ liệu xe'); }
    finally { setLoading(false); }
  };

  const handleRent = async () => {
    if (!form.vehicleCode || !form.guestName || !form.rentFrom || !form.rentTo)
      return toast.error('Vui lòng điền đầy đủ thông tin');
    try {
      await hotelService.createRental(form);
      toast.success('Cho thuê xe thành công!');
      setShowModal(false);
      setForm({ vehicleCode: '', guestName: '', guestPhone: '', rentFrom: '', rentTo: '', depositAmount: 0, notes: '' });
      fetchAll();
    } catch { toast.error('Lỗi tạo phiếu thuê xe'); }
  };

  const handleReturn = async () => {
    if (!returnModal) return;
    try {
      await hotelService.returnVehicle(returnModal.id, returnForm);
      toast.success(`Trả xe ${returnModal.vehicleCode} thành công!`);
      setReturnModal(null);
      fetchAll();
    } catch { toast.error('Lỗi xử lý trả xe'); }
  };

  const now = new Date();
  const filteredVehicles = vehicles.filter(v =>
    !search || v.vehicleCode?.toLowerCase().includes(search.toLowerCase()) || v.licensePlate?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRentals = rentals.filter(r =>
    !search || r.guestName?.toLowerCase().includes(search.toLowerCase()) || r.vehicleCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>🏍️ Cho Thuê Xe Máy</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            {vehicles.filter(v => v.status === 'AVAILABLE').length}/{vehicles.length} xe sẵn sàng ·{' '}
            {rentals.filter(r => new Date(r.rentTo) < now).length} quá hạn
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={fetchAll}><RefreshCw size={15} /> Làm mới</button>
          <button className={styles.btnPrimary} onClick={() => setShowModal(true)}><Plus size={15} /> Cho thuê xe</button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} style={{ marginBottom: 20 }}>
        <button className={`${styles.tab} ${activeTab === 'fleet' ? styles.active : ''}`} onClick={() => setActiveTab('fleet')}>
          🚗 Kho xe ({vehicles.length})
        </button>
        <button className={`${styles.tab} ${activeTab === 'rentals' ? styles.active : ''}`} onClick={() => setActiveTab('rentals')}>
          📋 Đang thuê ({rentals.length})
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchBar} style={{ marginBottom: 16 }}>
        <div className={styles.searchInput}>
          <Search size={16} color="#94a3b8" />
          <input placeholder="Tìm theo mã xe, biển số, tên khách..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Đang tải...</div>
      ) : activeTab === 'fleet' ? (
        /* Kho xe Grid */
        <div className={styles.vehicleGrid}>
          {filteredVehicles.length === 0 ? (
            <div className={styles.emptyState}><div className={styles.emptyIcon}>🏍️</div><p>Chưa có xe nào</p></div>
          ) : filteredVehicles.map(v => {
            const st = VEHICLE_STATUS[v.status || 'AVAILABLE'] || { label: v.status, cls: 'available' };
            return (
              <div key={v.id} className={`${styles.vehicleCard}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{v.vehicleCode}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{v.licensePlate}</div>
                  </div>
                  <span className={`${styles.badge} ${styles[st.cls]}`}>{st.label}</span>
                </div>
                <div style={{ fontSize: 14, color: '#334155', marginBottom: 8 }}>{v.vehicleName || 'Xe máy'}</div>
                {v.fuelLevel !== undefined && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                      <span>⛽ Nhiên liệu</span><span>{v.fuelLevel}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.fill} style={{ width: `${v.fuelLevel}%`, background: v.fuelLevel < 30 ? '#ef4444' : '#22c55e' }} />
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}>
                  <span>💰 {(v.pricePerDay || 0).toLocaleString('vi-VN')}đ/ngày</span>
                  <span>🔒 Đặt cọc: {(v.depositAmount || 0).toLocaleString('vi-VN')}đ</span>
                </div>
                {v.status === 'AVAILABLE' && (
                  <button className={styles.btnPrimary} style={{ width: '100%', marginTop: 12 }}
                    onClick={() => { setForm(f => ({ ...f, vehicleCode: v.vehicleCode })); setShowModal(true); }}>
                    Cho thuê
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Danh sách đang thuê */
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Mã phiếu</th><th>Xe</th><th>Khách thuê</th><th>Từ ngày</th>
                <th>Đến ngày</th><th>Số ngày</th><th>Tiền cọc</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không có xe đang thuê</td></tr>
              ) : filteredRentals.map(r => {
                const overdue = new Date(r.rentTo) < now && r.status === 'ACTIVE';
                return (
                  <tr key={r.id} style={{ background: overdue ? '#fef2f2' : undefined }}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563eb' }}>{r.rentalCode}</td>
                    <td><strong>{r.vehicleCode}</strong><br /><span style={{ fontSize: 12, color: '#94a3b8' }}>{r.licensePlate}</span></td>
                    <td><strong>{r.guestName}</strong><br /><span style={{ fontSize: 12, color: '#94a3b8' }}>{r.guestPhone}</span></td>
                    <td>{new Date(r.rentFrom).toLocaleDateString('vi-VN')}</td>
                    <td style={{ color: overdue ? '#dc2626' : undefined, fontWeight: overdue ? 700 : 400 }}>
                      {new Date(r.rentTo).toLocaleDateString('vi-VN')}
                      {overdue && <span style={{ marginLeft: 6, fontSize: 11, background: '#fecaca', color: '#dc2626', padding: '2px 6px', borderRadius: 4 }}>Quá hạn</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>{r.totalDays} ngày</td>
                    <td>{(r.depositAmount || 0).toLocaleString('vi-VN')}đ</td>
                    <td style={{ fontWeight: 700 }}>{(r.totalAmount || 0).toLocaleString('vi-VN')}đ</td>
                    <td><span className={`${styles.badge} ${overdue ? styles.dirty : styles.checkedIn}`}>{overdue ? 'Quá hạn' : 'Đang thuê'}</span></td>
                    <td>
                      <button className={styles.btnDanger} style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={() => { setReturnModal(r); setReturnForm({ fuelLevel: 100, damageFee: 0, depositReturned: r.depositAmount || 0, notes: '' }); }}>
                        Trả xe
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal cho thuê xe */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>🏍️ Tạo Phiếu Cho Thuê Xe</h3>
              <button className={styles.btnIcon} onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Mã xe *</label>
                  <select value={form.vehicleCode} onChange={e => setForm(f => ({ ...f, vehicleCode: e.target.value }))}>
                    <option value="">-- Chọn xe --</option>
                    {vehicles.filter(v => v.status === 'AVAILABLE').map(v => (
                      <option key={v.vehicleCode} value={v.vehicleCode}>{v.vehicleCode} — {v.licensePlate}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Tên khách *</label>
                  <input value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} placeholder="Nguyễn Văn A" />
                </div>
                <div className={styles.formGroup}>
                  <label>Số điện thoại</label>
                  <input value={form.guestPhone} onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))} placeholder="0912345678" />
                </div>
                <div className={styles.formGroup}>
                  <label>Tiền đặt cọc (đ)</label>
                  <input type="number" value={form.depositAmount} onChange={e => setForm(f => ({ ...f, depositAmount: Number(e.target.value) }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Từ ngày *</label>
                  <input type="datetime-local" value={form.rentFrom} onChange={e => setForm(f => ({ ...f, rentFrom: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Đến ngày *</label>
                  <input type="datetime-local" value={form.rentTo} onChange={e => setForm(f => ({ ...f, rentTo: e.target.value }))} />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}>
                  <label>Ghi chú</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleRent}>✅ Xác nhận cho thuê</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal trả xe */}
      {returnModal && (
        <div className={styles.modalBackdrop} onClick={() => setReturnModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>🔄 Trả Xe — {returnModal.vehicleCode}</h3>
              <button className={styles.btnIcon} onClick={() => setReturnModal(null)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Mức nhiên liệu khi trả (%)</label>
                  <input type="number" min={0} max={100} value={returnForm.fuelLevel}
                    onChange={e => setReturnForm(f => ({ ...f, fuelLevel: Number(e.target.value) }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Phí hư hỏng (đ)</label>
                  <input type="number" value={returnForm.damageFee}
                    onChange={e => setReturnForm(f => ({ ...f, damageFee: Number(e.target.value) }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Hoàn cọc (đ)</label>
                  <input type="number" value={returnForm.depositReturned}
                    onChange={e => setReturnForm(f => ({ ...f, depositReturned: Number(e.target.value) }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Ghi chú</label>
                  <input value={returnForm.notes} onChange={e => setReturnForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setReturnModal(null)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleReturn}>✅ Xác nhận trả xe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
