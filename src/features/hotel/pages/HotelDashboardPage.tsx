import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { Hotel, LogIn, LogOut, TrendingUp, AlertCircle, Plus, RefreshCw, Clock, Network, Layers } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { BookingDto, VehicleRentalDto } from '../services/hotel.types';

export const HotelDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const menus = user?.menus || [];
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
      if (dash.status === 'fulfilled') {
        setDashboard(dash.value);
        // Fallback revenue from dashboard if partial call fails or to ensure consistency
        if (!todayRevenue) setTodayRevenue({ totalRevenue: dash.value.todayRevenue });
      }
      if (revenue.status === 'fulfilled') setTodayRevenue(revenue.value);
      if (map.status === 'fulfilled') setRoomMap(map.value?.floors || []);
      if (bkData.status === 'fulfilled') {
        const items = bkData.value.items || [];
        // Show today's actions
        const todayStr = new Date().toDateString();
        setCheckouts(items.filter((b: BookingDto) => new Date(b.checkOut).toDateString() === todayStr && b.status === 'CHECKED_IN'));
        setCheckins(items.filter((b: BookingDto) => new Date(b.checkIn).toDateString() === todayStr && b.status === 'CONFIRMED'));
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
    { label: 'Phòng đang ở', value: dashboard?.inHouse ?? dashboard?.InHouse ?? '—', icon: Hotel, color: 'blue', sub: 'khách đang ở' },
    { label: 'Check-in hôm nay', value: dashboard?.checkInsToday ?? dashboard?.CheckInsToday ?? '—', icon: LogIn, color: 'green', sub: 'lượt đến' },
    { label: 'Check-out hôm nay', value: dashboard?.checkOutsToday ?? dashboard?.CheckOutsToday ?? '—', icon: LogOut, color: 'orange', sub: 'lượt đi' },
    { label: 'Doanh thu hôm nay', value: todayRevenue ? fmtMoney(todayRevenue.totalRevenue || todayRevenue.TodayRevenue || 0) : '—', icon: TrendingUp, color: 'purple', sub: 'tổng thu' },
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
        <div className={styles.titleSection}>
          <h1>Dashboard Khách Sạn</h1>
          <p className={styles.subtitle}>
            <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Cập nhật lúc {lastRefresh.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={() => navigate('/hotel/room-map-mgmt')} title="Quản lý sơ đồ"><Network size={15} /> <span>Sơ đồ</span></button>
          <button className={styles.btnSecondary} onClick={() => navigate('/hotel/room-rack')} title="Room Rack"><Layers size={15} /> <span>Rack</span></button>
          <button className={styles.btnSecondary} onClick={fetchAll} title="Làm mới"><RefreshCw size={15} /> <span>Làm mới</span></button>
          <button className={styles.btnPrimary} onClick={() => navigate('/hotel/bookings/new')}><Plus size={15} /> <span>Đặt phòng</span></button>
        </div>
      </div>

      {/* KPI */}
      <div className={styles.kpiGrid}>
        {kpis.map((k, i) => (
          <div className={styles.kpiCard} key={i}>
            <div className={`${styles.kpiIcon} ${styles[k.color]}`}><k.icon size={20} /></div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{loading ? '...' : k.value}</div>
              <div className={styles.kpiSub}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className={styles.dashboardGrid}>

        {/* CỘT TRÁI & GIỮA — Hoạt động chính */}
        <div className={styles.mainColumn}>
          <div className={styles.actionsGrid}>
            {/* Check-out */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <LogOut size={16} className={styles.iconOut} />
                  Check-out hôm nay ({checkouts.length})
                </h3>
              </div>
              <div className={styles.cardBody}>
                {checkouts.length === 0 ? (
                  <div className={styles.emptyState}><div className={styles.emptyIcon}>✅</div><p>Không có ai check-out</p></div>
                ) : checkouts.map(b => (
                  <div key={b.id} className={styles.checkoutItem}>
                    <div className={styles.checkoutRoom}>{b.rooms?.[0]?.roomNo || '?'}</div>
                    <div className={styles.checkoutInfo}>
                      <div className={styles.checkoutName}>{b.guestName}</div>
                      <div className={styles.checkoutTime}>
                        {fmtTime(b.checkOut)} ·{' '}
                        {b.paidAmount < b.totalAmount
                          ? <span className={styles.debtText}>⚠️ Còn nợ {fmtMoney(b.totalAmount - b.paidAmount)}</span>
                          : <span className={styles.paidText}>✅ Đã xong</span>}
                      </div>
                    </div>
                    <div className={styles.checkoutActions}>
                      <button className={styles.btnActionOut} onClick={() => handleCheckOut(b.id)}>Out</button>
                      <button className={styles.btnActionView} onClick={() => navigate(`/hotel/bookings/${b.id}`)}>Xem</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Check-in */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <LogIn size={16} className={styles.iconIn} />
                  Check-in hôm nay ({checkins.length})
                </h3>
              </div>
              <div className={styles.cardBody}>
                {checkins.length === 0 ? (
                  <div className={styles.emptyState}><div className={styles.emptyIcon}>🛎️</div><p>Chưa có booking mới</p></div>
                ) : checkins.map(b => (
                  <div key={b.id} className={styles.checkoutItem}>
                    <div className={`${styles.checkoutRoom} ${styles.roomIn}`}>{b.rooms?.[0]?.roomNo || '?'}</div>
                    <div className={styles.checkoutInfo}>
                      <div className={styles.checkoutName}>{b.guestName}</div>
                      <div className={styles.checkoutTime}>{fmtTime(b.checkIn)} · {b.source || 'Direct'}</div>
                    </div>
                    <div className={styles.checkoutActions}>
                      <button className={styles.btnActionIn} onClick={() => handleCheckIn(b.id)}>In</button>
                      <button className={styles.btnActionView} onClick={() => navigate(`/hotel/bookings/${b.id}`)}>Xem</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sơ đồ phòng Mini */}
          <div className={`${styles.card} ${styles.mt16}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Sơ Đồ Phòng</h3>
              <button className={styles.btnLink} onClick={() => navigate('/hotel/room-map')}>Xem đầy đủ</button>
            </div>
            <div className={styles.cardBody}>
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
              <div className={styles.miniMapScroll}>
                {roomMap.length > 0 ? roomMap.map((floor: any) => (
                  <div key={floor.floorCode} className={styles.floorGroup}>
                    <div className={styles.floorLabel}>{floor.floorName}</div>
                    <div className={styles.miniRoomGrid}>
                      {floor.rooms?.map((r: any) => (
                        <div key={r.roomNo}
                          className={`${styles.miniRoomCell} ${styles[getRoomStatusClass(r)]}`}
                          onClick={() => navigate('/hotel/room-map')}
                        >{r.roomNo}</div>
                      ))}
                    </div>
                  </div>
                )) : (
                  <p className={styles.loadingText}>Đang tải sơ đồ...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI — Cảnh báo & Thao tác nhanh */}
        <div className={styles.sideColumn}>
          {overdueRentals.length > 0 && (
            <div className={`${styles.card} ${styles.alertCard}`}>
              <h3 className={styles.alertTitle}>
                <AlertCircle size={16} /> Xe quá hạn ({overdueRentals.length})
              </h3>
              <div className={styles.alertList}>
                {overdueRentals.map(r => (
                  <div key={r.id} className={styles.alertItem}>
                    <div className={styles.alertMain}>{r.vehicleCode} — {r.guestName}</div>
                    <div className={styles.alertSub}>Hết hạn: {new Date(r.rentTo).toLocaleDateString('vi-VN')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.card}>
            <h3 className={styles.cardTitleSm}>⚡ Thao Tác Nhanh</h3>
            <div className={styles.quickActions}>
              {menus.filter(m => (m.codeParent || m.CodeParent) === 'hotel' && (m.menuCode || m.Code) !== 'hotel/dashboard').map(m => {
                const mCode = m.menuCode || m.Code;
                const mName = m.name || m.Name;
                const mUrl = m.url || m.Url || `/${mCode}`;
                return (
                  <button key={mCode} onClick={() => navigate(mUrl)} className={styles.quickActionBtn}>
                    <span className={styles.quickActionIcon}>⚡</span>
                    <span className={styles.quickActionLabel}>{mName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {todayRevenue && (
            <div className={styles.card}>
              <h3 className={styles.cardTitleSm}>💰 Doanh Thu</h3>
              <div className={styles.revenueList}>
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
                <div className={`${styles.infoRow} ${styles.totalRow}`}>
                  <span className={styles.totalLabel}>Tổng cộng</span>
                  <span className={styles.totalValue}>{fmtMoney(todayRevenue.totalRevenue || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDashboardPage;
