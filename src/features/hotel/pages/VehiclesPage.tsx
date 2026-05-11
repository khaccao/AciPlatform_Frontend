import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { VehicleDto, VehicleRentalDto } from '../services/hotel.service';

const VEHICLE_STATUS: Record<string, { label: string; cls: string }> = {
  AVAILABLE: { label: 'Sáºµn sĂ ng', cls: 'available' },
  RENTED: { label: 'Äang thuĂª', cls: 'rented' },
  MAINTENANCE: { label: 'Báº£o trĂ¬', cls: 'maintenance' },
};

export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'fleet' | 'rentals'>('fleet');
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [rentals, setRentals] = useState<VehicleRentalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showRentModal, setShowRentModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState<VehicleRentalDto | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // Rent form
  const [rentForm, setRentForm] = useState({
    vehicleCode: '', guestName: '', guestPhone: '', guestIdCard: '',
    rentFrom: new Date().toISOString().slice(0, 16),
    rentTo: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    depositAmount: 500000, bookingId: '',
  });
  // Return form
  const [returnForm, setReturnForm] = useState({ fuelLevel: 80, damageFee: 0, damageNote: '' });
  // Vehicle form
  const [vehicleForm, setVehicleForm] = useState({
    vehicleCode: '', licensePlate: '', vehicleName: '', vehicleType: 'MANUAL',
    pricePerDay: 120000, depositAmount: 500000, fuelLevel: 100, condition: 'GOOD',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [v, r] = await Promise.all([hotelService.getVehicles(), hotelService.getActiveRentals()]);
      setVehicles(v);
      setRentals(r);
    } catch { toast.error('Lá»—i táº£i dá»¯ liá»‡u xe'); }
    finally { setLoading(false); }
  };

  const handleRent = async () => {
    if (!rentForm.vehicleCode || !rentForm.guestName || !rentForm.guestPhone) {
      toast.error('Vui lĂ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thĂ´ng tin'); return;
    }
    try {
      const days = Math.max(1, Math.ceil((new Date(rentForm.rentTo).getTime() - new Date(rentForm.rentFrom).getTime()) / 86400000));
      const v = vehicles.find(x => x.vehicleCode === rentForm.vehicleCode);
      await hotelService.createRental({
        ...rentForm, totalDays: days,
        pricePerDay: v?.pricePerDay || 0,
        totalAmount: days * (v?.pricePerDay || 0),
        bookingId: rentForm.bookingId ? Number(rentForm.bookingId) : undefined,
      });
      toast.success('Giao xe thĂ nh cĂ´ng!');
      setShowRentModal(false);
      fetchAll();
    } catch { toast.error('Lá»—i táº¡o giao dá»‹ch thuĂª xe'); }
  };

  const handleReturn = async () => {
    if (!selectedRental) return;
    try {
      await hotelService.returnVehicle(selectedRental.id, {
        fuelLevel: returnForm.fuelLevel,
        damageFee: returnForm.damageFee,
        damageNote: returnForm.damageNote,
        returnedAt: new Date().toISOString(),
      });
      toast.success('Nháº­n xe thĂ nh cĂ´ng!');
      setShowReturnModal(false);
      setSelectedRental(null);
      fetchAll();
    } catch { toast.error('Lá»—i nháº­n xe'); }
  };

  const handleAddVehicle = async () => {
    try {
      await hotelService.upsertVehicle(vehicleForm);
      toast.success('ThĂªm xe thĂ nh cĂ´ng!');
      setShowAddVehicle(false);
      fetchAll();
    } catch { toast.error('Lá»—i thĂªm xe'); }
  };

  const fmtMoney = (n: number) => n?.toLocaleString('vi-VN') + 'Ä‘';
  const calcDays = (from: string, to: string) => Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000));
  const isOverdue = (rentTo: string) => new Date(rentTo) < new Date();

  const filteredVehicles = vehicles.filter(v => {
    if (statusFilter && v.status !== statusFilter) return false;
    if (search && !v.vehicleName?.toLowerCase().includes(search.toLowerCase()) && !v.licensePlate?.includes(search)) return false;
    return true;
  });

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <h1>đŸï¸ Quáº£n LĂ½ Xe MĂ¡y</h1>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={fetchAll}><RefreshCw size={15} /> LĂ m má»›i</button>
          <button className={styles.btnSecondary} onClick={() => setShowAddVehicle(true)}><Plus size={15} /> ThĂªm xe</button>
          <button className={styles.btnPrimary} onClick={() => setShowRentModal(true)}><Plus size={15} /> Cho thuĂª xe</button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'fleet' ? styles.active : ''}`} onClick={() => setTab('fleet')}>
          đŸ— Kho xe ({vehicles.length})
        </button>
        <button className={`${styles.tab} ${tab === 'rentals' ? styles.active : ''}`} onClick={() => setTab('rentals')}>
          đŸ“‹ Äang thuĂª ({rentals.length})
          {rentals.some(r => isOverdue(r.rentTo)) && <span style={{ marginLeft: 6, background: '#ef4444', color: '#fff', borderRadius: 999, padding: '1px 6px', fontSize: 11 }}>!</span>}
        </button>
      </div>

      {tab === 'fleet' && (
        <>
          <div className={styles.searchBar}>
            <div className={styles.searchInput}>
              <Search size={16} color="#94a3b8" />
              <input placeholder="TĂ¬m biá»ƒn sá»‘, tĂªn xe..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Táº¥t cáº£ tĂ¬nh tráº¡ng</option>
              {Object.entries(VEHICLE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Äang táº£i...</div> : (
            <div className={styles.vehicleGrid}>
              {filteredVehicles.map(v => {
                const st = VEHICLE_STATUS[v.status || 'AVAILABLE'];
                return (
                  <div key={v.id} className={`${styles.vehicleCard} ${styles[st.cls]}`}>
                    <div className={styles.vehicleImg}>đŸï¸</div>
                    <div className={styles.vehicleName}>{v.vehicleName || 'Xe mĂ¡y'}</div>
                    <div className={styles.vehiclePlate}>{v.licensePlate}</div>
                    <div style={{ margin: '8px 0' }}>
                      <span className={`${styles.badge} ${styles[st.cls]}`}>{st.label}</span>
                      <span style={{ marginLeft: 8, fontSize: 12, color: '#64748b' }}>{v.vehicleType}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                      XÄƒng: {v.fuelLevel || 0}%
                      <div className={`${styles.progressBar} ${styles.fuelBar}`} style={{ marginTop: 4 }}>
                        <div className={styles.fill} style={{ width: `${v.fuelLevel || 0}%`, background: (v.fuelLevel || 0) < 30 ? '#ef4444' : '#22c55e' }} />
                      </div>
                    </div>
                    <div className={styles.vehiclePrice}>{fmtMoney(v.pricePerDay)}<span className={styles.tourPriceSub}>/ngĂ y</span></div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Cá»c: {fmtMoney(v.depositAmount)}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {v.status === 'AVAILABLE' && (
                        <button className={styles.btnPrimary} style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => { setRentForm(f => ({ ...f, vehicleCode: v.vehicleCode })); setShowRentModal(true); }}>
                          Cho thuĂª
                        </button>
                      )}
                      {v.status !== 'AVAILABLE' && <span style={{ flex: 1, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>KhĂ´ng sáºµn sĂ ng</span>}
                    </div>
                  </div>
                );
              })}
              {filteredVehicles.length === 0 && <div className={styles.emptyState} style={{ gridColumn: '1/-1' }}><div className={styles.emptyIcon}>đŸï¸</div><p>KhĂ´ng cĂ³ xe phĂ¹ há»£p</p></div>}
            </div>
          )}
        </>
      )}

      {tab === 'rentals' && (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>MĂ£ thuĂª</th>
                <th>Xe</th>
                <th>KhĂ¡ch thuĂª</th>
                <th>ThuĂª tá»«</th>
                <th>Háº¡n tráº£</th>
                <th>Thá»i gian</th>
                <th>Cá»c</th>
                <th>Tá»•ng tiá»n</th>
                <th>Tráº¡ng thĂ¡i</th>
                <th style={{ textAlign: 'center' }}>Thao tĂ¡c</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32 }}>Äang táº£i...</td></tr>
              ) : rentals.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>KhĂ´ng cĂ³ giao dá»‹ch thuĂª xe nĂ o Ä‘ang active</td></tr>
              ) : rentals.map(r => {
                const overdue = isOverdue(r.rentTo);
                const daysLeft = Math.ceil((new Date(r.rentTo).getTime() - Date.now()) / 86400000);
                return (
                  <tr key={r.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563eb' }}>{r.rentalCode}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.vehicleName || r.vehicleCode}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{r.licensePlate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.guestName}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.guestPhone}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{new Date(r.rentFrom).toLocaleString('vi-VN')}</td>
                    <td style={{ color: overdue ? '#dc2626' : '#334155', fontWeight: overdue ? 700 : 500 }}>
                      {new Date(r.rentTo).toLocaleString('vi-VN')}
                      {overdue && <div style={{ fontSize: 11, color: '#dc2626' }}>â ï¸ QUĂ Háº N</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: overdue ? '#dc2626' : '#1e293b' }}>
                        {overdue ? `+${Math.abs(daysLeft)} ngĂ y` : `${daysLeft} ngĂ y`}
                      </span>
                    </td>
                    <td>{fmtMoney(r.depositAmount)}</td>
                    <td style={{ fontWeight: 700 }}>{fmtMoney(r.totalAmount)}</td>
                    <td><span className={`${styles.badge} ${overdue ? styles.overdue : styles.active}`}>{overdue ? 'QuĂ¡ háº¡n' : 'Äang thuĂª'}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <button className={styles.btnSuccess} style={{ padding: '5px 12px', fontSize: 12 }}
                        onClick={() => { setSelectedRental(r); setShowReturnModal(true); }}>
                        Nháº­n xe
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rent Modal */}
      {showRentModal && (
        <div className={styles.overlay} onClick={() => setShowRentModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>đŸï¸ Giao xe cho khĂ¡ch</h2>
              <button className={styles.btnIcon} onClick={() => setShowRentModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Xe <span className={styles.required}>*</span></label>
                  <select value={rentForm.vehicleCode} onChange={e => setRentForm(f => ({ ...f, vehicleCode: e.target.value }))}>
                    <option value="">-- Chá»n xe --</option>
                    {vehicles.filter(v => v.status === 'AVAILABLE').map(v => (
                      <option key={v.vehicleCode} value={v.vehicleCode}>{v.vehicleName} â€” {v.licensePlate} ({fmtMoney(v.pricePerDay)}/ngĂ y)</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>MĂ£ booking (náº¿u cĂ³)</label>
                  <input type="number" placeholder="BK ID" value={rentForm.bookingId} onChange={e => setRentForm(f => ({ ...f, bookingId: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>TĂªn khĂ¡ch <span className={styles.required}>*</span></label>
                  <input value={rentForm.guestName} onChange={e => setRentForm(f => ({ ...f, guestName: e.target.value }))} placeholder="Há» vĂ  tĂªn" />
                </div>
                <div className={styles.formGroup}>
                  <label>SÄT <span className={styles.required}>*</span></label>
                  <input value={rentForm.guestPhone} onChange={e => setRentForm(f => ({ ...f, guestPhone: e.target.value }))} placeholder="0912..." />
                </div>
                <div className={styles.formGroup}>
                  <label>CMND/Passport</label>
                  <input value={rentForm.guestIdCard} onChange={e => setRentForm(f => ({ ...f, guestIdCard: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Tiá»n cá»c</label>
                  <input type="number" value={rentForm.depositAmount} onChange={e => setRentForm(f => ({ ...f, depositAmount: Number(e.target.value) }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>ThuĂª tá»«</label>
                  <input type="datetime-local" value={rentForm.rentFrom} onChange={e => setRentForm(f => ({ ...f, rentFrom: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Tráº£ xe lĂºc</label>
                  <input type="datetime-local" value={rentForm.rentTo} onChange={e => setRentForm(f => ({ ...f, rentTo: e.target.value }))} />
                </div>
              </div>
              {rentForm.vehicleCode && rentForm.rentFrom && rentForm.rentTo && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: '#eff6ff', borderRadius: 10, fontSize: 14 }}>
                  đŸ’¡ {calcDays(rentForm.rentFrom, rentForm.rentTo)} ngĂ y Ă— {fmtMoney(vehicles.find(v => v.vehicleCode === rentForm.vehicleCode)?.pricePerDay || 0)} =
                  <strong style={{ color: '#1e6fff', marginLeft: 6 }}>{fmtMoney(calcDays(rentForm.rentFrom, rentForm.rentTo) * (vehicles.find(v => v.vehicleCode === rentForm.vehicleCode)?.pricePerDay || 0))}</strong>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowRentModal(false)}>Há»§y</button>
              <button className={styles.btnPrimary} onClick={handleRent}>âœ… XĂ¡c nháº­n giao xe</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedRental && (
        <div className={styles.overlay} onClick={() => setShowReturnModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>đŸ”„ Nháº­n xe láº¡i â€” {selectedRental.vehicleCode}</h2>
              <button className={styles.btnIcon} onClick={() => setShowReturnModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ marginBottom: 16, padding: 14, background: '#f8fafc', borderRadius: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedRental.guestName} â€” {selectedRental.vehicleName}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>ThuĂª {selectedRental.totalDays} ngĂ y â€” {(selectedRental.totalAmount).toLocaleString()}Ä‘</div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Má»©c xÄƒng khi tráº£ (%)</label>
                  <input type="range" min={0} max={100} value={returnForm.fuelLevel}
                    onChange={e => setReturnForm(f => ({ ...f, fuelLevel: Number(e.target.value) }))} />
                  <div style={{ textAlign: 'center', fontWeight: 700, color: '#1e6fff' }}>{returnForm.fuelLevel}%</div>
                </div>
                <div className={styles.formGroup}>
                  <label>PhĂ­ hÆ° há»ng (Ä‘)</label>
                  <input type="number" value={returnForm.damageFee} onChange={e => setReturnForm(f => ({ ...f, damageFee: Number(e.target.value) }))} />
                </div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                  <label>Ghi chĂº hÆ° há»ng</label>
                  <textarea value={returnForm.damageNote} onChange={e => setReturnForm(f => ({ ...f, damageNote: e.target.value }))} placeholder="MĂ´ táº£ hÆ° há»ng náº¿u cĂ³..." />
                </div>
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, fontSize: 14 }}>
                đŸ’° HoĂ n cá»c: <strong style={{ color: '#16a34a' }}>{fmtMoney(selectedRental.depositAmount - returnForm.damageFee)}</strong>
                {returnForm.damageFee > 0 && <span style={{ color: '#dc2626', marginLeft: 8 }}>(trá»« {fmtMoney(returnForm.damageFee)} phĂ­ hÆ° há»ng)</span>}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowReturnModal(false)}>Há»§y</button>
              <button className={styles.btnSuccess} onClick={handleReturn}>âœ… XĂ¡c nháº­n nháº­n xe</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className={styles.overlay} onClick={() => setShowAddVehicle(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>â• ThĂªm xe má»›i</h2>
              <button className={styles.btnIcon} onClick={() => setShowAddVehicle(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {[
                  { label: 'MĂ£ xe', key: 'vehicleCode', placeholder: 'XS-01' },
                  { label: 'Biá»ƒn sá»‘', key: 'licensePlate', placeholder: '23A-12345' },
                  { label: 'TĂªn xe', key: 'vehicleName', placeholder: 'Xe sá»‘ Honda' },
                ].map(f => (
                  <div className={styles.formGroup} key={f.key}>
                    <label>{f.label}</label>
                    <input value={(vehicleForm as any)[f.key]} placeholder={f.placeholder}
                      onChange={e => setVehicleForm(v => ({ ...v, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className={styles.formGroup}>
                  <label>Loáº¡i xe</label>
                  <select value={vehicleForm.vehicleType} onChange={e => setVehicleForm(v => ({ ...v, vehicleType: e.target.value }))}>
                    <option value="MANUAL">Xe sá»‘</option>
                    <option value="AUTOMATIC">Xe tay ga</option>
                    <option value="SEMI_MANUAL">Xe cĂ´n</option>
                    <option value="OTHER">KhĂ¡c</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>GiĂ¡/ngĂ y (Ä‘)</label>
                  <input type="number" value={vehicleForm.pricePerDay} onChange={e => setVehicleForm(v => ({ ...v, pricePerDay: Number(e.target.value) }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Tiá»n cá»c (Ä‘)</label>
                  <input type="number" value={vehicleForm.depositAmount} onChange={e => setVehicleForm(v => ({ ...v, depositAmount: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowAddVehicle(false)}>Há»§y</button>
              <button className={styles.btnPrimary} onClick={handleAddVehicle}>đŸ’¾ ThĂªm xe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;

