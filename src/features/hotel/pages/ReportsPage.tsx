import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';

const COLORS = ['#1e6fff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ReportsPage: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'occupancy' | 'revenue' | 'vehicles'>('overview');
  const [year, setYear] = useState(new Date().getFullYear());
  const [fromDate, setFromDate] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; });
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [todayRevenue, setTodayRevenue] = useState<any>(null);

  useEffect(() => { fetchAll(); }, [year, fromDate, toDate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rev, occ, veh, today] = await Promise.allSettled([
        hotelService.getRevenueByMonth(year),
        hotelService.getOccupancyReport(fromDate, toDate),
        hotelService.getVehicleUtilization(fromDate, toDate),
        hotelService.getRevenueToday(),
      ]);
      if (rev.status === 'fulfilled') setMonthlyRevenue(rev.value);
      if (occ.status === 'fulfilled') setOccupancy(occ.value);
      if (veh.status === 'fulfilled') setVehicleData(veh.value);
      if (today.status === 'fulfilled') setTodayRevenue(today.value);
    } catch { toast.error('Lỗi tải báo cáo'); }
    finally { setLoading(false); }
  };

  const fmtMoney = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n?.toLocaleString();
  };
  const fmtMoneyFull = (n: number) => n?.toLocaleString('vi-VN') + 'đ';
  const MONTH_LABELS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

  const monthData = MONTH_LABELS.map((label, i) => {
    const d = monthlyRevenue.find((r: any) => r.period?.endsWith(`-${String(i+1).padStart(2,'0')}`));
    return { label, roomRevenue: d?.roomRevenue || 0, vehicleRevenue: d?.vehicleRevenue || 0, serviceRevenue: d?.serviceRevenue || 0, total: d?.totalRevenue || 0, bookings: d?.bookingCount || 0 };
  });

  const revenueBreakdown = todayRevenue ? [
    { name: 'Phòng', value: todayRevenue.roomRevenue || 0 },
    { name: 'Xe máy', value: todayRevenue.vehicleRevenue || 0 },
    { name: 'Dịch vụ', value: todayRevenue.serviceRevenue || 0 },
  ].filter(x => x.value > 0) : [];

  const kpis = [
    { label: 'Doanh thu tháng này', value: fmtMoneyFull(monthData[new Date().getMonth()]?.total || 0), color: '#1e6fff' },
    { label: 'Booking tháng này', value: monthData[new Date().getMonth()]?.bookings || 0, color: '#22c55e' },
    { label: 'Occupancy trung bình', value: `${occupancy.length > 0 ? Math.round(occupancy.reduce((a: any, b: any) => a + (b.occupancyPercent || 0), 0) / occupancy.length) : 0}%`, color: '#f59e0b' },
    { label: 'Doanh thu hôm nay', value: fmtMoneyFull(todayRevenue?.totalRevenue || 0), color: '#8b5cf6' },
  ];

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <h1>📊 Báo Cáo & Phân Tích</h1>
        <div className={styles.headerActions}>
          <select className={styles.filterSelect} value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className={styles.btnSecondary} onClick={fetchAll}><RefreshCw size={15} /> Làm mới</button>
          <button className={styles.btnSecondary}><Download size={15} /> Export</button>
        </div>
      </div>

      {/* Date Range */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Khoảng thời gian:</span>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }} />
        <span style={{ color: '#94a3b8' }}>→</span>
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }} />
      </div>

      {/* KPI */}
      <div className={styles.kpiGrid} style={{ marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} className={styles.kpiCard}>
            <div className={styles.kpiLabel}>{k.label}</div>
            <div className={styles.kpiValue} style={{ fontSize: 22, color: k.color }}>{loading ? '...' : k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[['overview','📈 Tổng quan'],['occupancy','🏨 Công suất'],['revenue','💰 Doanh thu'],['vehicles','🏍️ Xe máy']].map(([k,l])=>(
          <button key={k} className={`${styles.tab} ${tab===k?styles.active:''}`} onClick={()=>setTab(k as any)}>{l}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div className={styles.chartCard}>
            <h3>Doanh thu theo tháng năm {year}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={fmtMoney} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmtMoneyFull(v)} />
                <Legend />
                <Bar dataKey="roomRevenue" name="Phòng" stackId="a" fill="#1e6fff" />
                <Bar dataKey="vehicleRevenue" name="Xe" stackId="a" fill="#22c55e" />
                <Bar dataKey="serviceRevenue" name="Dịch vụ" stackId="a" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {revenueBreakdown.length > 0 && (
              <div className={styles.chartCard}>
                <h3>Tỷ trọng doanh thu hôm nay</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                      {revenueBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtMoneyFull(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className={styles.chartCard}>
              <h3>Số booking theo tháng</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthData}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#1e6fff" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Occupancy Tab */}
      {tab === 'occupancy' && (
        <div>
          <div className={styles.chartCard}>
            <h3>% Công suất phòng theo ngày</h3>
            {occupancy.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={occupancy.map((o: any) => ({ ...o, date: new Date(o.date).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' }) }))}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="occupancyPercent" name="Công suất" stroke="#1e6fff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Không có dữ liệu trong khoảng thời gian này</div>}
          </div>

          {occupancy.length > 0 && (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead><tr><th>Ngày</th><th>Tổng phòng</th><th>Có khách</th><th>Tổng giường</th><th>Giường đã thuê</th><th>% Công suất</th><th>Doanh thu</th><th>ADR</th></tr></thead>
                <tbody>
                  {occupancy.map((o: any, i: number) => (
                    <tr key={i}>
                      <td>{new Date(o.date).toLocaleDateString('vi-VN')}</td>
                      <td style={{ textAlign: 'center' }}>{o.totalRooms}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{o.occupiedRooms}</td>
                      <td style={{ textAlign: 'center' }}>{o.totalBeds}</td>
                      <td style={{ textAlign: 'center' }}>{o.occupiedBeds}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className={styles.progressBar} style={{ flex: 1 }}>
                            <div className={styles.fill} style={{ width: `${o.occupancyPercent}%`, background: o.occupancyPercent > 80 ? '#22c55e' : o.occupancyPercent > 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span style={{ fontWeight: 700, color: '#1e293b', minWidth: 36 }}>{o.occupancyPercent}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{fmtMoneyFull(o.revenue)}</td>
                      <td>{fmtMoneyFull(o.adr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Revenue Tab */}
      {tab === 'revenue' && (
        <div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead><tr><th>Tháng</th><th>Phòng</th><th>Xe máy</th><th>Dịch vụ</th><th>Tổng doanh thu</th><th>Số booking</th><th>Số khách</th></tr></thead>
              <tbody>
                {monthData.map((m, i) => (
                  <tr key={i} style={{ fontWeight: m.total > 0 ? 500 : 400, color: m.total > 0 ? '#1e293b' : '#94a3b8' }}>
                    <td style={{ fontWeight: 700 }}>Tháng {i + 1}</td>
                    <td>{m.roomRevenue > 0 ? fmtMoneyFull(m.roomRevenue) : '—'}</td>
                    <td>{m.vehicleRevenue > 0 ? fmtMoneyFull(m.vehicleRevenue) : '—'}</td>
                    <td>{m.serviceRevenue > 0 ? fmtMoneyFull(m.serviceRevenue) : '—'}</td>
                    <td style={{ fontWeight: 800, color: m.total > 0 ? '#1e6fff' : '#94a3b8' }}>{m.total > 0 ? fmtMoneyFull(m.total) : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{m.bookings || '—'}</td>
                    <td style={{ textAlign: 'center' }}>—</td>
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                  <td>Tổng năm {year}</td>
                  <td>{fmtMoneyFull(monthData.reduce((a,m)=>a+m.roomRevenue,0))}</td>
                  <td>{fmtMoneyFull(monthData.reduce((a,m)=>a+m.vehicleRevenue,0))}</td>
                  <td>{fmtMoneyFull(monthData.reduce((a,m)=>a+m.serviceRevenue,0))}</td>
                  <td style={{ color: '#1e6fff', fontSize: 16 }}>{fmtMoneyFull(monthData.reduce((a,m)=>a+m.total,0))}</td>
                  <td style={{ textAlign: 'center' }}>{monthData.reduce((a,m)=>a+m.bookings,0)}</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {tab === 'vehicles' && (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead><tr><th>Mã xe</th><th>Số lần thuê</th><th>Tổng ngày</th><th>Doanh thu</th></tr></thead>
            <tbody>
              {vehicleData.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không có dữ liệu trong khoảng thời gian này</td></tr>
                : vehicleData.map((v: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{v.vehicleCode}</td>
                    <td style={{ textAlign: 'center' }}>{v.totalRentals}</td>
                    <td style={{ textAlign: 'center' }}>{v.totalDays} ngày</td>
                    <td style={{ fontWeight: 700, color: '#1e6fff' }}>{fmtMoneyFull(v.revenue)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
