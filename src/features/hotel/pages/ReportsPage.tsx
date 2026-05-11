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
    } catch { toast.error('Lá»—i táº£i bĂ¡o cĂ¡o'); }
    finally { setLoading(false); }
  };

  const fmtMoney = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n?.toLocaleString();
  };
  const fmtMoneyFull = (n: number) => n?.toLocaleString('vi-VN') + 'Ä‘';
  const MONTH_LABELS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

  const monthData = MONTH_LABELS.map((label, i) => {
    const d = monthlyRevenue.find((r: any) => r.period?.endsWith(`-${String(i+1).padStart(2,'0')}`));
    return { label, roomRevenue: d?.roomRevenue || 0, vehicleRevenue: d?.vehicleRevenue || 0, serviceRevenue: d?.serviceRevenue || 0, total: d?.totalRevenue || 0, bookings: d?.bookingCount || 0 };
  });

  const revenueBreakdown = todayRevenue ? [
    { name: 'PhĂ²ng', value: todayRevenue.roomRevenue || 0 },
    { name: 'Xe mĂ¡y', value: todayRevenue.vehicleRevenue || 0 },
    { name: 'Dá»‹ch vá»¥', value: todayRevenue.serviceRevenue || 0 },
  ].filter(x => x.value > 0) : [];

  const kpis = [
    { label: 'Doanh thu thĂ¡ng nĂ y', value: fmtMoneyFull(monthData[new Date().getMonth()]?.total || 0), color: '#1e6fff' },
    { label: 'Booking thĂ¡ng nĂ y', value: monthData[new Date().getMonth()]?.bookings || 0, color: '#22c55e' },
    { label: 'Occupancy trung bĂ¬nh', value: `${occupancy.length > 0 ? Math.round(occupancy.reduce((a: any, b: any) => a + (b.occupancyPercent || 0), 0) / occupancy.length) : 0}%`, color: '#f59e0b' },
    { label: 'Doanh thu hĂ´m nay', value: fmtMoneyFull(todayRevenue?.totalRevenue || 0), color: '#8b5cf6' },
  ];

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <h1>đŸ“ BĂ¡o CĂ¡o & PhĂ¢n TĂ­ch</h1>
        <div className={styles.headerActions}>
          <select className={styles.filterSelect} value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className={styles.btnSecondary} onClick={fetchAll}><RefreshCw size={15} /> LĂ m má»›i</button>
          <button className={styles.btnSecondary}><Download size={15} /> Export</button>
        </div>
      </div>

      {/* Date Range */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Khoáº£ng thá»i gian:</span>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }} />
        <span style={{ color: '#94a3b8' }}>â†’</span>
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
        {[['overview','đŸ“ˆ Tá»•ng quan'],['occupancy','đŸ¨ CĂ´ng suáº¥t'],['revenue','đŸ’° Doanh thu'],['vehicles','đŸï¸ Xe mĂ¡y']].map(([k,l])=>(
          <button key={k} className={`${styles.tab} ${tab===k?styles.active:''}`} onClick={()=>setTab(k as any)}>{l}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div className={styles.chartCard}>
            <h3>Doanh thu theo thĂ¡ng nÄƒm {year}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={fmtMoney} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmtMoneyFull(v)} />
                <Legend />
                <Bar dataKey="roomRevenue" name="PhĂ²ng" stackId="a" fill="#1e6fff" />
                <Bar dataKey="vehicleRevenue" name="Xe" stackId="a" fill="#22c55e" />
                <Bar dataKey="serviceRevenue" name="Dá»‹ch vá»¥" stackId="a" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {revenueBreakdown.length > 0 && (
              <div className={styles.chartCard}>
                <h3>Tá»· trá»ng doanh thu hĂ´m nay</h3>
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
              <h3>Sá»‘ booking theo thĂ¡ng</h3>
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
            <h3>% CĂ´ng suáº¥t phĂ²ng theo ngĂ y</h3>
            {occupancy.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={occupancy.map((o: any) => ({ ...o, date: new Date(o.date).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' }) }))}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="occupancyPercent" name="CĂ´ng suáº¥t" stroke="#1e6fff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>KhĂ´ng cĂ³ dá»¯ liá»‡u trong khoáº£ng thá»i gian nĂ y</div>}
          </div>

          {occupancy.length > 0 && (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead><tr><th>NgĂ y</th><th>Tá»•ng phĂ²ng</th><th>CĂ³ khĂ¡ch</th><th>Tá»•ng giÆ°á»ng</th><th>GiÆ°á»ng Ä‘Ă£ thuĂª</th><th>% CĂ´ng suáº¥t</th><th>Doanh thu</th><th>ADR</th></tr></thead>
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
              <thead><tr><th>ThĂ¡ng</th><th>PhĂ²ng</th><th>Xe mĂ¡y</th><th>Dá»‹ch vá»¥</th><th>Tá»•ng doanh thu</th><th>Sá»‘ booking</th><th>Sá»‘ khĂ¡ch</th></tr></thead>
              <tbody>
                {monthData.map((m, i) => (
                  <tr key={i} style={{ fontWeight: m.total > 0 ? 500 : 400, color: m.total > 0 ? '#1e293b' : '#94a3b8' }}>
                    <td style={{ fontWeight: 700 }}>ThĂ¡ng {i + 1}</td>
                    <td>{m.roomRevenue > 0 ? fmtMoneyFull(m.roomRevenue) : 'â€”'}</td>
                    <td>{m.vehicleRevenue > 0 ? fmtMoneyFull(m.vehicleRevenue) : 'â€”'}</td>
                    <td>{m.serviceRevenue > 0 ? fmtMoneyFull(m.serviceRevenue) : 'â€”'}</td>
                    <td style={{ fontWeight: 800, color: m.total > 0 ? '#1e6fff' : '#94a3b8' }}>{m.total > 0 ? fmtMoneyFull(m.total) : 'â€”'}</td>
                    <td style={{ textAlign: 'center' }}>{m.bookings || 'â€”'}</td>
                    <td style={{ textAlign: 'center' }}>â€”</td>
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                  <td>Tá»•ng nÄƒm {year}</td>
                  <td>{fmtMoneyFull(monthData.reduce((a,m)=>a+m.roomRevenue,0))}</td>
                  <td>{fmtMoneyFull(monthData.reduce((a,m)=>a+m.vehicleRevenue,0))}</td>
                  <td>{fmtMoneyFull(monthData.reduce((a,m)=>a+m.serviceRevenue,0))}</td>
                  <td style={{ color: '#1e6fff', fontSize: 16 }}>{fmtMoneyFull(monthData.reduce((a,m)=>a+m.total,0))}</td>
                  <td style={{ textAlign: 'center' }}>{monthData.reduce((a,m)=>a+m.bookings,0)}</td>
                  <td>â€”</td>
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
            <thead><tr><th>MĂ£ xe</th><th>Sá»‘ láº§n thuĂª</th><th>Tá»•ng ngĂ y</th><th>Doanh thu</th></tr></thead>
            <tbody>
              {vehicleData.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>KhĂ´ng cĂ³ dá»¯ liá»‡u trong khoáº£ng thá»i gian nĂ y</td></tr>
                : vehicleData.map((v: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{v.vehicleCode}</td>
                    <td style={{ textAlign: 'center' }}>{v.totalRentals}</td>
                    <td style={{ textAlign: 'center' }}>{v.totalDays} ngĂ y</td>
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

