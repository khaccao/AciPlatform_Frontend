import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, LogIn, LogOut, Bike, TrendingUp, AlertCircle, Plus, RefreshCw, Clock } from 'lucide-react';
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
      const today = new Date().toISOString().split('T')[0];
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
        setCheckouts(items.filter((b: BookingDto) => {
          const d = new Date(b.checkOut).toDateString();
          return d === new Date().toDateString() && b.status === 'CHECKED_IN';
        }));
        setCheckins(items.filter((b: BookingDto) => {
          const d = new Date(b.checkIn).toDateString();
          return d === new Date().toDateString() && b.status === 'CONFIRMED';
        }));
      }

      if (rentals.status === 'fulfilled') {
        const now = new Date();
        setOverdueRentals(rentals.value.filter((r: VehicleRentalDto) => new Date(r.rentTo) < now && r.status === 'ACTIVE'));
      }
      setLastRefresh(new Date());
    } catch (e) {
      toast.error('Lá»—i táº£i dá»¯ liá»‡u dashboard');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 120000); // auto refresh 2 min
    return () => clearInterval(timer);
  }, [fetchAll]);

  const handleCheckIn = async (id: number) => {
    try {
      await hotelService.updateBookingStatus(id, 'CHECKED_IN');
      toast.success('Check-in thĂ nh cĂ´ng!');
      fetchAll();
    } catch { toast.error('Lá»—i check-in'); }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await hotelService.updateBookingStatus(id, 'CHECKED_OUT');
      toast.success('Check-out thĂ nh cĂ´ng!');
      fetchAll();
    } catch { toast.error('Lá»—i check-out'); }
  };

  const fmtMoney = (n: number) => n?.toLocaleString('vi-VN') + 'Ä‘';
  const fmtTime = (dt: string) => new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const kpis = [
    { label: 'PhĂ²ng Ä‘ang á»Ÿ', value: dashboard?.inHouse ?? 'â€”', icon: Hotel, color: 'blue', sub: 'In-house guests' },
    { label: 'Check-in hĂ´m nay', value: dashboard?.checkInsToday ?? 'â€”', icon: LogIn, color: 'green', sub: 'arrivals today' },
    { label: 'Check-out hĂ´m nay', value: dashboard?.checkOutsToday ?? 'â€”', icon: LogOut, color: 'orange', sub: 'departures today' },
    { label: 'Doanh thu hĂ´m nay', value: todayRevenue ? fmtMoney(todayRevenue.totalRevenue || 0) : 'â€”', icon: TrendingUp, color: 'purple', sub: 'revenue today' },
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
          <h1>đŸ¨ Dashboard KhĂ¡ch Sáº¡n</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Cáº­p nháº­t lĂºc {lastRefresh.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={fetchAll}>
            <RefreshCw size={15} /> LĂ m má»›i
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/hotel/bookings/new')}>
            <Plus size={15} /> Äáº·t phĂ²ng má»›i
          </button>
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

      {/* 3-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 20 }}>

        {/* COL LEFT â€” HĂ nh Ä‘á»™ng hĂ´m nay */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Check-out hĂ´m nay */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                <LogOut size={16} style={{ verticalAlign: 'middle', marginRight: 6, color: '#ef4444' }} />
                Check-out hĂ´m nay ({checkouts.length})
              </h3>
            </div>
            {checkouts.length === 0 ? (
              <div className={styles.emptyState}><div className={styles.emptyIcon}>âœ…</div><p>KhĂ´ng cĂ³ ai check-out hĂ´m nay</p></div>
            ) : checkouts.map(b => (
              <div key={b.id} className={styles.checkoutItem}>
                <div className={styles.checkoutRoom}>{b.rooms[0]?.roomNo || '?'}</div>
                <div className={styles.checkoutInfo}>
                  <div className={styles.checkoutName}>{b.guestName}</div>
                  <div className={styles.checkoutTime}>
                    {fmtTime(b.checkOut)} Â· {b.paidAmount < b.totalAmount
                      ? <span style={{ color: '#ef4444' }}>â ï¸ CĂ²n ná»£ {fmtMoney(b.totalAmount - b.paidAmount)}</span>
                      : <span style={{ color: '#16a34a' }}>âœ… ÄĂ£ thanh toĂ¡n</span>}
                  </div>
                </div>
                <div className={styles.checkoutActions}>
                  <button className={styles.btnDanger} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleCheckOut(b.id)}>Check-out</button>
                  <button className={styles.btnSecondary} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => navigate(`/hotel/bookings/${b.id}`)}>Xem</button>
                </div>
              </div>
            ))}
          </div>

          {/* Check-in hĂ´m nay */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                <LogIn size={16} style={{ verticalAlign: 'middle', marginRight: 6, color: '#22c55e' }} />
                Check-in hĂ´m nay ({checkins.length})
              </h3>
            </div>
            {checkins.length === 0 ? (
              <div className={styles.emptyState}><div className={styles.emptyIcon}>đŸ›ï¸</div><p>ChÆ°a cĂ³ booking check-in hĂ´m nay</p></div>
            ) : checkins.map(b => (
              <div key={b.id} className={styles.checkoutItem}>
                <div className={styles.checkoutRoom} style={{ background: '#f0fdf4', color: '#16a34a' }}>{b.rooms[0]?.roomNo || '?'}</div>
                <div className={styles.checkoutInfo}>
                  <div className={styles.checkoutName}>{b.guestName}</div>
                  <div className={styles.checkoutTime}>{fmtTime(b.checkIn)} Â· {b.source || 'Direct'}</div>
                </div>
                <div className={styles.checkoutActions}>
                  <button className={styles.btnSuccess} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleCheckIn(b.id)}>Check-in</button>
                  <button className={styles.btnSecondary} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => navigate(`/hotel/bookings/${b.id}`)}>Xem</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COL MID â€” Mini room map */}
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>SÆ¡ Äá»“ PhĂ²ng</h3>
            <button className={styles.btnSecondary} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => navigate('/hotel/room-map')}>Xem Ä‘áº§y Ä‘á»§</button>
          </div>
          <div className={styles.legend}>
            {[['green','Trá»‘ng'],['red','CĂ³ khĂ¡ch'],['yellow','Báº©n'],['gray','OOS'],['blue','Checkout']].map(([c,l])=>(
              <div className={styles.legendItem} key={c}><div className={`${styles.legendDot}`} style={{ background: c === 'green' ? '#22c55e' : c === 'red' ? '#ef4444' : c === 'yellow' ? '#f59e0b' : c === 'blue' ? '#3b82f6' : '#6b7280' }} />{l}</div>
            ))}
          </div>
          {roomMap.length === 0 ? (
            <div className={styles.emptyState}><p>Äang táº£i sÆ¡ Ä‘á»“ phĂ²ng...</p></div>
          ) : roomMap.map((floor: any) => (
            <div key={floor.floorCode} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{floor.floorName}</div>
              <div className={styles.miniRoomGrid}>
                {floor.rooms?.map((r: any) => (
                  <div key={r.roomNo} className={`${styles.miniRoomCell} ${styles[getRoomStatusClass(r)]}`}
                    title={`${r.roomNo} - ${r.status}`}
                    onClick={() => navigate('/hotel/room-map')}
                  >{r.roomNo}</div>
                ))}
              </div>
            </div>
          ))}
          {/* Fallback mini grid if no map data */}
          {roomMap.length === 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Táº§ng 1</div>
              <div className={styles.miniRoomGrid}>
                {['101','102','103','104','105'].map(n => <div key={n} className={`${styles.miniRoomCell} ${styles.vacant}`}>{n}</div>)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', margin: '12px 0 8px' }}>Táº§ng 2-3</div>
              <div className={styles.miniRoomGrid}>
                {['201','301','302','303','304','305'].map(n => <div key={n} className={`${styles.miniRoomCell} ${styles.vacant}`}>{n}</div>)}
              </div>
            </div>
          )}
        </div>

        {/* COL RIGHT â€” Alerts & Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Overdue rentals */}
          {overdueRentals.length > 0 && (
            <div className={styles.card} style={{ borderLeft: '4px solid #ef4444' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={16} /> Xe quĂ¡ háº¡n tráº£ ({overdueRentals.length})
              </h3>
              {overdueRentals.map(r => (
                <div key={r.id} style={{ padding: '8px', background: '#fef2f2', borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{r.vehicleCode} â€” {r.guestName}</div>
                  <div style={{ fontSize: 12, color: '#dc2626' }}>QuĂ¡ háº¡n: {new Date(r.rentTo).toLocaleDateString('vi-VN')}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className={styles.card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>â¡ Thao TĂ¡c Nhanh</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '+ Äáº·t phĂ²ng má»›i', icon: 'đŸ›ï¸', path: '/hotel/bookings/new', color: '#eff6ff' },
                { label: '+ Cho thuĂª xe', icon: 'đŸï¸', path: '/hotel/vehicles', color: '#f0fdf4' },
                { label: '+ Walk-in', icon: 'đŸ¶', path: '/hotel/bookings/new?type=WALKIN', color: '#faf5ff' },
                { label: 'SÆ¡ Ä‘á»“ phĂ²ng', icon: 'đŸ—ºï¸', path: '/hotel/room-map', color: '#fff7ed' },
                { label: 'BĂ¡o cĂ¡o hĂ´m nay', icon: 'đŸ“', path: '/hotel/reports', color: '#f0fdf4' },
              ].map(a => (
                <button key={a.path} onClick={() => navigate(a.path)}
                  style={{ padding: '10px 14px', background: a.color, border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#1e293b', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'translateX(3px)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'translateX(0)')}
                >
                  <span style={{ fontSize: 18 }}>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Revenue summary */}
          {todayRevenue && (
            <div className={styles.card}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>đŸ’° Doanh Thu HĂ´m Nay</h3>
              {[
                ['PhĂ²ng', todayRevenue.roomRevenue],
                ['Xe mĂ¡y', todayRevenue.vehicleRevenue],
                ['Dá»‹ch vá»¥', todayRevenue.serviceRevenue],
              ].map(([l, v]) => (
                <div key={l as string} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{l as string}</span>
                  <span className={styles.infoValue}>{fmtMoney(v as number || 0)}</span>
                </div>
              ))}
              <div className={styles.infoRow} style={{ borderTop: '2px solid #e2e8f0', paddingTop: 10, marginTop: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Tá»•ng cá»™ng</span>
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

