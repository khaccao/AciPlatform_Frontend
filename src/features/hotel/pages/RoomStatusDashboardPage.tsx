import React, { useEffect, useState } from 'react';
import { Users, LogOut, CheckCircle, Clock, Calendar, PieChart, Activity, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';

export const RoomStatusDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const db = await hotelService.getDashboard();
      
      setData({
        revenue: db.revenue ?? db.Revenue ?? 0,
        adr: db.adr ?? db.Adr ?? 0,
        occupancy: db.occupancy ?? db.Occupancy ?? 0,
        inHouseRooms: db.inHouseRooms ?? db.InHouseRooms ?? 0,
        vacantTonight: db.vacantTonight ?? db.VacantTonight ?? 0,
        readyToCkin: db.readyToCkin ?? db.ReadyToCkin ?? 0,
        oos: db.oos ?? db.Oos ?? 0,
        totalRooms: db.totalRooms ?? db.TotalRooms ?? 0,
        availableToSell: db.availableToSell ?? db.AvailableToSell ?? 0,
        ooo: db.ooo ?? db.Ooo ?? 0,
        housekeeping: {
          inspected: db.hkInspected ?? db.HkInspected ?? 0,
          uninspected: db.hkUninspected ?? db.HkUninspected ?? 0,
          vc: db.hkVc ?? db.HkVc ?? 0,
          vd: db.hkVd ?? db.HkVd ?? 0,
        },
        movement: {
          expectedDep: { rooms: db.movExpectedDepRooms ?? db.MovExpectedDepRooms ?? 0, pax: db.movExpectedDepPax ?? db.MovExpectedDepPax ?? 0 },
          actualDep: { rooms: db.movActualDepRooms ?? db.MovActualDepRooms ?? 0, pax: db.movActualDepPax ?? db.MovActualDepPax ?? 0 },
          stayOver: { rooms: db.movStayOverRooms ?? db.MovStayOverRooms ?? 0, pax: db.movStayOverPax ?? db.MovStayOverPax ?? 0 },
          expectedArr: { rooms: db.movExpectedArrRooms ?? db.MovExpectedArrRooms ?? 0, pax: db.movExpectedArrPax ?? db.MovExpectedArrPax ?? 0 },
          extended: { rooms: db.movExtendedRooms ?? db.MovExtendedRooms ?? 0, pax: db.movExtendedPax ?? db.MovExtendedPax ?? 0 },
          walkIn: { rooms: db.movWalkInRooms ?? db.MovWalkInRooms ?? 0, pax: db.movWalkInPax ?? db.MovWalkInPax ?? 0 },
          sameDayRes: { rooms: db.movSameDayResRooms ?? db.MovSameDayResRooms ?? 0, pax: db.movSameDayResPax ?? db.MovSameDayResPax ?? 0 },
        },
        channelMix: {
          fit: { count: db.mixFit ?? db.MixFit ?? 0, pct: 0 },
          git: { count: db.mixGit ?? db.MixGit ?? 0, pct: 0 },
          company: { count: db.mixCompany ?? db.MixCompany ?? 0, pct: 0 },
          ota: { count: db.mixOta ?? db.MixOta ?? 0, pct: 0 },
        }
      });
    } catch {
      toast.error('Lỗi tải dữ liệu trạng thái phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>Đang tải...</div>;
  if (!data) return null;

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>📊 Trạng Thái Phòng Hôm Nay</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>{new Date().toLocaleDateString('vi-VN')} · Cập nhật theo thời gian thực</p>
        </div>
        <button className={styles.btnSecondary} onClick={fetchStatus}><RefreshCw size={15}/> Làm mới</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* KPI Chính */}
        <div className={styles.card} style={{ background: 'linear-gradient(135deg, #1e6fff 0%, #3b82f6 100%)', color: '#fff', border: 'none' }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Doanh thu phòng</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{data.revenue.toLocaleString('vi-VN')}đ</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.9 }}>
            <span>Giá TB: {data.adr.toLocaleString('vi-VN')}đ</span>
            <span style={{ fontWeight: 700 }}>Công suất: {data.occupancy}%</span>
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Users size={20} /></div>
            <span style={{ background: '#f8fafc', color: '#64748b', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Tình trạng ở</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{data.inHouseRooms}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>phòng đang ở</div>
        </div>

        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}><CheckCircle size={20} /></div>
            <span style={{ background: '#f8fafc', color: '#64748b', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Sẵn sàng</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{data.vacantTonight}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Trống đêm nay</div>
        </div>
        
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Activity size={20} /></div>
            <span style={{ background: '#f8fafc', color: '#64748b', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Bảo trì</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{data.oos}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>phòng OOS / Hỏng</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Cột 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className={styles.card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={18} color="#3b82f6"/> Tổng quan phòng (Hotel Overview)</h3>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Tổng số phòng</span><span className={styles.infoValue}>{data.totalRooms}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Phòng sẵn bán</span><span className={styles.infoValue}>{data.availableToSell}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Hỏng (OOO)</span><span className={styles.infoValue}>{data.ooo}</span></div>
          </div>

          <div className={styles.card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><RefreshCw size={18} color="#10b981"/> Dọn phòng (Cleaning Status)</h3>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Đã kiểm tra</span><span className={styles.infoValue}>{data.housekeeping.inspected}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Chưa kiểm tra</span><span className={styles.infoValue}>{data.housekeeping.uninspected}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel} style={{ color: '#16a34a', fontWeight: 600 }}>TRỐNG SẠCH (VC)</span><span className={styles.infoValue}>{data.housekeeping.vc}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel} style={{ color: '#d97706', fontWeight: 600 }}>TRỐNG BẨN (VD)</span><span className={styles.infoValue}>{data.housekeeping.vd}</span></div>
          </div>

          <div className={styles.card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><PieChart size={18} color="#8b5cf6"/> Nguồn khách (Channel Mix)</h3>
            <div style={{ marginBottom: 16, background: '#f8fafc', padding: '12px', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>PHÂN BỔ CÔNG SUẤT</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>0%</div>
            </div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Cá nhân</span><span className={styles.infoValue}>{data.channelMix.fit.count} ({data.channelMix.fit.pct}%)</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Đoàn khách</span><span className={styles.infoValue}>{data.channelMix.git.count} ({data.channelMix.git.pct}%)</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Công ty</span><span className={styles.infoValue}>{data.channelMix.company.count} ({data.channelMix.company.pct}%)</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Đại lý</span><span className={styles.infoValue}>{data.channelMix.ota.count} ({data.channelMix.ota.pct}%)</span></div>
          </div>
        </div>

        {/* Cột 2 */}
        <div>
          <div className={styles.card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} color="#f59e0b"/> Chuyển động trong ngày (Movement Analysis)</h3>
            <table className={styles.dataTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, fontSize: 12 }}>DANH MỤC</th>
                  <th style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, fontSize: 12 }}>ROOM</th>
                  <th style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, fontSize: 12 }}>PAX</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Expected Departures', data.movement.expectedDep],
                  ['Actual Departures', data.movement.actualDep],
                  ['In-House (Stay Over)', data.movement.stayOver],
                  ['Expected Arrivals', data.movement.expectedArr],
                  ['Extended Stays', data.movement.extended],
                  ['Walk Ins', data.movement.walkIn],
                  ['Same Day Reservation', data.movement.sameDayRes],
                ].map(([label, val]: any, i) => (
                  <tr key={label} style={{ borderBottom: i === 6 ? 'none' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 0', fontSize: 14, fontWeight: 500, color: '#334155' }}>{label}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 15, fontWeight: 700 }}>{val.rooms}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 14, color: '#64748b' }}>{val.pax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomStatusDashboardPage;
