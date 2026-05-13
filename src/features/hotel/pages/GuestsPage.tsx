import React, { useEffect, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { HotelGuest } from '../services/hotel.service';

export const GuestsPage: React.FC = () => {
  const [guests, setGuests] = useState<HotelGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<HotelGuest | null>(null);

  useEffect(() => { fetchGuests(); }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try { setGuests(await hotelService.getGuests()); }
    catch { toast.error('Lỗi tải danh sách khách'); }
    finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!search.trim()) return fetchGuests();
    setLoading(true);
    try { setGuests(await hotelService.getGuests(search)); }
    catch { toast.error('Lỗi tìm kiếm'); }
    finally { setLoading(false); }
  };

  const filtered = guests.filter(g =>
    !search ||
    g.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    g.phone?.includes(search) ||
    g.idCard?.includes(search) ||
    g.nationality?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>👥 Hồ Sơ Khách</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            {guests.length} khách · {guests.filter(g => g.isVip).length} VIP
          </p>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className={styles.searchBar} style={{ marginBottom: 20 }}>
        <div className={styles.searchInput} style={{ flex: 1 }}>
          <Search size={16} color="#94a3b8" />
          <input
            placeholder="Tìm tên, SĐT, CCCD, quốc tịch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className={styles.btnPrimary} onClick={handleSearch}>Tìm kiếm</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* Bảng khách */}
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Họ tên</th><th>SĐT</th><th>CCCD/Hộ chiếu</th>
                <th>Quốc tịch</th><th>Lượt ở</th><th>Tổng chi tiêu</th>
                <th>Lần cuối</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không tìm thấy khách</td></tr>
              ) : filtered.map(g => (
                <tr key={g.id} style={{ background: selected?.id === g.id ? '#eff6ff' : undefined }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: g.isVip ? '#fbbf24' : '#e2e8f0', fontSize: 14, fontWeight: 700, color: g.isVip ? '#92400e' : '#64748b', flexShrink: 0,
                      }}>
                        {g.fullName?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {g.fullName}
                          {g.isVip && <span style={{ marginLeft: 6, fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>VIP</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{g.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{g.phone || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.idCard || '—'}</td>
                  <td>{g.nationality === 'VN' ? '🇻🇳 Việt Nam' : g.nationality || '—'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{g.totalVisits}</td>
                  <td style={{ fontWeight: 600, color: '#1e6fff' }}>{(g.totalSpend || 0).toLocaleString('vi-VN')}đ</td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>
                    {g.lastVisitDate ? new Date(g.lastVisitDate).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td>
                    <button className={styles.btnIcon} title="Xem hồ sơ" onClick={() => setSelected(g === selected ? null : g)}>
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side panel hồ sơ khách */}
        {selected && (
          <div className={styles.card} style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Hồ Sơ Khách</h3>
              <button className={styles.btnIcon} onClick={() => setSelected(null)}><X size={18} /></button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: selected.isVip ? '#fbbf24' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800,
                color: selected.isVip ? '#92400e' : '#64748b', margin: '0 auto 10px', overflow: 'hidden'
              }}>
                {selected.avatar ? <img src={selected.avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : selected.fullName?.[0] || '?'}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{selected.fullName}</div>
              {selected.isVip && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 12, fontWeight: 700 }}>⭐ VIP</span>}
            </div>

            {[
              ['📱 SĐT', selected.phone],
              ['📧 Email', selected.email],
              ['🪪 CCCD/HC', selected.idCard],
              ['🌏 Quốc tịch', selected.nationality === 'VN' ? '🇻🇳 Việt Nam' : selected.nationality],
              ['🛏️ Lượt ở', String(selected.totalVisits)],
              ['💰 Tổng chi', `${(selected.totalSpend || 0).toLocaleString('vi-VN')}đ`],
              ['📅 Lần cuối', selected.lastVisitDate ? new Date(selected.lastVisitDate).toLocaleDateString('vi-VN') : '—'],
              ['🛏️ Phòng ưa thích', selected.preferRoomType],
              ['🏍️ Xe ưa thích', selected.preferVehicle],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} className={styles.infoRow}>
                <span className={styles.infoLabel}>{l}</span>
                <span className={styles.infoValue}>{v}</span>
              </div>
            ))}

            {selected.notes && (
              <div style={{ marginTop: 14, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                📝 {selected.notes}
              </div>
            )}
            
            {selected.identityDocumentImage && (
              <div style={{ marginTop: 14 }}>
                <a href={selected.identityDocumentImage} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={14} /> Xem hình ảnh giấy tờ tùy thân
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestsPage;
