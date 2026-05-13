import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { RoomRackCell, RoomRackData, RoomRackRoom } from '../services/hotel.types';

const statusStyle: Record<string, { bg: string; color: string; border: string; label: string }> = {
  CONFIRMED: { bg: '#dbeafe', color: '#1d4ed8', border: '#60a5fa', label: 'Đã xác nhận' },
  CHECKED_IN: { bg: '#dcfce7', color: '#15803d', border: '#4ade80', label: 'Đang ở' },
  CHECKED_OUT: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: 'Đã trả' },
  HOLD: { bg: '#fef3c7', color: '#b45309', border: '#fbbf24', label: 'Giữ phòng' },
  MAINTENANCE: { bg: '#fee2e2', color: '#b91c1c', border: '#f87171', label: 'Bảo trì' },
  VACANT: { bg: '#fff', color: '#64748b', border: '#e2e8f0', label: 'Trống' },
};

const dateToInput = (date: Date) => date.toISOString().split('T')[0];
const addDays = (value: string, days: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return dateToInput(date);
};

export const RoomRackPage: React.FC = () => {
  const [rack, setRack] = useState<RoomRackData | null>(null);
  const [fromDate, setFromDate] = useState(dateToInput(new Date()));
  const [days, setDays] = useState(21);
  const [cellWidth, setCellWidth] = useState(96);
  const [roomColWidth, setRoomColWidth] = useState(180);
  const [loading, setLoading] = useState(true);
  const [dragCell, setDragCell] = useState<{ cell: RoomRackCell; room: RoomRackRoom } | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; cell: RoomRackCell; room: RoomRackRoom } | null>(null);

  const fetchRack = async () => {
    setLoading(true);
    try {
      setRack(await hotelService.getRoomRack(fromDate, days));
    } catch {
      toast.error('Lỗi tải room rack');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRack(); }, [fromDate, days]);

  const floors = useMemo(() => {
    const grouped: Record<string, RoomRackRoom[]> = {};
    (rack?.rooms ?? []).forEach(room => {
      const floor = room.floor || 'Khác';
      grouped[floor] = grouped[floor] || [];
      grouped[floor].push(room);
    });
    return grouped;
  }, [rack]);

  const startResize = (kind: 'room' | 'cell', startX: number) => {
    const startWidth = kind === 'room' ? roomColWidth : cellWidth;
    const onMove = (event: MouseEvent) => {
      const next = Math.max(kind === 'room' ? 130 : 54, Math.min(260, startWidth + event.clientX - startX));
      if (kind === 'room') setRoomColWidth(next);
      else setCellWidth(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const moveBooking = async (toRoom: RoomRackRoom, targetDate: string) => {
    if (!dragCell?.cell.bookingId) return;
    const span = Math.max(1, dragCell.cell.spanDays || 1);
    try {
      await hotelService.moveRoomRackBooking({
        bookingId: dragCell.cell.bookingId,
        fromRoomNo: dragCell.room.roomNo,
        toRoomNo: toRoom.roomNo,
        checkIn: targetDate,
        checkOut: addDays(targetDate, span),
      });
      toast.success('Đã chuyển phòng trên room rack');
      setDragCell(null);
      fetchRack();
    } catch {
      toast.error('Không chuyển được booking');
    }
  };

  const renderCellContent = (room: RoomRackRoom, cell: RoomRackCell) => {
    const status = statusStyle[cell.status] || statusStyle.VACANT;
    if (!cell.bookingId && !cell.blockType) return null;

    return (
      <div
        draggable={!!cell.bookingId}
        onDragStart={() => setDragCell({ cell, room })}
        onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, cell, room })}
        onMouseLeave={() => setTooltip(null)}
        style={{
          height: 30,
          borderRadius: 6,
          padding: '4px 7px',
          background: status.bg,
          color: status.color,
          border: `1px solid ${status.border}`,
          fontSize: 12,
          fontWeight: 700,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          cursor: cell.bookingId ? 'grab' : 'default',
        }}
      >
        {cell.isStart ? `${cell.bookingCode || cell.blockType} · ${cell.guestName || cell.note || status.label}` : cell.guestName || cell.blockType}
      </div>
    );
  };

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Room Rack</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Bảng phòng theo ngày, kéo thả booking để đổi phòng/ngày, kéo mép cột để đổi độ rộng.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={() => setFromDate(addDays(fromDate, -days))}><ChevronLeft size={15} /> Lùi</button>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }} />
          <select value={days} onChange={e => setDays(Number(e.target.value))} className={styles.filterSelect}>
            <option value={14}>14 ngày</option>
            <option value={21}>21 ngày</option>
            <option value={31}>31 ngày</option>
            <option value={62}>62 ngày</option>
          </select>
          <button className={styles.btnSecondary} onClick={() => setFromDate(addDays(fromDate, days))}>Tới <ChevronRight size={15} /></button>
          <button className={styles.btnPrimary} onClick={fetchRack}><RefreshCw size={15} /> Tải lại</button>
        </div>
      </div>

      <div className={styles.legend}>
        {Object.entries(statusStyle).filter(([key]) => key !== 'VACANT').map(([key, item]) => (
          <div key={key} className={styles.legendItem}><span className={styles.legendDot} style={{ background: item.border }} />{item.label}</div>
        ))}
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: roomColWidth + (rack?.dates.length ?? days) * cellWidth }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, top: 0, zIndex: 4, width: roomColWidth, minWidth: roomColWidth, background: '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '10px 12px', textAlign: 'left' }}>
                  Phòng
                  <GripVertical size={14} onMouseDown={(e) => startResize('room', e.clientX)} style={{ float: 'right', cursor: 'col-resize', color: '#94a3b8' }} />
                </th>
                {rack?.dates.map((d, index) => (
                  <th key={d.date} style={{ position: 'sticky', top: 0, zIndex: 3, width: cellWidth, minWidth: cellWidth, background: d.isToday ? '#eff6ff' : d.isWeekend ? '#fff7ed' : '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', padding: '8px 6px', textAlign: 'center', fontSize: 12 }}>
                    <div style={{ fontWeight: 800 }}>{d.label}</div>
                    <div style={{ color: '#64748b' }}>{new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                    {index === 0 && <GripVertical size={14} onMouseDown={(e) => startResize('cell', e.clientX)} style={{ position: 'absolute', right: 2, top: 18, cursor: 'col-resize', color: '#94a3b8' }} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={{ padding: 28 }}>Đang tải...</td></tr>
              ) : Object.entries(floors).map(([floor, rooms]) => (
                <React.Fragment key={floor}>
                  <tr>
                    <td colSpan={(rack?.dates.length ?? 0) + 1} style={{ position: 'sticky', left: 0, background: '#eef2ff', color: '#3730a3', fontWeight: 800, padding: '8px 12px', borderBottom: '1px solid #c7d2fe' }}>Tầng {floor}</td>
                  </tr>
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td style={{ position: 'sticky', left: 0, zIndex: 2, width: roomColWidth, minWidth: roomColWidth, background: '#fff', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #f1f5f9', padding: '9px 12px' }}>
                        <div style={{ fontWeight: 800 }}>{room.roomNo}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{room.roomTypeName || room.roomType}</div>
                      </td>
                      {room.cells.map(cell => (
                        <td
                          key={`${room.roomNo}-${cell.date}`}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => moveBooking(room, cell.date)}
                          style={{ width: cellWidth, minWidth: cellWidth, height: 42, background: statusStyle[cell.status]?.bg || '#fff', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', padding: 5 }}
                        >
                          {renderCellContent(room, cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {tooltip && (tooltip.cell.bookingId || tooltip.cell.blockType) && (
        <div style={{ position: 'fixed', top: tooltip.y + 14, left: tooltip.x + 14, zIndex: 2000, width: 280, background: '#0f172a', color: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 14px 32px rgba(15,23,42,.25)', fontSize: 12, pointerEvents: 'none' }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{tooltip.room.roomNo} · {tooltip.cell.bookingCode || tooltip.cell.blockType}</div>
          <div>Khách: {tooltip.cell.guestName || '-'}</div>
          <div>SĐT: {tooltip.cell.guestPhone || '-'}</div>
          <div>Check-in: {tooltip.cell.checkIn ? new Date(tooltip.cell.checkIn).toLocaleString('vi-VN') : '-'}</div>
          <div>Check-out: {tooltip.cell.checkOut ? new Date(tooltip.cell.checkOut).toLocaleString('vi-VN') : '-'}</div>
          <div>Đã trả: {(tooltip.cell.paidAmount || 0).toLocaleString('vi-VN')} / {(tooltip.cell.totalAmount || 0).toLocaleString('vi-VN')}đ</div>
          {tooltip.cell.note && <div>Ghi chú: {tooltip.cell.note}</div>}
        </div>
      )}
    </div>
  );
};

export default RoomRackPage;
