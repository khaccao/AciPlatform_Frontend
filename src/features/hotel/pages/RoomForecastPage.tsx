import React, { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';

export const RoomForecastPage: React.FC = () => {
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());

  const daysToLoad = 14;

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const fromStr = startDate.toISOString().split('T')[0];
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + daysToLoad - 1);
      const toStr = endDate.toISOString().split('T')[0];
      
      const data = await hotelService.getRoomForecast(fromStr, toStr);
      setForecast(data);
    } catch {
      toast.error('Lỗi tải dữ liệu forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [startDate]);

  const changeDate = (days: number) => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + days);
    setStartDate(next);
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < daysToLoad; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dates = generateDates();

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Room Forecast</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Dự báo công suất và số lượng phòng trống</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={() => changeDate(-7)}><ChevronLeft size={16} /> 7 ngày trước</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: 8 }}>
            <Calendar size={15} color="#64748b" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{dates[0].toLocaleDateString('vi-VN')} - {dates[dates.length-1].toLocaleDateString('vi-VN')}</span>
          </div>
          <button className={styles.btnSecondary} onClick={() => changeDate(7)}>7 ngày sau <ChevronRight size={16} /></button>
          <button className={styles.btnPrimary} onClick={fetchForecast}><RefreshCw size={15} /> Làm mới</button>
        </div>
      </div>

      <div className={styles.card} style={{ overflowX: 'auto', padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Đang tải...</div>
        ) : forecast.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <p>Không có dữ liệu loại phòng</p>
          </div>
        ) : (
          <table className={styles.dataTable} style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ width: 250, position: 'sticky', left: 0, zIndex: 10, background: '#f8fafc', borderRight: '1px solid #e2e8f0', textAlign: 'left', padding: '12px 16px' }}>
                  Loại phòng
                </th>
                {dates.map((d, i) => (
                  <th key={i} style={{ textAlign: 'center', padding: '12px 4px', minWidth: 60 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                      {d.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: 14, color: '#0f172a' }}>
                      {d.getDate()}/{d.getMonth() + 1}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forecast.map((fc: any, index: number) => (
                <tr key={index}>
                  <td style={{ position: 'sticky', left: 0, zIndex: 10, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '12px 16px', fontWeight: 600 }}>
                    {fc.roomTypeName || fc.roomType || 'Không xác định'}
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>Tổng: {fc.totalRooms || 0} phòng</div>
                  </td>
                  {dates.map((d, i) => {
                    const dStr = d.toISOString().split('T')[0];
                    let avail = 0;
                    const dates = fc.dates || fc.Dates;
                    if (Array.isArray(dates)) {
                      const found = dates.find((a:any) => (a.date || a.Date)?.startsWith(dStr));
                      avail = found ? (found.availableCount ?? found.AvailableCount ?? 0) : (fc.totalRooms || fc.TotalRooms || 0);
                    } else {
                      avail = fc.totalRooms || fc.TotalRooms || 0;
                    }
                    
                    let bg = '#fff';
                    let color = '#1e293b';
                    if (avail <= 0) { bg = '#fee2e2'; color = '#b91c1c'; } // Đỏ
                    else if (avail < 3) { bg = '#fef3c7'; color = '#b45309'; } // Vàng
                    else { bg = '#f0fdf4'; color = '#15803d'; } // Xanh

                    return (
                      <td key={i} style={{ textAlign: 'center', padding: '8px 4px', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ background: bg, color, borderRadius: 6, padding: '4px 0', fontSize: 13, fontWeight: 700, margin: '0 auto', maxWidth: 40 }}>
                          {avail}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RoomForecastPage;
