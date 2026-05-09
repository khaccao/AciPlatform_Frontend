import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Download, Eye, LogIn, LogOut, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService, { BookingDto } from '../services/hotel.service';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: 'Xác nhận', cls: 'confirmed' },
  CHECKED_IN: { label: 'Đang ở', cls: 'checkedIn' },
  CHECKED_OUT: { label: 'Đã check-out', cls: 'checkedOut' },
  CANCELLED: { label: 'Đã hủy', cls: 'cancelled' },
  PENDING: { label: 'Chờ', cls: 'pending' },
};
const TYPE_MAP: Record<string, string> = { FIT: 'Cá nhân', GIT: 'Đoàn', WALKIN: 'Walk-in', DORM: 'Dorm' };

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortCol, setSortCol] = useState<string>('checkIn');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  useEffect(() => { fetchBookings(); }, [statusFilter, typeFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { pageSize: '100' };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.bookingType = typeFilter;
      const { items, total: t } = await hotelService.getBookings(params);
      setBookings(items);
      setTotal(t || items.length);
    } catch { toast.error('Lỗi tải danh sách đặt phòng'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (b: BookingDto, newStatus: string) => {
    try {
      await hotelService.updateBookingStatus(b.id, newStatus);
      toast.success(`Cập nhật → ${STATUS_MAP[newStatus]?.label}`);
      fetchBookings();
    } catch { toast.error('Lỗi cập nhật trạng thái'); }
  };

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const filtered = bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.guestName?.toLowerCase().includes(q) || b.guestPhone?.includes(q) || b.bookingCode?.toLowerCase().includes(q);
  }).sort((a, b) => {
    const av = (a as any)[sortCol]; const bv = (b as any)[sortCol];
    const cmp = String(av || '').localeCompare(String(bv || ''));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const fmtMoney = (n: number) => n?.toLocaleString('vi-VN') + 'đ';
  const fmtDt = (dt: string) => new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const isToday = (dt: string) => new Date(dt).toDateString() === new Date().toDateString();
  const isOverdue = (dt: string) => new Date(dt) < new Date();

  const SortIcon = ({ col }: { col: string }) => sortCol === col ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>📅 Quản Lý Đặt Phòng</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>{total} booking tổng cộng</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary}><Download size={15} /> Export</button>
          <button className={styles.btnPrimary} onClick={() => navigate('/hotel/bookings/new')}><Plus size={15} /> Tạo booking</button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search size={16} color="#94a3b8" />
          <input placeholder="Tìm tên khách, SĐT, mã booking..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className={styles.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Tất cả loại</option>
          {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className={styles.btnSecondary} onClick={fetchBookings}><Filter size={15} /> Lọc</button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('bookingCode')}>Mã BK <SortIcon col="bookingCode" /></th>
              <th onClick={() => handleSort('guestName')}>Khách <SortIcon col="guestName" /></th>
              <th>Phòng/Giường</th>
              <th onClick={() => handleSort('checkIn')}>Check-in <SortIcon col="checkIn" /></th>
              <th onClick={() => handleSort('checkOut')}>Check-out <SortIcon col="checkOut" /></th>
              <th>Đêm</th>
              <th onClick={() => handleSort('totalAmount')}>Tổng tiền <SortIcon col="totalAmount" /></th>
              <th>Thanh toán</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Nguồn</th>
              <th style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={12} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không có dữ liệu</td></tr>
            ) : filtered.map(b => {
              const st = STATUS_MAP[b.status] || { label: b.status, cls: 'pending' };
              const paidPct = b.totalAmount > 0 ? Math.min(100, Math.round(b.paidAmount / b.totalAmount * 100)) : 0;
              const isExpanded = expandedId === b.id;
              return (
                <React.Fragment key={b.id}>
                  <tr onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563eb', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); navigate(`/hotel/bookings/${b.id}`); }}>{b.bookingCode}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.guestName}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{b.guestPhone}</div>
                    </td>
                    <td>{b.rooms?.map(r => <span key={r.roomNo} className={`${styles.badge} ${styles.checkout}`} style={{ marginRight: 4 }}>{r.roomNo}{r.bedCode ? `/${r.bedCode}` : ''}</span>)}</td>
                    <td style={{ color: isToday(b.checkIn) ? '#16a34a' : '#334155', fontWeight: isToday(b.checkIn) ? 700 : 500 }}>{fmtDt(b.checkIn)}</td>
                    <td style={{ color: isOverdue(b.checkOut) && b.status === 'CHECKED_IN' ? '#dc2626' : isToday(b.checkOut) ? '#2563eb' : '#334155', fontWeight: isToday(b.checkOut) ? 700 : 500 }}>{fmtDt(b.checkOut)}</td>
                    <td style={{ textAlign: 'center' }}>{b.nightCount}</td>
                    <td style={{ fontWeight: 700, color: b.paidAmount < b.totalAmount ? '#dc2626' : '#1e293b' }}>{fmtMoney(b.totalAmount)}</td>
                    <td style={{ minWidth: 100 }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>{fmtMoney(b.paidAmount)} ({paidPct}%)</div>
                      <div className={styles.progressBar}><div className={`${styles.fill}`} style={{ width: `${paidPct}%` }} /></div>
                    </td>
                    <td><span className={`${styles.badge} ${styles.checkout}`}>{TYPE_MAP[b.bookingType] || b.bookingType}</span></td>
                    <td><span className={`${styles.badge} ${styles[st.cls]}`}>{st.label}</span></td>
                    <td style={{ fontSize: 12, color: '#94a3b8' }}>{b.source || 'Direct'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        <button className={styles.btnIcon} title="Xem chi tiết" onClick={() => navigate(`/hotel/bookings/${b.id}`)}><Eye size={15} /></button>
                        {b.status === 'CONFIRMED' && <button className={styles.btnIcon} title="Check-in" style={{ color: '#16a34a' }} onClick={() => handleStatusChange(b, 'CHECKED_IN')}><LogIn size={15} /></button>}
                        {b.status === 'CHECKED_IN' && <button className={styles.btnIcon} title="Check-out" style={{ color: '#dc2626' }} onClick={() => handleStatusChange(b, 'CHECKED_OUT')}><LogOut size={15} /></button>}
                        {(b.status === 'CONFIRMED' || b.status === 'PENDING') && <button className={styles.btnIcon} title="Hủy" style={{ color: '#dc2626' }} onClick={() => handleStatusChange(b, 'CANCELLED')}><X size={15} /></button>}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={12}>
                        <div style={{ padding: '12px 16px', display: 'flex', gap: 32 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>PHÒNG & GIƯỜNG</div>
                            {b.rooms?.map(r => (
                              <div key={r.roomNo} style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>
                                🚪 {r.roomNo}{r.bedCode ? ` / Giường ${r.bedCode}` : ''} — {r.pricePerNight?.toLocaleString()}đ/đêm
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>DỊCH VỤ KÈM</div>
                            {b.services?.length > 0 ? b.services.map(s => (
                              <div key={s.serviceCode} style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>
                                🔧 {s.serviceName || s.serviceCode} × {s.quantity} — {s.totalPrice?.toLocaleString()}đ
                              </div>
                            )) : <div style={{ fontSize: 13, color: '#94a3b8' }}>Không có dịch vụ kèm</div>}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>GHI CHÚ</div>
                            <div style={{ fontSize: 13, color: '#334155' }}>{b.notes || '—'}</div>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <button className={styles.btnPrimary} onClick={() => navigate(`/hotel/bookings/${b.id}`)}>Xem đầy đủ</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsPage;
