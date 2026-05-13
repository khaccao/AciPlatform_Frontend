import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';

const COLORS = ['#1e6fff', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
const MONTHS_VI = ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12'];

export const ReportsPage: React.FC = () => {
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [vehicleUtil, setVehicleUtil] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [occ, rev, veh] = await Promise.allSettled([
        hotelService.getOccupancyReport(dateRange.from, dateRange.to),
        hotelService.getRevenueByMonth(),
        hotelService.getVehicleUtilization(dateRange.from, dateRange.to),
      ]);
      if (occ.status === 'fulfilled') setOccupancy(occ.value);
      if (rev.status === 'fulfilled') setRevenue(rev.value.map((r: any) => ({ ...r, month: MONTHS_VI[r.month - 1] || r.month })));
      if (veh.status === 'fulfilled') setVehicleUtil(veh.value);
    } finally { setLoading(false); }
  };

  const fmtMoney = (v: number) => (v / 1000000).toFixed(1) + 'M';
  const fmtTooltipMoney = (value: unknown) => [`${(Number(value ?? 0) / 1000000).toFixed(1)}M đ`];
  const fmtTooltipPercent = (value: unknown) => [`${Number(value ?? 0)}%`, 'Công suất'];
  const totalRevenue = revenue.reduce((s, r) => s + (r.totalRevenue || 0), 0);
  const avgOccupancy = occupancy.length > 0 ? Math.round(occupancy.reduce((s, o) => s + (o.occupancyRate || 0), 0) / occupancy.length) : 0;

  const revenueBreakdown = [
    { name: 'Phòng', value: revenue.reduce((s, r) => s + (r.roomRevenue || 0), 0) },
    { name: 'Xe máy', value: revenue.reduce((s, r) => s + (r.vehicleRevenue || 0), 0) },
    { name: 'Dịch vụ', value: revenue.reduce((s, r) => s + (r.serviceRevenue || 0), 0) },
  ].filter(d => d.value > 0);

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>📊 Báo Cáo & Thống Kê</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Tổng quan hoạt động kinh doanh</p>
        </div>
        <div className={styles.headerActions}>
          <input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }} />
          <span style={{ color: '#94a3b8', fontSize: 14 }}>đến</span>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }} />
          <button className={styles.btnPrimary} onClick={fetchAll}>Xem báo cáo</button>
        </div>
      </div>

      {/* KPI tổng quan */}
      <div className={styles.kpiGrid} style={{ marginBottom: 24 }}>
        {[
          { label: 'Doanh thu YTD', value: `${(totalRevenue / 1000000).toFixed(1)}M đ`, icon: '💰', color: 'purple' },
          { label: 'Công suất TB', value: `${avgOccupancy}%`, icon: '🏨', color: 'blue' },
          { label: 'Tháng hiện tại', value: revenue.length > 0 ? `${(revenue[revenue.length - 1]?.totalRevenue / 1000000 || 0).toFixed(1)}M đ` : '—', icon: '📅', color: 'green' },
          { label: 'Xe đang cho thuê', value: vehicleUtil.length.toString(), icon: '🏍️', color: 'orange' },
        ].map(k => (
          <div className={styles.kpiCard} key={k.label}>
            <div className={`${styles.kpiIcon} ${styles[k.color]}`} style={{ fontSize: 20 }}>{k.icon}</div>
            <div className={styles.kpiLabel}>{k.label}</div>
            <div className={styles.kpiValue}>{loading ? '...' : k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Biểu đồ doanh thu theo tháng */}
        <div className={styles.card}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>📈 Doanh Thu Theo Tháng</h3>
          {revenue.length === 0 ? (
            <div className={styles.emptyState}><p>Chưa có dữ liệu doanh thu</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={fmtMoney} tick={{ fontSize: 11 }} width={50} />
                <Tooltip formatter={fmtTooltipMoney} />
                <Legend />
                <Bar dataKey="roomRevenue" name="Phòng" fill="#1e6fff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vehicleRevenue" name="Xe máy" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="serviceRevenue" name="Dịch vụ" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Biểu đồ tròn cơ cấu doanh thu */}
        <div className={styles.card}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>🥧 Cơ Cấu Doanh Thu</h3>
          {revenueBreakdown.length === 0 ? (
            <div className={styles.emptyState}><p>Chưa có dữ liệu</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={revenueBreakdown} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {revenueBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={fmtTooltipMoney} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Công suất phòng */}
      <div className={styles.card} style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>📊 Công Suất Phòng Theo Ngày</h3>
        {occupancy.length === 0 ? (
          <div className={styles.emptyState}><p>Chưa có dữ liệu công suất trong khoảng thời gian này</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={occupancy} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} width={40} />
              <Tooltip formatter={fmtTooltipPercent} />
              <Line type="monotone" dataKey="occupancyRate" name="Công suất" stroke="#1e6fff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bảng chi tiết công suất */}
      {occupancy.length > 0 && (
        <div className={styles.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📋 Chi Tiết Công Suất</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Ngày</th><th>Phòng có khách</th><th>Tổng phòng</th>
                  <th>Công suất</th><th>Doanh thu</th><th>ADR</th>
                </tr>
              </thead>
              <tbody>
                {occupancy.slice(0, 30).map((o, i) => (
                  <tr key={i}>
                    <td>{new Date(o.date).toLocaleDateString('vi-VN')}</td>
                    <td style={{ textAlign: 'center' }}>{o.occupiedRooms}</td>
                    <td style={{ textAlign: 'center' }}>{o.totalRooms}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className={styles.progressBar} style={{ flex: 1 }}>
                          <div className={styles.fill} style={{ width: `${o.occupancyRate || 0}%`, background: (o.occupancyRate || 0) > 80 ? '#22c55e' : (o.occupancyRate || 0) > 50 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{o.occupancyRate || 0}%</span>
                      </div>
                    </td>
                    <td>{(o.revenue || 0).toLocaleString('vi-VN')}đ</td>
                    <td>{(o.adr || 0).toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
