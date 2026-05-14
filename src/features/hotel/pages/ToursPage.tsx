import React, { useEffect, useState } from 'react';
import { Plus, X, Search, Edit, Trash2, MapPin, Users, Clock, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { HotelTourDto } from '../services/hotel.service';

const DIFFICULTY_LABELS: Record<string, string> = { EASY: 'Dễ', MODERATE: 'Trung bình', HARD: 'Khó' };
const TOUR_TYPES: Record<string, string> = { DAY_TRIP: 'Day Trip', LOOP: 'Loop Tour', TREKKING: 'Trekking', CAR_TOUR: 'Xe ô tô' };

const EMPTY_TOUR: Partial<HotelTourDto> = {
  tourCode: '', tourName: '', tourNameEN: '', tourType: 'DAY_TRIP',
  durationDays: 1, durationNights: 0, maxPerson: 20, minPerson: 2,
  pricePerPerson: 0, groupPrice: 0, difficulty: 'EASY',
  highlights: '', meetingPoint: '', isAvailable: true,
};

export const ToursPage: React.FC = () => {
  const [tours, setTours] = useState<HotelTourDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<HotelTourDto> | null>(null);
  const [activeTab, setActiveTab] = useState<'tours' | 'guides' | 'schedules'>('tours');
  const [guides, setGuides] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => { fetchTours(); }, [typeFilter]);

  const fetchTours = async () => {
    setLoading(true);
    try { setTours(await hotelService.getTours(typeFilter || undefined)); }
    catch { toast.error('Lỗi tải danh sách tour'); }
    finally { setLoading(false); }
  };

  const fetchGuides = async () => {
    try { setGuides(await hotelService.getGuides()); }
    catch { toast.error('Lỗi tải hướng dẫn viên'); }
  };

  const fetchSchedules = async () => {
    try { setSchedules(await hotelService.getTourSchedules()); }
    catch { toast.error('Lỗi tải lịch tour'); }
  };

  const handleTabChange = (tab: 'tours' | 'guides' | 'schedules') => {
    setActiveTab(tab);
    if (tab === 'guides') fetchGuides();
    if (tab === 'schedules') fetchSchedules();
  };

  const handleSave = async () => {
    if (!editing?.tourName || !editing?.tourCode) return toast.error('Vui lòng nhập đầy đủ thông tin');
    try {
      await hotelService.upsertTour(editing);
      toast.success(editing.id ? 'Cập nhật tour thành công!' : 'Tạo tour mới thành công!');
      setShowModal(false); setEditing(null); fetchTours();
    } catch { toast.error('Lỗi lưu tour'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa tour này?')) return;
    try { await hotelService.deleteTour(id); toast.success('Đã xóa tour'); fetchTours(); }
    catch { toast.error('Lỗi xóa tour'); }
  };

  const filtered = tours.filter(t => !search || t.tourName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Quản Lý Tour</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            {tours.length} tour · {tours.filter(t => t.isAvailable).length} đang hoạt động
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={() => { setEditing({ ...EMPTY_TOUR }); setShowModal(true); }}>
            <Plus size={15} /> Thêm tour
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} style={{ marginBottom: 20 }}>
        {[
          { key: 'tours', label: `🗺️ Danh mục tour (${tours.length})` },
          { key: 'guides', label: `👤 Hướng dẫn viên (${guides.length})` },
          { key: 'schedules', label: `📅 Lịch khởi hành (${schedules.length})` },
        ].map(t => (
          <button key={t.key} className={`${styles.tab} ${activeTab === t.key ? styles.active : ''}`}
            onClick={() => handleTabChange(t.key as any)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'tours' && (
        <>
          <div className={styles.searchBar} style={{ marginBottom: 16 }}>
            <div className={styles.searchInput}>
              <Search size={16} color="#94a3b8" />
              <input placeholder="Tìm tên tour..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className={styles.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Tất cả loại</option>
              {Object.entries(TOUR_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {loading ? <div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Đang tải danh sách tour...</p></div> : (
            <div className={styles.tourModernGrid}>
              {filtered.length === 0 ? (
                <div className={styles.emptyState} style={{ gridColumn: '1/-1' }}>
                  <div className={styles.emptyIcon}>🗺️</div><p>Chưa có tour nào. Hãy thêm tour đầu tiên!</p>
                </div>
              ) : filtered.map(t => (
                <div key={t.id} className={styles.tourModernCard}>
                  {/* Tour Image / Header */}
                  <div className={styles.tourCardImage}>
                    <div className={styles.tourTypeBadge}>{TOUR_TYPES[t.tourType] || t.tourType}</div>
                    <span className={`${styles.statusBadge} ${t.isAvailable ? styles.statusActive : styles.statusStopped}`}>
                      {t.isAvailable ? '● Hoạt động' : '○ Dừng'}
                    </span>
                    <div className={styles.imagePlaceholder}>
                      <MapPin size={40} strokeWidth={1} />
                    </div>
                  </div>

                  {/* Tour Body */}
                  <div className={styles.tourCardBody}>
                    <div className={styles.tourMainInfo}>
                      <div className={styles.tourCode}>{t.tourCode}</div>
                      <h3 className={styles.tourNameTitle}>{t.tourName}</h3>
                      {t.tourNameEN && <div className={styles.tourNameEN}>{t.tourNameEN}</div>}
                    </div>

                    <div className={styles.tourHighlights}>
                       {t.highlights ? (t.highlights.length > 80 ? t.highlights.slice(0, 80) + '...' : t.highlights) : 'Chưa có mô tả nổi bật cho tour này.'}
                    </div>

                    <div className={styles.tourStatsRow}>
                      <div className={styles.statItem} title="Thời gian">
                        <Clock size={14} />
                        <span>{t.durationDays}N{t.durationNights > 0 ? `${t.durationNights}Đ` : ''}</span>
                      </div>
                      <div className={styles.statItem} title="Số lượng khách">
                        <Users size={14} />
                        <span>{t.minPerson}-{t.maxPerson} khách</span>
                      </div>
                      <div className={styles.statItem} title="Độ khó">
                        <BarChart3 size={14} />
                        <span className={`${styles.difficultyText} ${styles[t.difficulty?.toLowerCase()]}`}>
                          {DIFFICULTY_LABELS[t.difficulty] || t.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className={styles.tourPricingSection}>
                      <div className={styles.priceContainer}>
                        <div className={styles.priceMain}>
                          <span className={styles.currency}>₫</span>
                          <span className={styles.amount}>{(t.pricePerPerson || 0).toLocaleString('vi-VN')}</span>
                          <span className={styles.unit}>/khách</span>
                        </div>
                        <div className={styles.priceSecondary}>
                          Đoàn: <strong>{(t.groupPrice || 0).toLocaleString('vi-VN')}đ</strong>
                        </div>
                      </div>

                      <div className={styles.tourCardActions}>
                        <button className={styles.btnActionEdit} onClick={() => { setEditing({ ...t }); setShowModal(true); }} title="Chỉnh sửa">
                          <Edit size={16} />
                        </button>
                        <button className={styles.btnActionDelete} onClick={() => handleDelete(t.id)} title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'guides' && (
        <div className={styles.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>👤 Danh Sách Hướng Dẫn Viên</h3>
          {guides.length === 0 ? (
            <div className={styles.emptyState}><div className={styles.emptyIcon}>👤</div><p>Chưa có hướng dẫn viên</p></div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead><tr><th>Mã HDV</th><th>Họ tên</th><th>Chuyên môn</th><th>Ngôn ngữ</th><th>SĐT</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {guides.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontFamily: 'monospace' }}>{g.guideCode}</td>
                      <td><strong>{g.guideName}</strong></td>
                      <td>{g.specialty}</td>
                      <td>{g.languages}</td>
                      <td>{g.phone}</td>
                      <td><span className={`${styles.badge} ${g.isActive ? styles.confirmed : styles.cancelled}`}>{g.isActive ? 'Hoạt động' : 'Nghỉ'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className={styles.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📅 Lịch Khởi Hành</h3>
          {schedules.length === 0 ? (
            <div className={styles.emptyState}><div className={styles.emptyIcon}>📅</div><p>Chưa có lịch khởi hành nào</p></div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead><tr><th>Tour</th><th>Ngày khởi hành</th><th>HDV</th><th>Đã đặt/Tối đa</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {schedules.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.tourName || s.tourCode}</strong></td>
                      <td>{new Date(s.departureDate).toLocaleDateString('vi-VN')}</td>
                      <td>{s.guideName || '—'}</td>
                      <td style={{ textAlign: 'center' }}>{s.bookedCount}/{s.maxPerson}</td>
                      <td><span className={`${styles.badge} ${styles.confirmed}`}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal tạo/sửa tour */}
      {showModal && editing && (
        <div className={styles.modalBackdrop} onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className={`${styles.modal} ${styles.modalLg}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editing.id ? 'Chỉnh sửa tour' : 'Tạo tour mới'}</h3>
              <button className={styles.btnIcon} onClick={() => { setShowModal(false); setEditing(null); }}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {[
                  { label: 'Mã tour *', key: 'tourCode', type: 'text' },
                  { label: 'Tên tour *', key: 'tourName', type: 'text' },
                  { label: 'Tên tour (EN)', key: 'tourNameEN', type: 'text' },
                  { label: 'Điểm xuất phát', key: 'meetingPoint', type: 'text' },
                  { label: 'Số ngày', key: 'durationDays', type: 'number' },
                  { label: 'Số đêm', key: 'durationNights', type: 'number' },
                  { label: 'Tối thiểu người', key: 'minPerson', type: 'number' },
                  { label: 'Tối đa người', key: 'maxPerson', type: 'number' },
                  { label: 'Giá/người (đ)', key: 'pricePerPerson', type: 'number' },
                  { label: 'Giá đoàn (đ)', key: 'groupPrice', type: 'number' },
                ].map(f => (
                  <div className={styles.formGroup} key={f.key}>
                    <label>{f.label}</label>
                    <input type={f.type} value={(editing as any)[f.key] || ''}
                      onChange={e => setEditing(ed => ({ ...ed, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} />
                  </div>
                ))}
                <div className={styles.formGroup}>
                  <label>Loại tour</label>
                  <select value={editing.tourType} onChange={e => setEditing(ed => ({ ...ed, tourType: e.target.value }))}>
                    {Object.entries(TOUR_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Độ khó</label>
                  <select value={editing.difficulty} onChange={e => setEditing(ed => ({ ...ed, difficulty: e.target.value }))}>
                    {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}>
                  <label>Điểm nổi bật</label>
                  <textarea value={editing.highlights || ''} rows={3}
                    onChange={e => setEditing(ed => ({ ...ed, highlights: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => { setShowModal(false); setEditing(null); }}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleSave}>💾 Lưu tour</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToursPage;
