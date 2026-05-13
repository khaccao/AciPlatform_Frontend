import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Download, Eye, LogIn, LogOut, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { BookingDto } from '../services/hotel.types';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  CONFIRMED:   { label: 'Xác nhận',     cls: 'confirmed' },
  CHECKED_IN:  { label: 'Đang ở',       cls: 'checkedIn' },
  CHECKED_OUT: { label: 'Đã check-out', cls: 'checkedOut' },
  CANCELLED:   { label: 'Đã hủy',       cls: 'cancelled' },
  PENDING:     { label: 'Chờ',          cls: 'pending' },
};
const TYPE_MAP: Record<string, string> = {
  FIT: 'Cá nhân', GIT: 'Đoàn', WALKIN: 'Walk-in', DORM: 'Dorm',
};

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
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  
  // Pagination & Date Filter
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => { fetchBookings(); }, [statusFilter, typeFilter, page, fromDate, toDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { 
        page, 
        pageSize,
        sortCol,
        sortDir
      };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.bookingType = typeFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (search) params.search = search;

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

  const fmtMoney = (n: number) => (n || 0).toLocaleString('vi-VN') + 'đ';
  const fmtDt = (dt: string) => new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const isToday = (dt: string) => new Date(dt).toDateString() === new Date().toDateString();
  const isOverdue = (dt: string) => new Date(dt) < new Date();

  const SortIcon = ({ col }: { col: string }) =>
    sortCol === col ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>📅 Quản Lý Đặt Phòng</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>{total} booking tổng cộng</p>
        </div>
        <div className={styles.headerActions}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8, marginRight: 12 }}>
            <button 
              style={{ padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: viewMode === 'table' ? '#fff' : 'transparent', boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => setViewMode('table')}>Bảng</button>
            <button 
              style={{ padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: viewMode === 'cards' ? '#fff' : 'transparent', boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => setViewMode('cards')}>Thẻ</button>
          </div>
          <button className={styles.btnSecondary}><Download size={15} /> Export</button>
          <button className={styles.btnPrimary} onClick={() => navigate('/hotel/bookings/new')}><Plus size={15} /> Tạo booking</button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className={styles.searchBar} style={{ flexWrap: 'wrap' }}>
        <div className={styles.searchInput}>
          <Search size={16} color="#94a3b8" />
          <input placeholder="Tìm khách, SĐT, mã..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchBookings()} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '0 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Từ:</span>
          <input type="date" style={{ border: 'none', fontSize: 13, padding: '8px 0' }} value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} />
          <span style={{ fontSize: 12, color: '#64748b' }}>Đến:</span>
          <input type="date" style={{ border: 'none', fontSize: 13, padding: '8px 0' }} value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} />
        </div>

        <select className={styles.filterSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className={styles.filterSelect} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả loại</option>
          {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className={styles.btnPrimary} onClick={() => { setPage(1); fetchBookings(); }}><Filter size={15} /> Lọc</button>
      </div>

      {/* Bảng dữ liệu / Danh sách thẻ */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Đang tải dữ liệu...</div>
      ) : viewMode === 'table' ? (
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
              {filtered.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không có dữ liệu</td></tr>
              ) : filtered.map(b => {
                const st = STATUS_MAP[b.status] || { label: b.status, cls: 'pending' };
                const paidPct = b.totalAmount > 0 ? Math.min(100, Math.round(b.paidAmount / b.totalAmount * 100)) : 0;
                const isExpanded = expandedId === b.id;
                return (
                  <React.Fragment key={b.id}>
                    <tr onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563eb', cursor: 'pointer' }}
                          onClick={e => { e.stopPropagation(); navigate(`/hotel/bookings/${b.id}`); }}>
                          {b.bookingCode}
                        </span>
                      </td>
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
                        <div className={styles.progressBar}><div className={styles.fill} style={{ width: `${paidPct}%` }} /></div>
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
                    {isExpanded && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={12}>
                          <div style={{ padding: '12px 16px', display: 'flex', gap: 32 }}>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>PHÒNG & GIƯỜNG</div>
                              {b.rooms?.map(r => (
                                <div key={r.roomNo} style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>
                                  🪟 {r.roomNo}{r.bedCode ? ` / Giường ${r.bedCode}` : ''} — {r.pricePerNight?.toLocaleString()}đ/đêm
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
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#94a3b8' }}>Không tìm thấy đặt phòng nào</div>
          ) : filtered.map(b => {
            const st = STATUS_MAP[b.status] || { label: b.status, cls: 'pending' };
            return (
              <div key={b.id} className={styles.card} style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 16, transition: 'transform 0.2s', cursor: 'pointer' }}
                onClick={() => navigate(`/hotel/bookings/${b.id}`)}
                onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: '#2563eb', fontSize: 13 }}>#{b.bookingCode}</span>
                  <span className={`${styles.badge} ${styles[st.cls]}`} style={{ fontSize: 11 }}>{st.label}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{b.guestName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                  <span>📞 {b.guestPhone}</span>
                  <span>•</span>
                  <span>{TYPE_MAP[b.bookingType]}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Check-in</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtDt(b.checkIn)}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Check-out</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtDt(b.checkOut)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {b.rooms?.map(r => (
                      <span key={r.roomNo} style={{ fontSize: 12, padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: 6, fontWeight: 600 }}>
                        🛏️ {r.roomNo}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#1e6fff' }}>{fmtMoney(b.totalAmount)}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className={styles.btnIcon} style={{ background: '#f1f5f9' }}><Eye size={14} /></button>
                    {b.status === 'CONFIRMED' && <button className={styles.btnIcon} style={{ background: '#dcfce7', color: '#16a34a' }} onClick={e => { e.stopPropagation(); handleStatusChange(b, 'CHECKED_IN'); }}><LogIn size={14} /></button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phân trang */}
      {total > pageSize && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, paddingBottom: 32 }}>
          <button 
            className={styles.btnSecondary} 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            style={{ padding: '8px 16px' }}>
            Trước
          </button>
          
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: Math.ceil(total / pageSize) }).map((_, i) => {
              const p = i + 1;
              // Chỉ hiển thị vài trang xung quanh trang hiện tại nếu quá nhiều
              if (Math.abs(p - page) > 2 && p !== 1 && p !== Math.ceil(total / pageSize)) {
                if (Math.abs(p - page) === 3) return <span key={p}>...</span>;
                return null;
              }
              return (
                <button 
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: page === p ? '#1e6fff' : '#f1f5f9',
                    color: page === p ? '#fff' : '#475569',
                    fontWeight: 700, transition: 'all .2s'
                  }}>
                  {p}
                </button>
              );
            })}
          </div>

          <button 
            className={styles.btnSecondary} 
            disabled={page >= Math.ceil(total / pageSize)} 
            onClick={() => setPage(p => p + 1)}
            style={{ padding: '8px 16px' }}>
            Tiếp
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
