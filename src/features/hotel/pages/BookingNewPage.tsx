import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, User, Phone, Mail, CreditCard, BedDouble, Plus, Minus, Calendar, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';

type Step = 'guest' | 'room' | 'service' | 'payment';

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: 'guest',   label: 'Thông tin khách', icon: '👤' },
  { key: 'room',    label: 'Chọn phòng',       icon: '🛏️' },
  { key: 'service', label: 'Dịch vụ',          icon: '🔧' },
  { key: 'payment', label: 'Thanh toán',        icon: '💳' },
];

const BOOKING_TYPES = [
  { value: 'FIT',    label: 'Cá nhân (FIT)' },
  { value: 'GIT',    label: 'Đoàn (GIT)' },
  { value: 'WALKIN', label: 'Walk-in' },
  { value: 'DORM',   label: 'Dorm (giường)' },
];

const PAYMENT_METHODS = ['CASH', 'TRANSFER', 'CARD', 'DEBT'];
const PAYMENT_LABELS: Record<string, string> = { CASH: 'Tiền mặt', TRANSFER: 'Chuyển khoản', CARD: 'Thẻ', DEBT: 'Công nợ' };

export const BookingNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetRoom = searchParams.get('room') || '';

  const [step, setStep] = useState<Step>('guest');
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [form, setForm] = useState({
    guestName: '', guestPhone: '', guestEmail: '', idCard: '', nationality: 'VN',
    bookingType: 'FIT',
    checkIn: new Date().toISOString().slice(0, 16),
    checkOut: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    rooms: presetRoom ? [{ roomNo: presetRoom, bedCode: '', pricePerNight: 0 }] : [] as any[],
    services: [] as any[],
    paidAmount: 0,
    paymentMethod: 'CASH',
    source: 'DIRECT',
    notes: '',
    groupName: '',
    totalPerson: 1,
  });

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  useEffect(() => {
    if (step === 'room') fetchRooms();
    if (step === 'service') fetchServices();
  }, [step]);

  const fetchRooms = async () => {
    try {
      const rooms = await hotelService.getRooms();
      setAvailableRooms(rooms.filter((r: any) => r.status === 'VACANT' || !r.status));
    } catch { toast.error('Lỗi tải danh sách phòng'); }
  };

  const fetchServices = async () => {
    try { setServices(await hotelService.getServices()); }
    catch { toast.error('Lỗi tải dịch vụ'); }
  };

  const calcNights = () => {
    const diff = new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime();
    return Math.max(1, Math.ceil(diff / 86400000));
  };

  const calcTotal = () => {
    const nights = calcNights();
    const roomTotal = form.rooms.reduce((s, r) => s + (r.pricePerNight || 0) * nights, 0);
    const svcTotal = form.services.reduce((s, sv) => s + (sv.unitPrice || 0) * (sv.quantity || 1), 0);
    return roomTotal + svcTotal;
  };

  const toggleRoom = (room: any) => {
    const exists = form.rooms.find(r => r.roomNo === room.so);
    if (exists) {
      setForm(f => ({ ...f, rooms: f.rooms.filter(r => r.roomNo !== room.so) }));
    } else {
      setForm(f => ({ ...f, rooms: [...f.rooms, { roomNo: room.so, bedCode: '', pricePerNight: room.basePrice || 200000 }] }));
    }
  };

  const toggleService = (svc: any) => {
    const exists = form.services.find(s => s.serviceCode === svc.serviceCode);
    if (exists) {
      setForm(f => ({ ...f, services: f.services.filter(s => s.serviceCode !== svc.serviceCode) }));
    } else {
      setForm(f => ({ ...f, services: [...f.services, { serviceCode: svc.serviceCode, serviceName: svc.serviceName, unitPrice: svc.price || 0, quantity: 1 }] }));
    }
  };

  const handleSubmit = async () => {
    if (!form.guestName) return toast.error('Vui lòng nhập tên khách');
    if (form.rooms.length === 0) return toast.error('Vui lòng chọn ít nhất 1 phòng');
    setLoading(true);
    try {
      const booking = await hotelService.createBooking({
        ...form,
        totalAmount: calcTotal(),
        nightCount: calcNights(),
      } as any);
      toast.success(`Đặt phòng thành công! Mã: ${booking.bookingCode}`);
      navigate(`/hotel/bookings/${booking.id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Lỗi tạo booking');
    } finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 'guest') return !!form.guestName && !!form.guestPhone;
    if (step === 'room') return form.rooms.length > 0;
    return true;
  };

  const goNext = () => {
    const idx = STEPS.findIndex(s => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };
  const goPrev = () => {
    const idx = STEPS.findIndex(s => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  const nights = calcNights();
  const total = calcTotal();

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>📋 Tạo Đặt Phòng Mới</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Quy trình 4 bước nhanh chóng</p>
        </div>
        <button className={styles.btnSecondary} onClick={() => navigate('/hotel/bookings')}>
          <X size={15} /> Hủy
        </button>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, background: '#f8fafc', borderRadius: 12, padding: 4 }}>
        {STEPS.map((s, i) => (
          <button key={s.key}
            style={{
              flex: 1, padding: '12px 8px', border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'all .2s',
              background: step === s.key ? '#1e6fff' : 'transparent',
              color: step === s.key ? '#fff' : i < currentStepIndex ? '#16a34a' : '#94a3b8',
              fontWeight: step === s.key ? 700 : 500, fontSize: 13,
            }}
            onClick={() => i <= currentStepIndex && setStep(s.key)}>
            {s.icon} {s.label}
            {i < currentStepIndex && <span style={{ marginLeft: 6 }}>✓</span>}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          {/* Bước 1: Thông tin khách */}
          {step === 'guest' && (
            <div className={styles.card}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>👤 Thông Tin Khách</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Loại đặt phòng</label>
                  <select value={form.bookingType} onChange={e => setForm(f => ({ ...f, bookingType: e.target.value }))}>
                    {BOOKING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {form.bookingType === 'GIT' && (
                  <div className={styles.formGroup}>
                    <label>Tên đoàn</label>
                    <input value={form.groupName} onChange={e => setForm(f => ({ ...f, groupName: e.target.value }))} placeholder="Đoàn ABC" />
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label><User size={13} style={{ marginRight: 4 }} />Họ tên khách *</label>
                  <input value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} placeholder="Nguyễn Văn A" />
                </div>
                <div className={styles.formGroup}>
                  <label><Phone size={13} style={{ marginRight: 4 }} />Số điện thoại *</label>
                  <input value={form.guestPhone} onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))} placeholder="0912345678" />
                </div>
                <div className={styles.formGroup}>
                  <label><Mail size={13} style={{ marginRight: 4 }} />Email</label>
                  <input type="email" value={form.guestEmail} onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))} placeholder="email@example.com" />
                </div>
                <div className={styles.formGroup}>
                  <label><CreditCard size={13} style={{ marginRight: 4 }} />CCCD/Hộ chiếu</label>
                  <input value={form.idCard} onChange={e => setForm(f => ({ ...f, idCard: e.target.value }))} placeholder="012345678901" />
                </div>
                <div className={styles.formGroup}>
                  <label>🌏 Quốc tịch</label>
                  <select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}>
                    <option value="VN">🇻🇳 Việt Nam</option>
                    <option value="EN">🇬🇧 Anh</option>
                    <option value="FR">🇫🇷 Pháp</option>
                    <option value="DE">🇩🇪 Đức</option>
                    <option value="US">🇺🇸 Mỹ</option>
                    <option value="JP">🇯🇵 Nhật</option>
                    <option value="KR">🇰🇷 Hàn</option>
                    <option value="CN">🇨🇳 Trung Quốc</option>
                    <option value="OTHER">🌐 Khác</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>👥 Số người</label>
                  <input type="number" min={1} value={form.totalPerson} onChange={e => setForm(f => ({ ...f, totalPerson: Number(e.target.value) }))} />
                </div>
                <div className={styles.formGroup}>
                  <label><Calendar size={13} style={{ marginRight: 4 }} />Check-in</label>
                  <input type="datetime-local" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label><Calendar size={13} style={{ marginRight: 4 }} />Check-out</label>
                  <input type="datetime-local" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>📡 Nguồn đặt</label>
                  <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                    {['DIRECT','BOOKING_COM','AGODA','AIRBNB','PHONE','WALK_IN'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}>
                  <label>📝 Ghi chú</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Yêu cầu đặc biệt..." />
                </div>
              </div>
            </div>
          )}

          {/* Bước 2: Chọn phòng */}
          {step === 'room' && (
            <div className={styles.card}>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🛏️ Chọn Phòng</h3>
              <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 13 }}>
                {nights} đêm · {new Date(form.checkIn).toLocaleDateString('vi-VN')} → {new Date(form.checkOut).toLocaleDateString('vi-VN')}
              </p>
              {availableRooms.length === 0 ? (
                <div className={styles.emptyState}><div className={styles.emptyIcon}>🛏️</div><p>Không có phòng trống trong thời gian này</p></div>
              ) : (
                <div className={styles.roomGrid}>
                  {availableRooms.map(r => {
                    const selected = form.rooms.some(sel => sel.roomNo === r.so);
                    return (
                      <div key={r.id}
                        className={`${styles.roomCard} ${selected ? styles.selected : styles.vacant}`}
                        onClick={() => toggleRoom(r)}
                        style={{ cursor: 'pointer', border: selected ? '2px solid #1e6fff' : undefined }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className={styles.roomCardNo}>{r.so}</div>
                          {selected && <span style={{ color: '#1e6fff', fontWeight: 700 }}>✓ Đã chọn</span>}
                        </div>
                        <div className={styles.roomCardType}>{r.roomTypeName || r.ma}</div>
                        <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Tầng {r.floor} · {r.maxPerson} người</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#1e6fff', marginTop: 8 }}>
                          {(r.basePrice || 0).toLocaleString('vi-VN')}đ/đêm
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bước 3: Dịch vụ */}
          {step === 'service' && (
            <div className={styles.card}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>🔧 Dịch Vụ Kèm</h3>
              {services.length === 0 ? (
                <div className={styles.emptyState}><div className={styles.emptyIcon}>🔧</div><p>Không có dịch vụ</p></div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {services.map(svc => {
                    const sel = form.services.find(s => s.serviceCode === svc.serviceCode);
                    return (
                      <div key={svc.serviceCode}
                        style={{
                          padding: '14px 16px', border: `1.5px solid ${sel ? '#1e6fff' : '#e2e8f0'}`,
                          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16,
                          background: sel ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all .15s',
                        }}
                        onClick={() => toggleService(svc)}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{svc.serviceName}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{svc.category} · {(svc.price || 0).toLocaleString('vi-VN')}đ/{svc.unit || 'lần'}</div>
                        </div>
                        {sel ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className={styles.btnIcon} onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, services: f.services.map(s => s.serviceCode === svc.serviceCode ? { ...s, quantity: Math.max(1, s.quantity - 1) } : s) })); }}>
                              <Minus size={14} />
                            </button>
                            <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{sel.quantity}</span>
                            <button className={styles.btnIcon} onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, services: f.services.map(s => s.serviceCode === svc.serviceCode ? { ...s, quantity: s.quantity + 1 } : s) })); }}>
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>+ Thêm</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bước 4: Thanh toán */}
          {step === 'payment' && (
            <div className={styles.card}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>💳 Thanh Toán</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Phương thức thanh toán</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {PAYMENT_METHODS.map(m => (
                      <button key={m}
                        style={{
                          padding: '10px 20px', border: `2px solid ${form.paymentMethod === m ? '#1e6fff' : '#e2e8f0'}`,
                          borderRadius: 8, background: form.paymentMethod === m ? '#eff6ff' : '#fff',
                          color: form.paymentMethod === m ? '#1e6fff' : '#475569', fontWeight: form.paymentMethod === m ? 700 : 500, cursor: 'pointer',
                        }}
                        onClick={() => setForm(f => ({ ...f, paymentMethod: m }))}>
                        {PAYMENT_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Đã thanh toán (đ)</label>
                  <input type="number" value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tóm tắt */}
        <div>
          <div className={styles.card} style={{ position: 'sticky', top: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📄 Tóm Tắt Booking</h3>

            {form.guestName && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Khách</span>
                <span className={styles.infoValue}>{form.guestName}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Loại</span>
              <span className={styles.infoValue}>{BOOKING_TYPES.find(t => t.value === form.bookingType)?.label}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Check-in</span>
              <span className={styles.infoValue}>{new Date(form.checkIn).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Check-out</span>
              <span className={styles.infoValue}>{new Date(form.checkOut).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Số đêm</span>
              <span className={styles.infoValue} style={{ fontWeight: 700 }}>{nights} đêm</span>
            </div>

            {form.rooms.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', margin: '12px 0 6px', textTransform: 'uppercase' }}>Phòng đã chọn</div>
                {form.rooms.map(r => (
                  <div key={r.roomNo} className={styles.infoRow}>
                    <span className={styles.infoLabel}>🛏️ {r.roomNo}</span>
                    <span className={styles.infoValue}>{((r.pricePerNight || 0) * nights).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </>
            )}

            {form.services.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', margin: '12px 0 6px', textTransform: 'uppercase' }}>Dịch vụ</div>
                {form.services.map(s => (
                  <div key={s.serviceCode} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{s.serviceName} ×{s.quantity}</span>
                    <span className={styles.infoValue}>{((s.unitPrice || 0) * s.quantity).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </>
            )}

            <div style={{ borderTop: '2px solid #e2e8f0', marginTop: 16, paddingTop: 16 }}>
              <div className={styles.infoRow}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng cộng</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: '#1e6fff' }}>{total.toLocaleString('vi-VN')}đ</span>
              </div>
              {form.paidAmount > 0 && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Đã trả</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>{form.paidAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              {total - form.paidAmount > 0 && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Còn lại</span>
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>{(total - form.paidAmount).toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button className={styles.btnSecondary} onClick={goPrev} disabled={currentStepIndex === 0}>
          ← Quay lại
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          {currentStepIndex < STEPS.length - 1 ? (
            <button className={styles.btnPrimary} onClick={goNext} disabled={!canNext()}>
              Tiếp theo <ChevronRight size={15} />
            </button>
          ) : (
            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading || form.rooms.length === 0}>
              {loading ? '⏳ Đang lưu...' : '✅ Xác nhận đặt phòng'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingNewPage;
