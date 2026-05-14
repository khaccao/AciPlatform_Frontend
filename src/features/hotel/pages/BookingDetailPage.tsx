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
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [addingService, setAddingService] = useState(false);
  const [selectedSvc, setSelectedSvc] = useState<any>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [svcQuantity, setSvcQuantity] = useState(1);

  useEffect(() => { 
    fetchBooking(); 
    hotelService.getServiceCatalog().then(setServicesList);
    hotelService.getVehicles('AVAILABLE').then(setVehicles);
    hotelService.getGuides(true).then(setGuides);
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
    
    let note = "";
    if (selectedSvc.category === 'VEHICLE' && selectedInventoryItem) {
      note = `Xe: ${selectedInventoryItem.vehicleCode} (${selectedInventoryItem.licensePlate})`;
    } else if (selectedSvc.category === 'TOUR' && selectedInventoryItem) {
      const gName = selectedInventoryItem.name || selectedInventoryItem.fullName || selectedInventoryItem.guideName || 'HDV';
      note = `HDV: ${gName}`;
    }

    try {
      await hotelService.addServiceToBooking(booking.id, {
        serviceCode: selectedSvc.serviceCode,
        serviceName: selectedSvc.serviceName + (note ? ` [${note}]` : ''),
        category: selectedSvc.category,
        quantity: svcQuantity,
        unitPrice: selectedSvc.unitPrice,
      });

      // If it's a vehicle, we might want to create a rental record too, 
      // but for now, the user just wants to "select from inventory" to ensure consistency.
      
      toast.success('Đã thêm dịch vụ/phụ phí');
      setAddingService(false);
      setSelectedSvc(null);
      setSelectedInventoryItem(null);
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

      <div className={styles.dashboardGrid}>
        {/* Thông tin chính */}
        <div className={styles.mainColumn}>

          {/* Thông tin khách */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>👤 Thông Tin Khách</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.guestInfoGrid}>
                {[
                  ['Họ tên', booking.guestName],
                  ['SĐT', booking.guestPhone],
                  ['Quốc tịch', booking.nationality],
                  ['Nguồn', booking.source || 'Direct'],
                  ['CCCD/HC', (booking as any).idCard || (booking as any).guestIdCard || '—'],
                  ['Email', booking.guestEmail || (booking as any).email || '—'],
                ].map(([l, v]) => (
                  <div key={l} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{l}</span>
                    <span className={styles.infoValue}>{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phòng */}
          <div className={styles.card}>
             <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>🛏️ Phòng & Giường ({nights} đêm)</h3>
             </div>
             <div className={styles.cardBody}>
                <div className={styles.bookingRoomList}>
                  {booking.rooms?.map(r => (
                    <div key={r.roomNo} className={styles.bookingRoomCard}>
                      <div className={styles.roomCardNo}>{r.roomNo}{r.bedCode ? `·${r.bedCode}` : ''}</div>
                      <div className={styles.roomCardType}>{r.roomTypeName}</div>
                      <div className={styles.roomCardPrice}>
                        {(r.pricePerNight || 0).toLocaleString('vi-VN')}đ/đêm
                      </div>
                      <div className={styles.roomCardTotal}>
                        × {nights} đêm = {((r.pricePerNight || 0) * nights).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.bookingDates}>
                  <span>📅 In: <strong>{new Date(booking.checkIn).toLocaleString('vi-VN')}</strong></span>
                  <span>📅 Out: <strong>{new Date(booking.checkOut).toLocaleString('vi-VN')}</strong></span>
                </div>
             </div>
          </div>

          {/* Dịch vụ */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>🔧 Dịch Vụ / Phụ Phí</h3>
              {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN') && !addingService && (
                <button className={styles.btnSecondary} onClick={() => setAddingService(true)}>
                  + Thêm
                </button>
              )}
            </div>

            <div className={styles.cardBody}>
              {addingService && (
                <div className={styles.quickAddService} style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label>Dịch vụ / Phụ phí</label>
                      <select value={selectedSvc?.serviceCode || ''} onChange={e => {
                        const svc = servicesList.find(s => s.serviceCode === e.target.value);
                        setSelectedSvc(svc);
                        setSelectedInventoryItem(null);
                      }}>
                        <option value="">-- Chọn dịch vụ --</option>
                        {servicesList.map(s => (
                          <option key={s.serviceCode} value={s.serviceCode}>
                            {s.serviceName} ({(s.unitPrice || 0).toLocaleString('vi-VN')}đ)
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedSvc?.category === 'VEHICLE' && (
                      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label>Chọn xe từ kho *</label>
                        <select value={selectedInventoryItem?.id || ''} onChange={e => {
                          const v = vehicles.find(x => x.id === Number(e.target.value));
                          setSelectedInventoryItem(v);
                        }}>
                          <option value="">-- Chọn xe sẵn sàng --</option>
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.vehicleCode} - {v.licensePlate} ({v.vehicleName})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedSvc?.category === 'TOUR' && (
                      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label>Chọn hướng dẫn viên *</label>
                        <select value={selectedInventoryItem?.id || ''} onChange={e => {
                          const g = guides.find(x => x.id === Number(e.target.value));
                          setSelectedInventoryItem(g);
                        }}>
                          <option value="">-- Chọn HDV --</option>
                          {guides.map(g => (
                            <option key={g.id} value={g.id}>
                              {g.name || g.fullName || g.guideName || 'HDV'} ({g.phone})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label>Đơn giá</label>
                      <input type="number" value={selectedSvc?.unitPrice || 0} readOnly style={{ background: '#f1f5f9' }} />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Số lượng</label>
                      <input type="number" min="1" value={svcQuantity} onChange={e => setSvcQuantity(Number(e.target.value))} />
                    </div>
                  </div>
                  
                  <div className={styles.quickAddActions} style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                    <button className={styles.btnSecondary} onClick={() => setAddingService(false)}>Hủy</button>
                    <button className={styles.btnPrimary} onClick={handlePostService} disabled={!selectedSvc || ((selectedSvc.category === 'VEHICLE' || selectedSvc.category === 'TOUR') && !selectedInventoryItem)}>
                      ✅ Thêm vào hóa đơn
                    </button>
                  </div>
                </div>
              )}

              {booking.services?.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr><th>Dịch vụ</th><th>Đơn giá</th><th>SL</th><th>Tổng</th><th></th></tr>
                    </thead>
                    <tbody>
                      {booking.services.map((s, idx) => (
                        <tr key={`${s.serviceCode}-${idx}`}>
                          <td>{s.serviceName || s.serviceCode}</td>
                          <td>{(s.unitPrice || 0).toLocaleString('vi-VN')}đ</td>
                          <td style={{ textAlign: 'center' }}>{s.quantity}</td>
                          <td style={{ fontWeight: 700 }}>{(s.totalPrice || 0).toLocaleString('vi-VN')}đ</td>
                          <td>
                             <button className={styles.btnIconDanger} onClick={() => handleDeleteService(s.serviceCode)}>
                              <X size={14} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptySmall}>Chưa có dịch vụ nào</div>
              )}
            </div>
          </div>

          {/* Ghi chú */}
          {booking.notes && (
            <div className={styles.card}>
              <div className={styles.cardHeader}><h3 className={styles.cardTitle}>📝 Ghi Chú</h3></div>
              <div className={styles.cardBody}>
                <p className={styles.notesText}>{booking.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Cột phải — Thanh toán */}
        <div className={styles.sideColumn}>
          {/* Tổng tiền */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>💰 Thanh Toán</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.paymentSummary}>
                {[
                  ['Tiền phòng', (booking.rooms?.reduce((s, r) => s + (r.pricePerNight || 0) * nights, 0) || 0)],
                  ['Dịch vụ', (booking.services?.reduce((s, sv) => s + (sv.totalPrice || 0), 0) || 0)],
                ].map(([l, v]) => (
                  <div key={l as string} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{l as string}</span>
                    <span className={styles.infoValue}>{(v as number).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
                
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Tổng cộng</span>
                  <span className={styles.totalValue}>{booking.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>

                <div className={styles.paidSection}>
                  <div className={styles.paidInfo}>
                    <span className={styles.paidLabel}>Đã trả ({paidPct}%)</span>
                    <span className={styles.paidValue}>{booking.paidAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.fill} style={{ width: `${paidPct}%`, background: '#22c55e' }} />
                  </div>
                </div>

                {remaining > 0 && (
                  <div className={styles.remainingRow}>
                    <span className={styles.remainingLabel}>Còn lại</span>
                    <span className={styles.remainingValue}>{remaining.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                {paying ? (
                  <div className={styles.payForm}>
                    <div className={styles.formGroup}>
                      <label>Số tiền thu</label>
                      <input type="number" value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phương thức</label>
                      <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                        <option value="CASH">Tiền mặt</option>
                        <option value="TRANSFER">Chuyển khoản</option>
                        <option value="CARD">Thẻ</option>
                      </select>
                    </div>
                    <div className={styles.payActions}>
                      <button className={styles.btnSecondary} onClick={() => setPaying(false)}>Hủy</button>
                      <button className={styles.btnPrimary} onClick={handlePay}>Xác nhận</button>
                    </div>
                  </div>
                ) : remaining > 0 && booking.status !== 'CANCELLED' && (
                  <button className={`${styles.btnPrimary} ${styles.w100} ${styles.mt16}`} onClick={() => setPaying(true)}>
                    💰 Thu tiền
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.card}>
            <div className={styles.cardHeader}><h3 className={styles.cardTitle}>📅 Lịch sử</h3></div>
            <div className={styles.cardBody}>
              <div className={styles.timeline}>
                {[
                  { label: 'Tạo booking', time: booking.createdAt, icon: '📝' },
                  { label: 'Xác nhận', time: booking.status !== 'PENDING' ? booking.updatedAt : null, icon: '✅' },
                  { label: 'Check-in', time: booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT' ? booking.checkIn : null, icon: '🏨' },
                  { label: 'Check-out', time: booking.status === 'CHECKED_OUT' ? booking.updatedAt : null, icon: '🚪' },
                ].filter(t => t.time).map(t => (
                  <div key={t.label} className={styles.timelineItem}>
                    <span className={styles.timelineIcon}>{t.icon}</span>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineLabel}>{t.label}</div>
                      <div className={styles.timelineTime}>{new Date(t.time!).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BookingDetailPage;
