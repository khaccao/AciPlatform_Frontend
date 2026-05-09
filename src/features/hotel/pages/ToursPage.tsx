import React, { useEffect, useState } from 'react';
import { Plus, X, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService, { HotelTourDto } from '../services/hotel.service';

const DIFFICULTY_LABELS: Record<string, string> = { EASY: 'Dễ', MODERATE: 'Trung bình', HARD: 'Khó' };
const TOUR_TYPES: Record<string, string> = { DAY_TRIP: 'Day Trip', LOOP: 'Loop Tour', TREKKING: 'Trekking', CAR_TOUR: 'Xe ô tô' };

export const ToursPage: React.FC = () => {
  const [tab, setTab] = useState<'catalog' | 'guides' | 'schedules'>('catalog');
  const [tours, setTours] = useState<HotelTourDto[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showTourModal, setShowTourModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [editTour, setEditTour] = useState<HotelTourDto | null>(null);

  const [tourForm, setTourForm] = useState({
    tourCode: '', tourName: '', tourNameEN: '', tourType: 'DAY_TRIP',
    durationDays: 1, durationNights: 0, maxPerson: 10, minPerson: 1,
    pricePerPerson: 0, groupPrice: 0, groupDiscountFrom: 5,
    highlights: '', itinerary: '', inclusions: '', exclusions: '',
    meetingPoint: '', difficulty: 'EASY', isAvailable: true, sortOrder: 0,
  });

  const [guideForm, setGuideForm] = useState({
    name: '', phone: '', email: '', languages: 'Tiếng Việt', speciality: '',
    isFreelance: false, dailyRate: 0, bio: '', isActive: true,
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, g, s] = await Promise.all([hotelService.getTours(), hotelService.getGuides(), hotelService.getTourSchedules()]);
      setTours(t); setGuides(g); setSchedules(s);
    } catch { toast.error('Lỗi tải dữ liệu tour'); }
    finally { setLoading(false); }
  };

  const handleSaveTour = async () => {
    if (!tourForm.tourCode || !tourForm.tourName) { toast.error('Nhập mã và tên tour'); return; }
    try {
      await hotelService.upsertTour(tourForm);
      toast.success(editTour ? 'Cập nhật tour thành công' : 'Thêm tour thành công');
      setShowTourModal(false); fetchAll();
    } catch { toast.error('Lỗi lưu tour'); }
  };

  const handleSaveGuide = async () => {
    if (!guideForm.name) { toast.error('Nhập tên hướng dẫn viên'); return; }
    try {
      await hotelService.upsertGuide(guideForm);
      toast.success('Lưu thành công');
      setShowGuideModal(false); fetchAll();
    } catch { toast.error('Lỗi lưu HDV'); }
  };

  const handleDeleteTour = async (id: number) => {
    if (!window.confirm('Xóa tour này?')) return;
    try { await hotelService.deleteTour(id); toast.success('Xóa thành công'); fetchAll(); }
    catch { toast.error('Lỗi xóa tour'); }
  };

  const filteredTours = tours.filter(t => {
    if (typeFilter && t.tourType !== typeFilter) return false;
    if (search && !t.tourName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fmtMoney = (n: number) => n?.toLocaleString('vi-VN') + 'đ';

  const openEdit = (t: HotelTourDto) => {
    setEditTour(t);
    setTourForm({ ...t, highlights: t.highlights || '', itinerary: t.itinerary || '', inclusions: '', exclusions: '', meetingPoint: t.meetingPoint || '' } as any);
    setShowTourModal(true);
  };

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <h1>🎯 Quản Lý Tour</h1>
        <div className={styles.headerActions}>
          {tab === 'catalog' && <button className={styles.btnPrimary} onClick={() => { setEditTour(null); setTourForm({ tourCode: '', tourName: '', tourNameEN: '', tourType: 'DAY_TRIP', durationDays: 1, durationNights: 0, maxPerson: 10, minPerson: 1, pricePerPerson: 0, groupPrice: 0, groupDiscountFrom: 5, highlights: '', itinerary: '', inclusions: '', exclusions: '', meetingPoint: '', difficulty: 'EASY', isAvailable: true, sortOrder: 0 }); setShowTourModal(true); }}><Plus size={15} /> Thêm tour</button>}
          {tab === 'guides' && <button className={styles.btnPrimary} onClick={() => setShowGuideModal(true)}><Plus size={15} /> Thêm HDV</button>}
        </div>
      </div>

      <div className={styles.tabs}>
        {[['catalog', '🗺️ Catalog Tour'], ['guides', '👤 Hướng dẫn viên'], ['schedules', '📅 Lịch tour']].map(([k, l]) => (
          <button key={k} className={`${styles.tab} ${tab === k ? styles.active : ''}`} onClick={() => setTab(k as any)}>{l}</button>
        ))}
      </div>

      {/* Tour Catalog */}
      {tab === 'catalog' && (
        <>
          <div className={styles.searchBar}>
            <div className={styles.searchInput}><Search size={16} color="#94a3b8" /><input placeholder="Tìm tour..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <select className={styles.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Tất cả loại</option>
              {Object.entries(TOUR_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Đang tải...</div> : (
            <div className={styles.tourGrid}>
              {filteredTours.map(t => (
                <div key={t.id} className={styles.tourCard}>
                  <div className={styles.tourImg}>🏔️</div>
                  <div className={styles.tourBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div className={styles.tourName}>{t.tourName}</div>
                      <span className={`${styles.badge} ${styles[t.difficulty.toLowerCase()] || styles.easy}`} style={{ flexShrink: 0 }}>{DIFFICULTY_LABELS[t.difficulty]}</span>
                    </div>
                    <div className={styles.tourMeta}>
                      <span>⏱ {t.durationDays} ngày {t.durationNights} đêm</span>
                      <span>👥 {t.minPerson}–{t.maxPerson} người</span>
                      <span className={`${styles.badge} ${t.isAvailable ? styles.vacant : styles.oos}`}>{t.isAvailable ? 'Mở' : 'Đóng'}</span>
                    </div>
                    {t.highlights && <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 10px', lineHeight: 1.5 }}>{t.highlights.substring(0, 120)}{t.highlights.length > 120 ? '...' : ''}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div className={styles.tourPrice}>{fmtMoney(t.pricePerPerson)}<span className={styles.tourPriceSub}>/người</span></div>
                        {t.groupPrice > 0 && <div style={{ fontSize: 12, color: '#94a3b8' }}>Đoàn: {fmtMoney(t.groupPrice)}</div>}
                      </div>
                    </div>
                    <div className={styles.tourActions}>
                      <button className={styles.btnPrimary} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} onClick={() => openEdit(t)}><Edit size={14} /> Sửa</button>
                      <button className={styles.btnDanger} style={{ padding: '7px 12px' }} onClick={() => handleDeleteTour(t.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTours.length === 0 && (
                <div className={styles.emptyState} style={{ gridColumn: '1/-1' }}>
                  <div className={styles.emptyIcon}>🗺️</div>
                  <p>Chưa có tour nào. Nhấn "+ Thêm tour" để bắt đầu.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Guides */}
      {tab === 'guides' && (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr><th>Tên</th><th>SĐT</th><th>Ngôn ngữ</th><th>Chuyên môn</th><th>Loại</th><th>Giá/ngày</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>Đang tải...</td></tr>
                : guides.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Chưa có hướng dẫn viên</td></tr>
                  : guides.map((g: any) => (
                    <tr key={g.id}>
                      <td><div style={{ fontWeight: 600 }}>{g.name}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{g.email}</div></td>
                      <td>{g.phone}</td>
                      <td>{g.languages}</td>
                      <td>{g.speciality}</td>
                      <td><span className={`${styles.badge} ${g.isFreelance ? styles.pending : styles.confirmed}`}>{g.isFreelance ? 'Tự do' : 'Cơ hữu'}</span></td>
                      <td>{fmtMoney(g.dailyRate)}</td>
                      <td><span className={`${styles.badge} ${g.isActive ? styles.confirmed : styles.oos}`}>{g.isActive ? 'Hoạt động' : 'Nghỉ'}</span></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedules */}
      {tab === 'schedules' && (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr><th>Tour</th><th>Ngày</th><th>HDV</th><th>Slots</th><th>Còn trống</th><th>Giá</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>Đang tải...</td></tr>
                : schedules.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Chưa có lịch tour</td></tr>
                  : schedules.map((s: any) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.tourCode}</td>
                      <td>{new Date(s.tourDate).toLocaleDateString('vi-VN')}</td>
                      <td>{s.guideName || '—'}</td>
                      <td style={{ textAlign: 'center' }}>{s.maxSlots}</td>
                      <td style={{ textAlign: 'center', color: s.availableSlots === 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{s.availableSlots}</td>
                      <td>{s.priceOverride ? fmtMoney(s.priceOverride) : '—'}</td>
                      <td><span className={`${styles.badge} ${s.status === 'OPEN' ? styles.confirmed : styles.oos}`}>{s.status}</span></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tour Modal */}
      {showTourModal && (
        <div className={styles.overlay} onClick={() => setShowTourModal(false)}>
          <div className={`${styles.modal} ${styles.modalLg}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editTour ? '✏️ Sửa tour' : '➕ Thêm tour mới'}</h2>
              <button className={styles.btnIcon} onClick={() => setShowTourModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Mã tour *</label><input value={tourForm.tourCode} onChange={e => setTourForm(f => ({ ...f, tourCode: e.target.value }))} placeholder="HG-LOOP-3D" /></div>
                <div className={styles.formGroup}><label>Loại</label>
                  <select value={tourForm.tourType} onChange={e => setTourForm(f => ({ ...f, tourType: e.target.value }))}>
                    {Object.entries(TOUR_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>Tên tour *</label><input value={tourForm.tourName} onChange={e => setTourForm(f => ({ ...f, tourName: e.target.value }))} placeholder="Ha Giang Loop 3 ngày 2 đêm" /></div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>Tên tiếng Anh</label><input value={tourForm.tourNameEN} onChange={e => setTourForm(f => ({ ...f, tourNameEN: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>Thời gian (ngày)</label><input type="number" value={tourForm.durationDays} onChange={e => setTourForm(f => ({ ...f, durationDays: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Số đêm</label><input type="number" value={tourForm.durationNights} onChange={e => setTourForm(f => ({ ...f, durationNights: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Tối thiểu người</label><input type="number" value={tourForm.minPerson} onChange={e => setTourForm(f => ({ ...f, minPerson: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Tối đa người</label><input type="number" value={tourForm.maxPerson} onChange={e => setTourForm(f => ({ ...f, maxPerson: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Giá/người (đ)</label><input type="number" value={tourForm.pricePerPerson} onChange={e => setTourForm(f => ({ ...f, pricePerPerson: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Giá đoàn (đ)</label><input type="number" value={tourForm.groupPrice} onChange={e => setTourForm(f => ({ ...f, groupPrice: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Độ khó</label>
                  <select value={tourForm.difficulty} onChange={e => setTourForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}><label>Điểm gặp</label><input value={tourForm.meetingPoint} onChange={e => setTourForm(f => ({ ...f, meetingPoint: e.target.value }))} placeholder="Lobby khách sạn" /></div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>Điểm nổi bật</label><textarea value={tourForm.highlights} onChange={e => setTourForm(f => ({ ...f, highlights: e.target.value }))} rows={3} /></div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>Lịch trình</label><textarea value={tourForm.itinerary} onChange={e => setTourForm(f => ({ ...f, itinerary: e.target.value }))} rows={4} placeholder="Ngày 1: ..." /></div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowTourModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleSaveTour}>💾 Lưu tour</button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <div className={styles.overlay} onClick={() => setShowGuideModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h2>➕ Thêm hướng dẫn viên</h2><button className={styles.btnIcon} onClick={() => setShowGuideModal(false)}><X size={20} /></button></div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Họ tên *</label><input value={guideForm.name} onChange={e => setGuideForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>SĐT</label><input value={guideForm.phone} onChange={e => setGuideForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>Ngôn ngữ</label><input value={guideForm.languages} onChange={e => setGuideForm(f => ({ ...f, languages: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>Chuyên môn</label><input value={guideForm.speciality} onChange={e => setGuideForm(f => ({ ...f, speciality: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>Giá/ngày (đ)</label><input type="number" value={guideForm.dailyRate} onChange={e => setGuideForm(f => ({ ...f, dailyRate: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup} style={{ justifyContent: 'flex-end', paddingTop: 20 }}>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={guideForm.isFreelance} onChange={e => setGuideForm(f => ({ ...f, isFreelance: e.target.checked }))} />
                    Hướng dẫn viên tự do
                  </label>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowGuideModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleSaveGuide}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToursPage;
