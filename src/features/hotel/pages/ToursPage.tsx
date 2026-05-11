import React, { useEffect, useState } from 'react';
import { Plus, X, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { HotelTourDto } from '../services/hotel.service';

const DIFFICULTY_LABELS: Record<string, string> = { EASY: 'Dá»…', MODERATE: 'Trung bĂ¬nh', HARD: 'KhĂ³' };
const TOUR_TYPES: Record<string, string> = { DAY_TRIP: 'Day Trip', LOOP: 'Loop Tour', TREKKING: 'Trekking', CAR_TOUR: 'Xe Ă´ tĂ´' };

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
    name: '', phone: '', email: '', languages: 'Tiáº¿ng Viá»‡t', speciality: '',
    isFreelance: false, dailyRate: 0, bio: '', isActive: true,
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, g, s] = await Promise.all([hotelService.getTours(), hotelService.getGuides(), hotelService.getTourSchedules()]);
      setTours(t); setGuides(g); setSchedules(s);
    } catch { toast.error('Lá»—i táº£i dá»¯ liá»‡u tour'); }
    finally { setLoading(false); }
  };

  const handleSaveTour = async () => {
    if (!tourForm.tourCode || !tourForm.tourName) { toast.error('Nháº­p mĂ£ vĂ  tĂªn tour'); return; }
    try {
      await hotelService.upsertTour(tourForm);
      toast.success(editTour ? 'Cáº­p nháº­t tour thĂ nh cĂ´ng' : 'ThĂªm tour thĂ nh cĂ´ng');
      setShowTourModal(false); fetchAll();
    } catch { toast.error('Lá»—i lÆ°u tour'); }
  };

  const handleSaveGuide = async () => {
    if (!guideForm.name) { toast.error('Nháº­p tĂªn hÆ°á»›ng dáº«n viĂªn'); return; }
    try {
      await hotelService.upsertGuide(guideForm);
      toast.success('LÆ°u thĂ nh cĂ´ng');
      setShowGuideModal(false); fetchAll();
    } catch { toast.error('Lá»—i lÆ°u HDV'); }
  };

  const handleDeleteTour = async (id: number) => {
    if (!window.confirm('XĂ³a tour nĂ y?')) return;
    try { await hotelService.deleteTour(id); toast.success('XĂ³a thĂ nh cĂ´ng'); fetchAll(); }
    catch { toast.error('Lá»—i xĂ³a tour'); }
  };

  const filteredTours = tours.filter(t => {
    if (typeFilter && t.tourType !== typeFilter) return false;
    if (search && !t.tourName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fmtMoney = (n: number) => n?.toLocaleString('vi-VN') + 'Ä‘';

  const openEdit = (t: HotelTourDto) => {
    setEditTour(t);
    setTourForm({ ...t, highlights: t.highlights || '', itinerary: t.itinerary || '', inclusions: '', exclusions: '', meetingPoint: t.meetingPoint || '' } as any);
    setShowTourModal(true);
  };

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <h1>đŸ¯ Quáº£n LĂ½ Tour</h1>
        <div className={styles.headerActions}>
          {tab === 'catalog' && <button className={styles.btnPrimary} onClick={() => { setEditTour(null); setTourForm({ tourCode: '', tourName: '', tourNameEN: '', tourType: 'DAY_TRIP', durationDays: 1, durationNights: 0, maxPerson: 10, minPerson: 1, pricePerPerson: 0, groupPrice: 0, groupDiscountFrom: 5, highlights: '', itinerary: '', inclusions: '', exclusions: '', meetingPoint: '', difficulty: 'EASY', isAvailable: true, sortOrder: 0 }); setShowTourModal(true); }}><Plus size={15} /> ThĂªm tour</button>}
          {tab === 'guides' && <button className={styles.btnPrimary} onClick={() => setShowGuideModal(true)}><Plus size={15} /> ThĂªm HDV</button>}
        </div>
      </div>

      <div className={styles.tabs}>
        {[['catalog', 'đŸ—ºï¸ Catalog Tour'], ['guides', 'đŸ‘¤ HÆ°á»›ng dáº«n viĂªn'], ['schedules', 'đŸ“… Lá»‹ch tour']].map(([k, l]) => (
          <button key={k} className={`${styles.tab} ${tab === k ? styles.active : ''}`} onClick={() => setTab(k as any)}>{l}</button>
        ))}
      </div>

      {/* Tour Catalog */}
      {tab === 'catalog' && (
        <>
          <div className={styles.searchBar}>
            <div className={styles.searchInput}><Search size={16} color="#94a3b8" /><input placeholder="TĂ¬m tour..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <select className={styles.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Táº¥t cáº£ loáº¡i</option>
              {Object.entries(TOUR_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Äang táº£i...</div> : (
            <div className={styles.tourGrid}>
              {filteredTours.map(t => (
                <div key={t.id} className={styles.tourCard}>
                  <div className={styles.tourImg}>đŸ”ï¸</div>
                  <div className={styles.tourBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div className={styles.tourName}>{t.tourName}</div>
                      <span className={`${styles.badge} ${styles[t.difficulty.toLowerCase()] || styles.easy}`} style={{ flexShrink: 0 }}>{DIFFICULTY_LABELS[t.difficulty]}</span>
                    </div>
                    <div className={styles.tourMeta}>
                      <span>â± {t.durationDays} ngĂ y {t.durationNights} Ä‘Ăªm</span>
                      <span>đŸ‘¥ {t.minPerson}â€“{t.maxPerson} ngÆ°á»i</span>
                      <span className={`${styles.badge} ${t.isAvailable ? styles.vacant : styles.oos}`}>{t.isAvailable ? 'Má»Ÿ' : 'ÄĂ³ng'}</span>
                    </div>
                    {t.highlights && <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 10px', lineHeight: 1.5 }}>{t.highlights.substring(0, 120)}{t.highlights.length > 120 ? '...' : ''}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div className={styles.tourPrice}>{fmtMoney(t.pricePerPerson)}<span className={styles.tourPriceSub}>/ngÆ°á»i</span></div>
                        {t.groupPrice > 0 && <div style={{ fontSize: 12, color: '#94a3b8' }}>ÄoĂ n: {fmtMoney(t.groupPrice)}</div>}
                      </div>
                    </div>
                    <div className={styles.tourActions}>
                      <button className={styles.btnPrimary} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} onClick={() => openEdit(t)}><Edit size={14} /> Sá»­a</button>
                      <button className={styles.btnDanger} style={{ padding: '7px 12px' }} onClick={() => handleDeleteTour(t.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTours.length === 0 && (
                <div className={styles.emptyState} style={{ gridColumn: '1/-1' }}>
                  <div className={styles.emptyIcon}>đŸ—ºï¸</div>
                  <p>ChÆ°a cĂ³ tour nĂ o. Nháº¥n "+ ThĂªm tour" Ä‘á»ƒ báº¯t Ä‘áº§u.</p>
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
              <tr><th>TĂªn</th><th>SÄT</th><th>NgĂ´n ngá»¯</th><th>ChuyĂªn mĂ´n</th><th>Loáº¡i</th><th>GiĂ¡/ngĂ y</th><th>Tráº¡ng thĂ¡i</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>Äang táº£i...</td></tr>
                : guides.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>ChÆ°a cĂ³ hÆ°á»›ng dáº«n viĂªn</td></tr>
                  : guides.map((g: any) => (
                    <tr key={g.id}>
                      <td><div style={{ fontWeight: 600 }}>{g.name}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{g.email}</div></td>
                      <td>{g.phone}</td>
                      <td>{g.languages}</td>
                      <td>{g.speciality}</td>
                      <td><span className={`${styles.badge} ${g.isFreelance ? styles.pending : styles.confirmed}`}>{g.isFreelance ? 'Tá»± do' : 'CÆ¡ há»¯u'}</span></td>
                      <td>{fmtMoney(g.dailyRate)}</td>
                      <td><span className={`${styles.badge} ${g.isActive ? styles.confirmed : styles.oos}`}>{g.isActive ? 'Hoáº¡t Ä‘á»™ng' : 'Nghá»‰'}</span></td>
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
              <tr><th>Tour</th><th>NgĂ y</th><th>HDV</th><th>Slots</th><th>CĂ²n trá»‘ng</th><th>GiĂ¡</th><th>Tráº¡ng thĂ¡i</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>Äang táº£i...</td></tr>
                : schedules.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>ChÆ°a cĂ³ lá»‹ch tour</td></tr>
                  : schedules.map((s: any) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.tourCode}</td>
                      <td>{new Date(s.tourDate).toLocaleDateString('vi-VN')}</td>
                      <td>{s.guideName || 'â€”'}</td>
                      <td style={{ textAlign: 'center' }}>{s.maxSlots}</td>
                      <td style={{ textAlign: 'center', color: s.availableSlots === 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{s.availableSlots}</td>
                      <td>{s.priceOverride ? fmtMoney(s.priceOverride) : 'â€”'}</td>
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
              <h2>{editTour ? 'âœï¸ Sá»­a tour' : 'â• ThĂªm tour má»›i'}</h2>
              <button className={styles.btnIcon} onClick={() => setShowTourModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>MĂ£ tour *</label><input value={tourForm.tourCode} onChange={e => setTourForm(f => ({ ...f, tourCode: e.target.value }))} placeholder="HG-LOOP-3D" /></div>
                <div className={styles.formGroup}><label>Loáº¡i</label>
                  <select value={tourForm.tourType} onChange={e => setTourForm(f => ({ ...f, tourType: e.target.value }))}>
                    {Object.entries(TOUR_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>TĂªn tour *</label><input value={tourForm.tourName} onChange={e => setTourForm(f => ({ ...f, tourName: e.target.value }))} placeholder="Ha Giang Loop 3 ngĂ y 2 Ä‘Ăªm" /></div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>TĂªn tiáº¿ng Anh</label><input value={tourForm.tourNameEN} onChange={e => setTourForm(f => ({ ...f, tourNameEN: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>Thá»i gian (ngĂ y)</label><input type="number" value={tourForm.durationDays} onChange={e => setTourForm(f => ({ ...f, durationDays: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Sá»‘ Ä‘Ăªm</label><input type="number" value={tourForm.durationNights} onChange={e => setTourForm(f => ({ ...f, durationNights: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Tá»‘i thiá»ƒu ngÆ°á»i</label><input type="number" value={tourForm.minPerson} onChange={e => setTourForm(f => ({ ...f, minPerson: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Tá»‘i Ä‘a ngÆ°á»i</label><input type="number" value={tourForm.maxPerson} onChange={e => setTourForm(f => ({ ...f, maxPerson: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>GiĂ¡/ngÆ°á»i (Ä‘)</label><input type="number" value={tourForm.pricePerPerson} onChange={e => setTourForm(f => ({ ...f, pricePerPerson: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>GiĂ¡ Ä‘oĂ n (Ä‘)</label><input type="number" value={tourForm.groupPrice} onChange={e => setTourForm(f => ({ ...f, groupPrice: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup}><label>Äá»™ khĂ³</label>
                  <select value={tourForm.difficulty} onChange={e => setTourForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}><label>Äiá»ƒm gáº·p</label><input value={tourForm.meetingPoint} onChange={e => setTourForm(f => ({ ...f, meetingPoint: e.target.value }))} placeholder="Lobby khĂ¡ch sáº¡n" /></div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>Äiá»ƒm ná»•i báº­t</label><textarea value={tourForm.highlights} onChange={e => setTourForm(f => ({ ...f, highlights: e.target.value }))} rows={3} /></div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>Lá»‹ch trĂ¬nh</label><textarea value={tourForm.itinerary} onChange={e => setTourForm(f => ({ ...f, itinerary: e.target.value }))} rows={4} placeholder="NgĂ y 1: ..." /></div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowTourModal(false)}>Há»§y</button>
              <button className={styles.btnPrimary} onClick={handleSaveTour}>đŸ’¾ LÆ°u tour</button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <div className={styles.overlay} onClick={() => setShowGuideModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h2>â• ThĂªm hÆ°á»›ng dáº«n viĂªn</h2><button className={styles.btnIcon} onClick={() => setShowGuideModal(false)}><X size={20} /></button></div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Há» tĂªn *</label><input value={guideForm.name} onChange={e => setGuideForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>SÄT</label><input value={guideForm.phone} onChange={e => setGuideForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>NgĂ´n ngá»¯</label><input value={guideForm.languages} onChange={e => setGuideForm(f => ({ ...f, languages: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>ChuyĂªn mĂ´n</label><input value={guideForm.speciality} onChange={e => setGuideForm(f => ({ ...f, speciality: e.target.value }))} /></div>
                <div className={styles.formGroup}><label>GiĂ¡/ngĂ y (Ä‘)</label><input type="number" value={guideForm.dailyRate} onChange={e => setGuideForm(f => ({ ...f, dailyRate: Number(e.target.value) }))} /></div>
                <div className={styles.formGroup} style={{ justifyContent: 'flex-end', paddingTop: 20 }}>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={guideForm.isFreelance} onChange={e => setGuideForm(f => ({ ...f, isFreelance: e.target.checked }))} />
                    HÆ°á»›ng dáº«n viĂªn tá»± do
                  </label>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowGuideModal(false)}>Há»§y</button>
              <button className={styles.btnPrimary} onClick={handleSaveGuide}>đŸ’¾ LÆ°u</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToursPage;

