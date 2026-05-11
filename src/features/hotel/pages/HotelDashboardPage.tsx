import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, LogIn, LogOut, TrendingUp, AlertCircle, Plus, RefreshCw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { BookingDto, VehicleRentalDto } from '../services/hotel.service';

export const HotelDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [checkouts, setCheckouts] = useState<BookingDto[]>([]);
  const [checkins, setCheckins] = useState<BookingDto[]>([]);
  const [overdueRentals, setOverdueRentals] = useState<VehicleRentalDto[]>([]);
  const [todayRevenue, setTodayRevenue] = useState<any>(null);
  const [roomMap, setRoomMap] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, bkData, rentals, revenue, map] = await Promise.allSettled([
        hotelService.getDashboard(),
        hotelService.getBookings({ status: 'CONFIRMED,CHECKED_IN', pageSize: 50 }),
        hotelService.getActiveRentals(),
        hotelService.getRevenueToday(),
        hotelService.getRoomMap(),
      ]);
      if (dash.status === 'fulfilled') setDashboard(dash.value);
      if (revenue.status === 'fulfilled') setTodayRevenue(revenue.value);
      if (map.status === 'fulfilled') setRoomMap(map.value?.floors || []);
      if (bkData.status === 'fulfilled') {
        const items = bkData.value.items || [];
        setCheckouts(items.filter((b: BookingDto) => new Date(b.checkOut).toDateString() === new Date().toDateString() && b.status === 'CHECKED_IN'));
        setCheckins(items.filter((b: BookingDto) => new Date(b.checkIn).toDateString() === new Date().toDateString() && b.status === 'CONFIRMED'));
      }
      if (rentals.status === 'fulfilled') {
        const now = new Date();
        setOverdueRentals(rentals.value.filter((r: VehicleRentalDto) => new Date(r.rentTo) < now && r.status === 'ACTIVE'));
      }
      setLastRefresh(new Date());
    } catch { toast.error('Lỗi tải dữ liệu dashboard'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 120000);
    return () => clearInterval(t);
  }, [fetchAll]);

  const handleCheckIn = async (id: number) => {
    try { await hotelService.updateBookingStatus(id, 'CHECKED_IN'); toast.success('Check-in thành công!'); fetchAll(); }
    catch { toast.error('Lỗi check-in'); }
  };
  const handleCheckOut = async (id: number) => {
    try { await hotelService.updateBookingStatus(id, 'CHECKED_OUT'); toast.success('Check-out thành công!'); fetchAll(); }
    catch { toast.error('Lỗi check-out'); }
  };

  const fmtMoney = (n: number) => (n || 0).toLocaleString('vi-VN') + 'đ';
  const fmtTime = (dt: string) => new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const kpis = [
    { label: 'Phòng đang ở', value: dashboard?.inHouse ?? '—', icon: Hotel, color: 'blue', sub: 'khách đang ở' },
    { label: 'Check-in hôm nay', value: dashboard?.checkInsToday ?? '—', icon: LogIn, color: 'green', sub: 'lượt đến' },
    { label: 'Check-out hôm nay', value: dashboard?.checkOutsToday ?? '—', icon: LogOut, color: 'orange', sub: 'lượt đi' },
    { label: 'Doanh thu hôm nay', value: todayRevenue ? fmtMoney(todayRevenue.totalRevenue || 0) : '—', icon: TrendingUp, color: 'purple', sub: 'tổng thu' },
  ];

  const getRoomStatusClass = (r: any) => {
    if (!r) return 'oos';
    if (r.status === 'OCCUPIED' || r.status === 'CHECKED_IN') return 'occupied';
    if (r.status === 'DIRTY') return 'dirty';
    if (r.status === 'OOS') return 'oos';
    return 'vacant';
  };

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>🏨 Dashboard Khách Sạn</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Cập nhật lúc {lastRefresh.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={fetchAll}><RefreshCw size={15} /> Làm mới</button>
          <button className={styles.btnPrimary} onClick={() => navigate('/hotel/bookings/new')}><Plus size={15} /> Đặt phòng mới</button>
        </div>
      </div>

      {/* KPI */}
      <div className={styles.kpiGrid}>
        {kpis.map((k, i) => (
          <div className={styles.kpiCard} key={i}>
            <div className={`${styles.kpiIcon} ${styles[k.color]}`}><k.icon size={20} /></div>
            <div className={styles.kpiLabel}>{k.label}</div>
            <div className={styles.kpiValue}>{loading ? '...' : k.value}</div>
            <div className={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 3 cột */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 20 }}>

        {/* CỘT TRÁI — Hành động hôm nay */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Check-out */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                <LogOut size={16} style={{ verticalAlign: 'middle', marginRight: 6, color: '#ef4444' }} />
                Check-out hôm nay ({checkouts.length})
              </h3>
            </div>
            {checkouts.length === 0 ? (
              <div className={styles.emptyState}><div className={styles.emptyIcon}>✅</div><p>Không có ai check-out hôm nay</p></div>
            ) : checkouts.map(b => (
              <div key={b.id} className={styles.checkoutItem}>
                <div className={styles.checkoutRoom}>{b.rooms?.[0]?.roomNo || '?'}</div>
                <div className={styles.checkoutInfo}>
                  <div className={styles.checkoutName}>{b.guestName}</div>
                  <div className={styles.checkoutTime}>
                    {fmtTime(b.checkOut)} ·{' '}
                    {b.paidAmount < b.totalAmount
                      ? <span style={{ color: '#ef4444' }}>⚠️ Còn nợ {fmtMoney(b.totalAmount - b.paidAmount)}</span>
                      : <span style={{ color: '#16a34a' }}>✅ Đã thanh toán</span>}
                  </div>
                </div>
                <div className={styles.checkoutActions}>
                  <button className={styles.btnDanger} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleCheckOut(b.id)}>Check-out</button>
                  <button className={styles.btnSecondary} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => navigate(`/hotel/bookings/${b.id}`)}>Xem</button>
                </div>
              </div>
            ))}
          </div>

          {/* Check-in */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                <LogIn size={16} style={{ verticalAlign: 'middle', marginRight: 6, color: '#22c55e' }} />
                Check-in hôm nay ({checkins.length})
              </h3>
            </div>
            {checkins.length === 0 ? (
              <div className={styles.emptyState}><div className={styles.emptyIcon}>🛎️</div><p>Chưa có booking check-in hôm nay</p></div>
            ) : checkins.map(b => (
              <div key={b.id} className={styles.checkoutItem}>
                <div className={styles.checkoutRoom} style={{ background: '#f0fdf4', color: '#16a34a' }}>{b.rooms?.[0]?.roomNo || '?'}</div>
                <div className={styles.checkoutInfo}>
                  <div className={styles.checkoutName}>{b.guestName}</div>
                  <div className={styles.checkoutTime}>{fmtTime(b.checkIn)} · {b.source || 'Direct'}</div>
                </div>
                <div className={styles.checkoutActions}>
                  <button className={styles.btnSuccess} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleCheckIn(b.id)}>Check-in</button>
                  <button className={styles.btnSecondary} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => navigate(`/hotel/bookings/${b.id}`)}>Xem</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT GIỮA — Mini sơ đồ phòng */}
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Sơ Đồ Phòng</h3>
            <button className={styles.btnSecondary} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => navigate('/hotel/room-map')}>Xem đầy đủ</button>
          </div>
          <div className={styles.legend}>
            {[
              { color: '#22c55e', label: 'Trống' },
              { color: '#ef4444', label: 'Có khách' },
              { color: '#f59e0b', label: 'Bẩn' },
              { color: '#6b7280', label: 'OOS' },
              { color: '#3b82f6', label: 'Checkout' },
            ].map(l => (
              <div className={styles.legendItem} key={l.label}>
                <div className={styles.legendDot} style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
          {roomMap.length > 0 ? roomMap.map((floor: any) => (
            <div key={floor.floorCode} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>{floor.floorName}</div>
              <div className={styles.miniRoomGrid}>
                {floor.rooms?.map((r: any) => (
                  <div key={r.roomNo}
                    className={`${styles.miniRoomCell} ${styles[getRoomStatusClass(r)]}`}
                    title={`${r.roomNo} - ${r.status}`}
                    onClick={() => navigate('/hotel/room-map')}
                  >{r.roomNo}</div>
                ))}
              </div>
            </div>
          )) : (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Tầng 1</div>
              <div className={styles.miniRoomGrid}>
                {['101', '102', '103', '104', '105'].map(n => (
                  <div key={n} className={`${styles.miniRoomCell} ${styles.vacant}`}>{n}</div>
                ))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', margin: '12px 0 8px' }}>Tầng 2-3</div>
              <div className={styles.miniRoomGrid}>
                {['201', '301', '302', '303', '304', '305'].map(n => (
                  <div key={n} className={`${styles.miniRoomCell} ${styles.vacant}`}>{n}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI — Cảnh báo & Thao tác nhanh */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {overdueRentals.length > 0 && (
            <div className={styles.card} style={{ borderLeft: '4px solid #ef4444' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={16} /> Xe quá hạn ({overdueRentals.length})
              </h3>
              {overdueRentals.map(r => (
                <div key={r.id} style={{ padding: 8, background: '#fef2f2', borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.vehicleCode} — {r.guestName}</div>
                  <div style={{ fontSize: 12, color: '#dc2626' }}>Quá hạn: {new Date(r.rentTo).toLocaleDateString('vi-VN')}</div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>⚡ Thao Tác Nhanh</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '+ Đặt phòng mới', icon: '🛏️', path: '/hotel/bookings/new', bg: '#eff6ff' },
                { label: '+ Cho thuê xe', icon: '🏍️', path: '/hotel/vehicles', bg: '#f0fdf4' },
                { label: '+ Walk-in', icon: '🚶', path: '/hotel/bookings/new?type=WALKIN', bg: '#faf5ff' },
                { label: 'Sơ đồ phòng', icon: '🗺️', path: '/hotel/room-map', bg: '#fff7ed' },
                { label: 'Báo cáo hôm nay', icon: '📊', path: '/hotel/reports', bg: '#f0fdf4' },
              ].map(a => (
                <button key={a.path} onClick={() => navigate(a.path)}
                  style={{ padding: '10px 14px', background: a.bg, border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#1e293b', textAlign: 'left', transition: 'transform 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'translateX(3px)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'translateX(0)')}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>

          {todayRevenue && (
            <div className={styles.card}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>💰 Doanh Thu Hôm Nay</h3>
              {[
                ['Phòng', todayRevenue.roomRevenue],
                ['Xe máy', todayRevenue.vehicleRevenue],
                ['Dịch vụ', todayRevenue.serviceRevenue],
              ].map(([l, v]) => (
                <div key={l as string} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{l as string}</span>
                  <span className={styles.infoValue}>{fmtMoney(v as number || 0)}</span>
                </div>
              ))}
              <div className={styles.infoRow} style={{ borderTop: '2px solid #e2e8f0', paddingTop: 10, marginTop: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Tổng cộng</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#1e6fff' }}>{fmtMoney(todayRevenue.totalRevenue || 0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDashboardPage;
