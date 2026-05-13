import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { RoomDetail } from '../services/hotel.service';

const STATUS_LABEL: Record<string, string> = {
  VC: 'Trống - Sạch', VD: 'Trống - Bẩn',
  OC: 'Có khách - Sạch', OD: 'Có khách - Bẩn',
  EA: 'Sắp đến', ED: 'Sắp trả', 'ED/EA': 'Trả & Đến',
  OOS: 'Hỏng/Bảo trì',
  VACANT: 'Trống - Sạch', // Fallback
};
const STATUS_CLASS: Record<string, string> = {
  VC: 'vc', VD: 'vd', OC: 'oc', OD: 'od',
  EA: 'ea', ED: 'ed', 'ED/EA': 'edea',
  OOS: 'oos',
  VACANT: 'vc', // Fallback
};
const STATUS_COLOR: Record<string, string> = {
  VC: '#16a34a', VD: '#d97706', OC: '#dc2626', OD: '#991b1b',
  EA: '#2563eb', ED: '#7c3aed', 'ED/EA': '#6d28d9',
  OOS: '#64748b',
};

const normalizeStatus = (status: string | undefined): string => {
  if (!status) return 'VC';
  const s = status.toUpperCase();
  if (s === 'VACANT' || s === 'AVAILABLE' || s === 'SACH TRONG' || s === 'SACH' || s === 'CLEAN') return 'VC';
  if (s === 'DIRTY' || s === 'VACANT_DIRTY' || s === 'BAN TRONG' || s === 'BAN' || s === 'VACANTDIRTY') return 'VD';
  if (s === 'OCCUPIED' || s === 'SACH CO KHACH' || s === 'CO KHACH') return 'OC';
  if (s === 'BAN CO KHACH' || s === 'ODIRTY' || s === 'OCCUPIEDDIRTY') return 'OD';
  return s;
};

