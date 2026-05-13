import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, LogOut, X, Printer } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { BookingDto } from '../services/hotel.service';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  CONFIRMED:   { label: 'Xác nhận',    cls: 'confirmed' },
  CHECKED_IN:  { label: 'Đang ở',      cls: 'checkedIn' },
  CHECKED_OUT: { label: 'Đã check-out',cls: 'checkedOut' },
  CANCELLED:   { label: 'Đã hủy',      cls: 'cancelled' },
  PENDING:     { label: 'Chờ',         cls: 'pending' },
};

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('CASH');

  const [servicesList, setServicesList] = useState<any[]>([]);
  const [addingService, setAddingService] = useState(false);
  const [selectedSvc, setSelectedSvc] = useState<any>(null);
  const [svcQuantity, setSvcQuantity] = useState(1);

  useEffect(() => { 
    fetchBooking(); 
    hotelService.getServiceCatalog().then(setServicesList);
  }, [id]);

  const fetchBooking = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await hotelService.getBookingById(Number(id));
      setBooking(b);
      setPayAmount(b.totalAmount - b.paidAmount);
    } catch { toast.error('Không tìm thấy booking'); navigate('/hotel/bookings'); }
    finally { setLoading(false); }
  };

  const handleStatus = async (status: string) => {
    if (!booking) return;
    if (status === 'CHECKED_OUT') {
      if (booking.paidAmount < booking.totalAmount) {
         toast.error('Vui lòng thanh toán đủ trước khi Check-out!');
         return;
      }
      if (!window.confirm(`Xác nhận Check-out? Vui lòng kiểm tra kỹ Minibar và Dịch vụ phát sinh.\nTổng tiền: ${booking.totalAmount.toLocaleString('vi-VN')}đ\nĐã thu: ${booking.paidAmount.toLocaleString('vi-VN')}đ`)) {
         return;
      }
    }
    try {
      await hotelService.updateBookingStatus(booking.id, status, undefined);
      
      // Auto update room/bed status
      if (status === 'CHECKED_IN') {
        for (const r of (booking.rooms || [])) {
          if (r.bedCode) await hotelService.updateBedStatus(r.roomNo, r.bedCode, 'OC');
          else await hotelService.updateRoomStatus(r.roomNo, 'OC');
        }
      } else if (status === 'CHECKED_OUT') {
        for (const r of (booking.rooms || [])) {
          if (r.bedCode) await hotelService.updateBedStatus(r.roomNo, r.bedCode, 'VD');
          else await hotelService.updateRoomStatus(r.roomNo, 'VD');
        }
      }

      toast.success(`→ ${STATUS_MAP[status]?.label}`);
      fetchBooking();
    } catch { toast.error('Lỗi cập nhật'); }
  };

  const handlePay = async () => {
    if (!booking) return;
    if (payAmount <= 0) return toast.error('Số tiền phải > 0');
    try {
      await hotelService.updateBookingStatus(booking.id, booking.status, booking.paidAmount + payAmount);
      toast.success(`Đã ghi nhận ${payAmount.toLocaleString('vi-VN')}đ`);
      setPaying(false); fetchBooking();
    } catch { toast.error('Lỗi thanh toán'); }
  };

  const handlePostService = async () => {
    if (!booking || !selectedSvc) return;
    try {
      await hotelService.addServiceToBooking(booking.id, {
        serviceCode: selectedSvc.serviceCode,
        serviceName: selectedSvc.serviceName,
        category: selectedSvc.category,
        quantity: svcQuantity,
        unitPrice: selectedSvc.unitPrice,
      });
      toast.success('Đã thêm dịch vụ/phụ phí');
      setAddingService(false);
      setSelectedSvc(null);
      setSvcQuantity(1);
      fetchBooking();
    } catch { toast.error('Lỗi thêm dịch vụ'); }
  };

  const handleDeleteService = async (serviceCode: string) => {
    if (!booking || !window.confirm('Xóa dịch vụ này?')) return;
    try {
      await hotelService.deleteBookingService(booking.id, serviceCode);
      toast.success('Đã xóa dịch vụ');
      fetchBooking();
    } catch { toast.error('Lỗi xóa dịch vụ'); }
  };

  const handleInvoice = () => {
    if (!booking) return;
    navigate(`/hotel/bookings/${booking.id}/invoice`);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>Đang tải...</div>;
  if (!booking) return null;

  const st = STATUS_MAP[booking.status] || { label: booking.status, cls: 'pending' };
  const nights = Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000));
  const remaining = booking.totalAmount - booking.paidAmount;
  const paidPct = booking.totalAmount > 0 ? Math.min(100, Math.round(booking.paidAmount / booking.totalAmount * 100)) : 0;

  return (
    <div className={styles.hotelContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className={styles.btnIcon} onClick={() => navigate('/hotel/bookings')}><ArrowLeft size={20} /></button>
          <div>
            <h1 style={{ fontSize: 20 }}>
              Booking <span style={{ color: '#1e6fff', fontFamily: 'monospace' }}>{booking.bookingCode}</span>
            </h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <span className={`${styles.badge} ${styles[st.cls]}`}>{st.label}</span>
              <span style={{ fontSize: 13, color: '#64748b' }}>· {booking.bookingType}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={handleInvoice}><Printer size={15} /> In hóa đơn</button>
          {booking.status === 'CONFIRMED' && (
            <button className={styles.btnPrimary} style={{ background: '#16a34a' }} onClick={() => handleStatus('CHECKED_IN')}>
              <LogIn size={15} /> Check-in
            </button>
          )}
          {booking.status === 'CHECKED_IN' && (
            <button className={styles.btnPrimary} style={{ background: '#dc2626' }} onClick={() => handleStatus('CHECKED_OUT')}>
              <LogOut size={15} /> Check-out
            </button>
          )}
          {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
            <button className={styles.btnDanger} onClick={() => handleStatus('CANCELLED')}>
              <X size={15} /> Hủy booking
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Thông tin chính */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Thông tin khách */}
          <div className={styles.card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>👤 Thông Tin Khách</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Họ tên', booking.guestName],
                ['SĐT', booking.guestPhone],
                ['Quốc tịch', booking.nationality],
                ['Nguồn', booking.source || 'Direct'],
              ].map(([l, v]) => (
                <div key={l} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{l}</span>
                  <span className={styles.infoValue}>{v || '—'}</span>
                </div>
              ))}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>CCCD/HC</span>
                <span className={styles.infoValue}>{(booking as any).idCard || (booking as any).guestIdCard || '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{booking.guestEmail || (booking as any).email || '—'}</span>
              </div>
            </div>
          </div>

          {/* Phòng */}
          <div className={styles.card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>🛏️ Phòng & Giường ({nights} đêm)</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              {booking.rooms?.map(r => (
                <div key={r.roomNo} style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 16 }}>{r.roomNo}{r.bedCode ? `·${r.bedCode}` : ''}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{r.roomTypeName}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e6fff', marginTop: 6 }}>
                    {(r.pricePerNight || 0).toLocaleString('vi-VN')}đ/đêm
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    × {nights} đêm = {((r.pricePerNight || 0) * nights).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
              <span>📅 Check-in: <strong>{new Date(booking.checkIn).toLocaleString('vi-VN')}</strong></span>
              <span>📅 Check-out: <strong>{new Date(booking.checkOut).toLocaleString('vi-VN')}</strong></span>
            </div>
          </div>

          {/* Dịch vụ */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>🔧 Dịch Vụ / Minibar</h3>
              {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN') && !addingService && (
                <button className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setAddingService(true)}>
                  + Thêm dịch vụ
                </button>
              )}
            </div>

            {addingService && (
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <div className={styles.formGroup} style={{ flex: 2, marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>Chọn dịch vụ</label>
                    <select value={selectedSvc?.serviceCode || ''} onChange={e => {
                      const svc = servicesList.find(s => s.serviceCode === e.target.value);
                      setSelectedSvc(svc);
                    }}>
                      <option value="">-- Chọn --</option>
                      {servicesList.map(s => (
                        <option key={s.serviceCode} value={s.serviceCode}>
                          {s.serviceName} ({(s.unitPrice || 0).toLocaleString('vi-VN')}đ)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ width: 80, marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>SL</label>
                    <input type="number" min="1" value={svcQuantity} onChange={e => setSvcQuantity(Number(e.target.value))} />
                  </div>
                  <button className={styles.btnPrimary} style={{ padding: '8px 16px', height: 38 }} onClick={handlePostService}>Thêm</button>
                  <button className={styles.btnSecondary} style={{ padding: '8px 12px', height: 38 }} onClick={() => setAddingService(false)}>Hủy</button>
                </div>
              </div>
            )}

            {booking.services?.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr><th>Dịch vụ</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th><th></th></tr>
                  </thead>
                  <tbody>
                    {booking.services.map((s, idx) => (
                      <tr key={`${s.serviceCode}-${idx}`}>
                        <td>{s.serviceName || s.serviceCode}</td>
                        <td>{(s.unitPrice || 0).toLocaleString('vi-VN')}đ</td>
                        <td style={{ textAlign: 'center' }}>{s.quantity}</td>
                        <td style={{ fontWeight: 700 }}>{(s.totalPrice || 0).toLocaleString('vi-VN')}đ</td>
                        <td style={{ width: 40 }}>
                           <button 
                            className={styles.btnIcon} 
                            style={{ color: '#dc2626' }} 
                            onClick={() => handleDeleteService(s.serviceCode)}
                           >
                            <X size={14} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 12 }}>Chưa có dịch vụ nào</div>
            )}
          </div>

          {/* Ghi chú */}
          {booking.notes && (
            <div className={styles.card}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>📝 Ghi Chú</h3>
              <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Cột phải — Thanh toán */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Tổng tiền */}
          <div className={styles.card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>💰 Thanh Toán</h3>
            {[
              ['Tiền phòng', `${(booking.rooms?.reduce((s, r) => s + (r.pricePerNight || 0) * nights, 0) || 0).toLocaleString('vi-VN')}đ`],
              ['Dịch vụ', `${(booking.services?.reduce((s, sv) => s + (sv.totalPrice || 0), 0) || 0).toLocaleString('vi-VN')}đ`],
            ].map(([l, v]) => (
              <div key={l} className={styles.infoRow}>
                <span className={styles.infoLabel}>{l}</span>
                <span className={styles.infoValue}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid #e2e8f0', margin: '12px 0', paddingTop: 12 }}>
              <div className={styles.infoRow}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng cộng</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: '#1e6fff' }}>{booking.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Đã trả ({paidPct}%)</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>{booking.paidAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className={styles.progressBar} style={{ height: 8 }}>
                <div className={styles.fill} style={{ width: `${paidPct}%`, background: '#22c55e' }} />
              </div>
            </div>

            {remaining > 0 && (
              <div className={styles.infoRow} style={{ marginTop: 8 }}>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>Còn lại</span>
                <span style={{ color: '#dc2626', fontWeight: 800, fontSize: 16 }}>{remaining.toLocaleString('vi-VN')}đ</span>
              </div>
            )}

            {paying ? (
              <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 10 }}>
                <div className={styles.formGroup} style={{ marginBottom: 10 }}>
                  <label>Số tiền thu</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 12 }}>
                  <label>Phương thức</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                    <option value="CASH">Tiền mặt</option>
                    <option value="TRANSFER">Chuyển khoản</option>
                    <option value="CARD">Thẻ</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.btnSecondary} style={{ flex: 1 }} onClick={() => setPaying(false)}>Hủy</button>
                  <button className={styles.btnPrimary} style={{ flex: 1 }} onClick={handlePay}>✅ Xác nhận thu</button>
                </div>
              </div>
            ) : remaining > 0 && booking.status !== 'CANCELLED' && (
              <button className={styles.btnPrimary} style={{ width: '100%', marginTop: 16 }} onClick={() => setPaying(true)}>
                💰 Thu tiền
              </button>
            )}
          </div>

          {/* Timeline */}
          <div className={styles.card}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>📅 Lịch sử</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Tạo booking', time: booking.createdAt, icon: '📝' },
                { label: 'Xác nhận', time: booking.status !== 'PENDING' ? booking.updatedAt : null, icon: '✅' },
                { label: 'Check-in (Thực tế)', time: booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT' ? booking.checkIn : null, icon: '🏨' },
                { label: 'Check-out (Dự kiến)', time: booking.checkOut, icon: '⏳' },
                { label: 'Check-out (Thực tế)', time: booking.status === 'CHECKED_OUT' ? booking.updatedAt : null, icon: '🚪' },
              ].filter(t => t.time).map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{t.label}</div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>{t.time ? new Date(t.time).toLocaleString('vi-VN') : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
