import React, { useEffect, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService, { HotelGuest } from '../services/hotel.service';

export const GuestsPage: React.FC = () => {
  const [guests, setGuests] = useState<HotelGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<HotelGuest | null>(null);

  useEffect(() => { fetchGuests(); }, []);

  const fetchGuests = async (q?: string) => {
    setLoading(true);
    try { const data = await hotelService.getGuests(q); setGuests(data); }
    catch { toast.error('Lỗi tải danh sách khách'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e: React.KeyboardEvent) => { if (e.key === 'Enter') fetchGuests(search); };
  const fmtMoney = (n: number) => n?.toLocaleString('vi-VN') + 'đ';

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}><h1>👤 Hồ Sơ Khách Hàng</h1></div>

      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search size={16} color="#94a3b8" />
          <input placeholder="Tên, SĐT, CMND... (Enter để tìm)" value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} />
        </div>
        <button className={styles.btnPrimary} onClick={() => fetchGuests(search)}>Tìm kiếm</button>
      </div>

      <div className={styles.splitLayout}>
        <div className={styles.leftPane}>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Khách</th><th>Quốc tịch</th><th>Số lần ở</th>
                  <th>Tổng chi</th><th>Lần cuối</th><th>VIP</th><th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>Đang tải...</td></tr>
                  : guests.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không có khách nào</td></tr>
                    : guests.map(g => (
                      <tr key={g.id} onClick={() => setSelected(g)} style={{ cursor: 'pointer', background: selected?.id === g.id ? '#eff6ff' : undefined }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className={styles.guestAvatar}>{g.guestName.charAt(0).toUpperCase()}</div>
                            <div>
                              <div className={styles.guestName}>{g.guestName}</div>
                              <div className={styles.guestPhone}>{g.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td>{g.nationality || '🇻🇳 VN'}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{g.totalVisits}</td>
                        <td style={{ fontWeight: 600 }}>{fmtMoney(g.totalSpent)}</td>
                        <td style={{ fontSize: 13 }}>{g.lastVisit ? new Date(g.lastVisit).toLocaleDateString('vi-VN') : '—'}</td>
                        <td>{g.isVip && <span className={styles.vipBadge}>⭐ VIP</span>}</td>
                        <td><button className={styles.btnIcon} onClick={e => { e.stopPropagation(); setSelected(g); }}><Eye size={15} /></button></td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className={styles.rightPane}>
            <div className={styles.card} style={{ position: 'sticky', top: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={styles.guestAvatar} style={{ width: 56, height: 56, fontSize: 20 }}>{selected.guestName.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: '#0f172a' }}>{selected.guestName}</div>
                    {selected.isVip && <span className={styles.vipBadge}>⭐ VIP</span>}
                  </div>
                </div>
                <button className={styles.btnIcon} onClick={() => setSelected(null)}><X size={18} /></button>
              </div>

              {[
                ['📞 SĐT', selected.phone || '—'],
                ['📧 Email', selected.email || '—'],
                ['🪪 CMND', selected.idCard || '—'],
                ['🌍 Quốc tịch', selected.nationality || 'Việt Nam'],
              ].map(([l, v]) => (
                <div key={l} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{l}</span>
                  <span className={styles.infoValue}>{v}</span>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: '12px 14px', background: '#eff6ff', borderRadius: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['Số lần ở', selected.totalVisits.toString()],
                    ['Tổng chi', fmtMoney(selected.totalSpent)],
                    ['Phòng ưa thích', selected.preferredRoomType || '—'],
                    ['Xe ưa thích', selected.preferredVehicleType || '—'],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: '#fffbeb', borderRadius: 10, fontSize: 13, color: '#92400e' }}>
                  📝 {selected.notes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestsPage;