export const RoomMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; room: RoomDetail; bedCode?: string } | null>(null);

  const floors = ['ALL', ...Array.from(new Set(rooms.map(r => r.floor).filter(Boolean) as string[])).sort()];

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try { const data = await hotelService.getRooms(); setRooms(data); }
    catch { toast.error('Lỗi tải dữ liệu phòng'); }
    finally { setLoading(false); }
  };

  const getStatusClass = (r: RoomDetail) => STATUS_CLASS[normalizeStatus(r.status)] || 'vc';

  const handleUpdateStatus = async (room: RoomDetail, status: string, cleanDirty?: number, bedCode?: string) => {
    const currentStatus = bedCode ? (room.beds?.find(b => b.bedCode === bedCode)?.status) : room.status;
    const current = normalizeStatus(currentStatus);
    
    if ((current === 'OC' || current === 'OD') && (status === 'VC' || status === 'VD')) {
      toast.error('Đối tượng đang có khách, vui lòng thực hiện Check-out trước.');
      return;
    }
    
    try {
      if (bedCode) {
        await hotelService.updateBedStatus(room.so!, bedCode, status);
        toast.success(`Giường ${bedCode} (P.${room.so}) → ${STATUS_LABEL[status] || status}`);
      } else {
        await hotelService.updateRoomStatus(room.so!, status, cleanDirty);
        toast.success(`Phòng ${room.so} → ${STATUS_LABEL[status] || status}`);
      }
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
      <div className={styles.legend} style={{ marginBottom: 20, gap: 12 }}>
        {Object.entries(STATUS_LABEL).map(([code, label]) => (
          <div key={code} className={styles.legendItem} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: STATUS_COLOR[code] }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{code}: {label}</span>
          </div>
        ))}
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
                    ({floorRooms.length} phòng · {floorRooms.filter(r => normalizeStatus(r.status) === 'VC').length} trống)
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
                          <div className={styles.roomCardStatus} style={{ color: STATUS_COLOR[normalizeStatus(r.status)] }}>
                            {STATUS_LABEL[normalizeStatus(r.status)]}
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
                        const s = normalizeStatus(bed.status);
                        const bedClass = s.toLowerCase();
                        const isVC = s === 'VC';
                        return (
                          <div key={bed.bedCode} 
                            className={`${styles.bedCell} ${styles[bedClass]}`}
                            onClick={() => {
                              if (!isVC) {
                                toast.warning(`Giường ${bed.bedCode} đang ở trạng thái ${STATUS_LABEL[s] || s}, không thể đặt phòng.`);
                                return;
                              }
                              navigate(`/hotel/bookings/new?room=${r.so}&bed=${bed.bedCode}`);
                            }}
                            onContextMenu={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              setContextMenu({ x: e.clientX, y: e.clientY, room: r, bedCode: bed.bedCode });
                            }}
                            style={{ cursor: isVC ? 'pointer' : 'not-allowed', opacity: isVC ? 1 : 0.7 }}>
                            <div className={styles.bedCode}>{bed.bedCode}</div>
                            <div className={styles.bedGuest}>
                              {STATUS_LABEL[s] || s}
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
            {contextMenu.bedCode ? `Giường ${contextMenu.bedCode} (P.${contextMenu.room.so})` : `Phòng ${contextMenu.room.so}`}
          </div>
          {[
            { icon: '✏️', label: 'Đặt phòng nhanh', action: () => {
              const status = contextMenu.bedCode 
                ? contextMenu.room.beds?.find(b => b.bedCode === contextMenu.bedCode)?.status 
                : contextMenu.room.status;
              const s = normalizeStatus(status);
              const isVC = s === 'VC';
              if (!isVC) {
                toast.warning(`Đối tượng đang ở trạng thái ${STATUS_LABEL[s] || s}, không thể đặt phòng.`);
                return;
              }
              const qs = contextMenu.bedCode ? `?room=${contextMenu.room.so}&bed=${contextMenu.bedCode}` : `?room=${contextMenu.room.so}`;
              navigate(`/hotel/bookings/new${qs}`);
            } },
            { icon: '🧽', label: 'VC (Trống Sạch)', action: () => handleUpdateStatus(contextMenu.room, 'VC', undefined, contextMenu.bedCode) },
            { icon: '🧹', label: 'VD (Trống Bẩn)', action: () => handleUpdateStatus(contextMenu.room, 'VD', undefined, contextMenu.bedCode) },
            { icon: '🔴', label: 'OC (Khách Sạch)', action: () => handleUpdateStatus(contextMenu.room, 'OC', undefined, contextMenu.bedCode) },
            { icon: '🆘', label: 'OD (Khách Bẩn)', action: () => handleUpdateStatus(contextMenu.room, 'OD', undefined, contextMenu.bedCode) },
            { icon: '🔜', label: 'EA (Sắp đến)', action: () => handleUpdateStatus(contextMenu.room, 'EA', undefined, contextMenu.bedCode) },
            { icon: '🔚', label: 'ED (Sắp trả)', action: () => handleUpdateStatus(contextMenu.room, 'ED', undefined, contextMenu.bedCode) },
            { icon: '🔄', label: 'ED/EA', action: () => handleUpdateStatus(contextMenu.room, 'ED/EA', undefined, contextMenu.bedCode) },
            { icon: '🔧', label: 'OOS (Bảo trì)', action: () => handleUpdateStatus(contextMenu.room, 'OOS', undefined, contextMenu.bedCode) },
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
                  {STATUS_LABEL[normalizeStatus(selectedRoom.status)]}
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
                    {selectedRoom.beds.map(bed => {
                      const s = normalizeStatus(bed.status);
                      const isVC = s === 'VC';
                      return (
                        <div key={bed.bedCode} 
                          className={`${styles.bedCell} ${styles[s.toLowerCase()] || styles.available}`}
                          onClick={() => {
                            if (!isVC) {
                              toast.warning(`Giường ${bed.bedCode} không ở trạng thái trống sạch.`);
                              return;
                            }
                            navigate(`/hotel/bookings/new?room=${selectedRoom.so}&bed=${bed.bedCode}`);
                          }}
                          style={{ cursor: isVC ? 'pointer' : 'not-allowed', opacity: isVC ? 1 : 0.7 }}>
                          <div className={styles.bedCode}>{bed.bedCode}</div>
                          <div className={styles.bedGuest}>{bed.bedType} · {STATUS_LABEL[s] || s}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
             <div className={styles.sidePanelFooter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
               <button 
                className={styles.btnPrimary} 
                style={{ gridColumn: '1 / -1', opacity: normalizeStatus(selectedRoom.status) === 'VC' ? 1 : 0.6 }} 
                onClick={() => {
                  const s = normalizeStatus(selectedRoom.status);
                  if (s !== 'VC') {
                    toast.warning(`Phòng ${selectedRoom.so} hiện đang là ${STATUS_LABEL[s] || s}, không thể đặt mới.`);
                    return;
                  }
                  navigate(`/hotel/bookings/new?room=${selectedRoom.so}`);
                }}
              >
                Đặt phòng
              </button>
              <button className={styles.btnSecondary} onClick={() => handleUpdateStatus(selectedRoom, 'VC')}>VC</button>
              <button className={styles.btnSecondary} onClick={() => handleUpdateStatus(selectedRoom, 'VD')}>VD</button>
              <button className={styles.btnSecondary} onClick={() => handleUpdateStatus(selectedRoom, 'OC')}>OC</button>
              <button className={styles.btnSecondary} onClick={() => handleUpdateStatus(selectedRoom, 'OD')}>OD</button>
              <button className={styles.btnSecondary} onClick={() => handleUpdateStatus(selectedRoom, 'EA')}>EA</button>
              <button className={styles.btnSecondary} onClick={() => handleUpdateStatus(selectedRoom, 'ED')}>ED</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomMapPage;
