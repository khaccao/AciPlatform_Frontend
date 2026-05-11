import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, X, Wrench, Eye } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { RoomDetail } from '../services/hotel.service';

const STATUS_LABEL: Record<string, string> = {
  VACANT: 'Trống', OCCUPIED: 'Có khách', CHECKED_IN: 'Đang ở',
  DIRTY: 'Bẩn', OOS: 'Hỏng/Bảo trì',
};
const STATUS_CLASS: Record<string, string> = {
  VACANT: 'vacant', OCCUPIED: 'occupied', CHECKED_IN: 'occupied',
  DIRTY: 'dirty', OOS: 'oos',
};

export const RoomMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; room: RoomDetail } | null>(null);

  const floors = ['ALL', '1', '2', '3'];

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try { const data = await hotelService.getRooms(); setRooms(data); }
    catch { toast.error('Lỗi tải dữ liệu phòng'); }
    finally { setLoading(false); }
  };

  const getStatusClass = (r: RoomDetail) => STATUS_CLASS[r.status || 'VACANT'] || 'vacant';

  const handleUpdateStatus = async (room: RoomDetail, status: string, cleanDirty?: number) => {
    try {
      await hotelService.updateRoomStatus(room.so!, status, cleanDirty);
      toast.success(`Phòng ${room.so} → ${STATUS_LABEL[status] || status}`);
      setContextMenu(null); setSelectedRoom(null); fetchRooms();
    } catch { toast.error('Lỗi cập nhật trạng thái'); }
  };

  const handleRightClick = (e: React.MouseEvent, room: RoomDetail) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, room });
  };

  const displayRooms = activeFloor === 'ALL' ? rooms : rooms.filter(r => r.floor === activeFloor);
  const grouped = displayRooms.reduce((acc, r) => {
    const f = r.floor || '?';
    if (!acc[f]) acc[f] = [];
    acc[f].push(r);
    return acc;
  }, {} as Record<string, RoomDetail[]>);

  return (
    <div className={styles.hotelContainer} onClick={() => setContextMenu(null)}>
      <div className={styles.pageHeader}>
        <h1>🗺️ Sơ Đồ Phòng</h1>
        <div className={styles.headerActions}>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }} />
          <button className={styles.btnSecondary} onClick={fetchRooms}><RefreshCw size={15} /> Làm mới</button>
          <button className={styles.btnPrimary} onClick={() => navigate('/hotel/bookings/new')}><Plus size={15} /> Đặt phòng</button>
        </div>
      </div>

      {/* Chú thích */}
      <div className={styles.legend} style={{ marginBottom: 20 }}>
        {[
          { color: '#22c55e', label: '🟢 Trống' },
          { color: '#ef4444', label: '🔴 Có khách' },
          { color: '#f59e0b', label: '🟡 Bẩn' },
          { color: '#6b7280', label: '⚫ OOS' },
          { color: '#3b82f6', label: '🔵 Checkout hôm nay' },
        ].map(l => <div key={l.label} className={styles.legendItem}>{l.label}</div>)}
      </div>

      {/* Tabs tầng */}
      <div className={styles.tabs}>
        {floors.map(f => (
          <button key={f} className={`${styles.tab} ${activeFloor === f ? styles.active : ''}`}
            onClick={() => setActiveFloor(f)}>
            {f === 'ALL' ? '🏨 Tất cả' : `Tầng ${f}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Đang tải...</div>
      ) : (
        <div>
          {Object.entries(grouped).sort().map(([floor, floorRooms]) => {
            const privateRooms = floorRooms.filter(r => r.ma === 'KHEPKIN');
            const dormRooms = floorRooms.filter(r => r.ma !== 'KHEPKIN');
            return (
              <div key={floor} className={styles.floorSection}>
                <div className={styles.floorTitle}>
                  🏢 Tầng {floor}
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginLeft: 8 }}>
                    ({floorRooms.length} phòng · {floorRooms.filter(r => getStatusClass(r) === 'vacant').length} trống)
                  </span>
                </div>

                {privateRooms.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10, textTransform: 'uppercase' }}>🔒 Phòng Khép Kín</div>
                    <div className={styles.roomGrid} style={{ marginBottom: 20 }}>
                      {privateRooms.map(r => (
                        <div key={r.id}
                          className={`${styles.roomCard} ${styles[getStatusClass(r)]}`}
                          onClick={() => setSelectedRoom(r)}
                          onContextMenu={e => handleRightClick(e, r)}>
                          <div className={styles.roomCardNo}>{r.so}</div>
                          <div className={styles.roomCardType}>{r.roomTypeName || r.ma}</div>
                          <div className={styles.roomCardStatus} style={{
                            color: getStatusClass(r) === 'vacant' ? '#16a34a' : getStatusClass(r) === 'occupied' ? '#dc2626' : '#d97706'
                          }}>
                            {STATUS_LABEL[r.status || 'VACANT']}
                          </div>
                          {r.basePrice && <div style={{ fontSize: 11, color: '#94a3b8' }}>{(r.basePrice / 1000).toFixed(0)}k/đêm</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {dormRooms.map(r => (
                  <div key={r.id} className={styles.card} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Phòng {r.so}</span>
                        <span style={{ marginLeft: 10, fontSize: 13, color: '#64748b' }}>{r.roomTypeName || 'Tập Thể'} · {r.beds?.length || 0} giường</span>
                      </div>
                      <button className={styles.btnSecondary} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setSelectedRoom(r)}>
                        <Eye size={13} /> Chi tiết
                      </button>
                    </div>
                    <div className={styles.bedGrid}>
                      {r.beds?.length > 0 ? r.beds.map(bed => {
                        const bedClass = bed.status === 'OCCUPIED' ? 'occupied' : bed.status === 'DIRTY' ? 'dirty' : 'available';
                        return (
                          <div key={bed.bedCode} className={`${styles.bedCell} ${styles[bedClass]}`}>
                            <div className={styles.bedCode}>{bed.bedCode}</div>
                            <div className={styles.bedGuest}>
                              {bed.status === 'OCCUPIED' ? '🔴' : bed.status === 'DIRTY' ? '🟡' : '🟢'}
                            </div>
                          </div>
                        );
                      }) : <div style={{ color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>Chưa có dữ liệu giường</div>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {Object.keys(grouped).length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏨</div>
              <p>Chưa có dữ liệu phòng. Vui lòng kiểm tra kết nối.</p>
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 500, minWidth: 180, overflow: 'hidden' }}
          onClick={e => e.stopPropagation()}>
          <div style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            Phòng {contextMenu.room.so}
          </div>
          {[
            { icon: '✏️', label: 'Đặt phòng nhanh', action: () => navigate(`/hotel/bookings/new?room=${contextMenu.room.so}`) },
            { icon: '🧹', label: 'Đánh dấu Bẩn', action: () => handleUpdateStatus(contextMenu.room, 'DIRTY') },
            { icon: '✅', label: 'Đánh dấu Sạch', action: () => handleUpdateStatus(contextMenu.room, 'VACANT', 1) },
            { icon: '🔧', label: 'Bảo trì (OOS)', action: () => handleUpdateStatus(contextMenu.room, 'OOS') },
            { icon: '👁️', label: 'Xem chi tiết', action: () => { setSelectedRoom(contextMenu.room); setContextMenu(null); } },
          ].map((item, i) => (
            <div key={i}
              style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              onClick={() => { item.action(); setContextMenu(null); }}>
              {item.icon} {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Side Panel */}
      {selectedRoom && (
        <>
          <div className={styles.panelBackdrop} onClick={() => setSelectedRoom(null)} />
          <div className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <div>
                <div className={styles.sidePanelTitle}>Phòng {selectedRoom.so}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selectedRoom.roomTypeName}</div>
              </div>
              <button className={styles.btnIcon} onClick={() => setSelectedRoom(null)}><X size={20} /></button>
            </div>
            <div className={styles.sidePanelBody}>
              <div style={{ marginBottom: 20 }}>
                <span className={`${styles.badge} ${styles[getStatusClass(selectedRoom)]}`} style={{ fontSize: 14, padding: '6px 16px' }}>
                  {STATUS_LABEL[selectedRoom.status || 'VACANT']}
                </span>
              </div>
              {[
                ['Số phòng', selectedRoom.so],
                ['Loại phòng', selectedRoom.roomTypeName || selectedRoom.ma],
                ['Tầng', `Tầng ${selectedRoom.floor}`],
                ['Sức chứa', `${selectedRoom.maxPerson} người`],
                ['Giá cơ bản', selectedRoom.basePrice ? `${(selectedRoom.basePrice).toLocaleString('vi-VN')}đ/đêm` : '—'],
                ['Vệ sinh', selectedRoom.cleanDirty === 1 ? '✅ Sạch' : '🟡 Cần dọn'],
              ].map(([l, v]) => (
                <div key={l} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{l}</span>
                  <span className={styles.infoValue}>{v}</span>
                </div>
              ))}
              {selectedRoom.beds?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🛏️ Giường ({selectedRoom.beds.length})</div>
                  <div className={styles.bedGrid}>
                    {selectedRoom.beds.map(bed => (
                      <div key={bed.bedCode} className={`${styles.bedCell} ${styles[bed.status === 'OCCUPIED' ? 'occupied' : 'available']}`}>
                        <div className={styles.bedCode}>{bed.bedCode}</div>
                        <div className={styles.bedGuest}>{bed.bedType}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.sidePanelFooter}>
              <button className={styles.btnPrimary} onClick={() => navigate(`/hotel/bookings/new?room=${selectedRoom.so}`)}>Đặt phòng</button>
              <button className={styles.btnSecondary} onClick={() => handleUpdateStatus(selectedRoom, 'DIRTY')}>🧹 Bẩn</button>
              <button className={styles.btnSecondary} onClick={() => handleUpdateStatus(selectedRoom, 'VACANT', 1)}>✅ Sạch</button>
              <button className={styles.btnSecondary} onClick={() => handleUpdateStatus(selectedRoom, 'OOS')}><Wrench size={14} /> OOS</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomMapPage;
