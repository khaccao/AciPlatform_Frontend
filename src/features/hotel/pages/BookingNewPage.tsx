import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, User, Phone, Mail, CreditCard, Plus, Minus, Calendar, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';

type Step = 'guest' | 'room' | 'service' | 'payment';

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: 'guest', label: 'Thông tin khách', icon: '👤' },
  { key: 'room', label: 'Chọn phòng', icon: '🛏️' },
  { key: 'service', label: 'Dịch vụ', icon: '🔧' },
  { key: 'payment', label: 'Thanh toán', icon: '💳' },
];

const BOOKING_TYPES = [
  { value: 'FIT', label: 'Cá nhân (FIT)' },
  { value: 'GIT', label: 'Đoàn (GIT)' },
  { value: 'WALKIN', label: 'Walk-in' },
  { value: 'DORM', label: 'Dorm (giường)' },
];
const PAYMENT_METHODS = ['CASH', 'TRANSFER', 'CARD', 'DEBT'];
const PAYMENT_LABELS: Record<string, string> = { CASH: 'Tiền mặt', TRANSFER: 'Chuyển khoản', CARD: 'Thẻ', DEBT: 'Công nợ' };

export const BookingNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetRoom = searchParams.get('room') || '';
  const presetBed = searchParams.get('bed') || '';

  const [step, setStep] = useState<Step>('guest');
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);

  const [form, setForm] = useState({
    guestName: '', guestPhone: '', guestEmail: '', idCard: '', nationality: 'VN',
    bookingType: 'FIT',
    checkIn: new Date().toISOString().slice(0, 16),
    checkOut: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    rooms: presetRoom ? [{ roomNo: presetRoom, bedCode: presetBed, pricePerNight: 0 }] : [] as any[],
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
  }, [step, form.checkIn, form.checkOut]);

  const fetchRooms = async () => {
    try {
      const data = await hotelService.getRoomAvailability(form.checkIn, form.checkOut);
      setAvailableRooms(data);
      // Auto fill price for preset room
      if (presetRoom) {
        setForm(f => {
          const newRooms = f.rooms.map(r => {
            if (r.roomNo === presetRoom && !r.pricePerNight) {
              const matchedRoom = data.find((x: any) => (x.roomNo || x.so) === presetRoom);
              let price = matchedRoom?.pricePerNight || matchedRoom?.basePrice || 200000;
              if (presetBed && matchedRoom?.beds) {
                // Adjust bed price if needed, or default
                price = 100000;
              }
              return { ...r, pricePerNight: price };
            }
            return r;
          });
          return { ...f, rooms: newRooms };
        });
      }
    } catch { toast.error('Lỗi tải danh sách phòng'); }
  };

  const fetchServices = async () => {
    try { 
      const [svcs, v, g] = await Promise.all([
        hotelService.getServiceCatalog(),
        hotelService.getVehicles('AVAILABLE'),
        hotelService.getGuides(true)
      ]);
      setServices(svcs);
      setVehicles(v);
      setGuides(g);
    } catch { toast.error('Lỗi tải dữ liệu dịch vụ'); }
  };

  const calcNights = () => {
    const diff = new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime();
    return Math.max(1, Math.ceil(diff / 86400000));
  };

  const calcTotal = () => {
    const nights = calcNights();
    const roomTotal = form.rooms.reduce((s, r) => s + (Number(r.pricePerNight) || 0) * nights, 0);
    const svcTotal = form.services.reduce((s, sv) => s + (Number(sv.unitPrice) || 0) * (sv.quantity || 1), 0);
    return roomTotal + svcTotal;
  };

  const toggleRoom = (room: any) => {
    const roomNo = room.roomNo || room.so;
    const status = (room.status || 'VC').toUpperCase();
    if (status !== 'VC') {
      toast.warning(`Phòng ${roomNo} hiện đang ở trạng thái ${status}, không thể đặt phòng.`);
      return;
    }
    const exists = form.rooms.find(r => r.roomNo === roomNo && !r.bedCode);
    if (exists) {
      setForm(f => ({ ...f, rooms: f.rooms.filter(r => !(r.roomNo === roomNo && !r.bedCode)) }));
    } else {
      setForm(f => ({
        ...f,
        rooms: [
          ...f.rooms.filter(r => r.roomNo !== roomNo),
          { roomNo, bedCode: '', pricePerNight: room.pricePerNight || room.basePrice || 200000 }
        ]
      }));
    }
  };

  const toggleBed = (room: any, bed: any) => {
    const status = (bed.status || 'VC').toUpperCase();
    if (status !== 'VC') {
      toast.warning(`Giường ${bed.bedCode} hiện đang ở trạng thái ${status}, không thể đặt phòng.`);
      return;
    }
    const roomNo = room.roomNo || room.so;
    const exists = form.rooms.find(r => r.roomNo === roomNo && r.bedCode === bed.bedCode);
    if (exists) {
      setForm(f => ({ ...f, rooms: f.rooms.filter(r => !(r.roomNo === roomNo && r.bedCode === bed.bedCode)) }));
    } else {
      setForm(f => ({
        ...f,
        rooms: [
          ...f.rooms.filter(r => !(r.roomNo === roomNo && !r.bedCode)),
          { roomNo, bedCode: bed.bedCode, pricePerNight: room.pricePerNight || room.basePrice || 100000 }
        ]
      }));
    }
  };

  const toggleService = (svc: any, inventoryId?: number) => {
    setForm(f => {
      const exists = f.services.find(s => s.serviceCode === svc.serviceCode && (s as any).inventoryId === inventoryId);
      if (exists) {
        return { ...f, services: f.services.filter(s => s.serviceCode !== svc.serviceCode || (s as any).inventoryId !== inventoryId) };
      }
      
      let finalName = svc.serviceName;
      if (svc.category === 'VEHICLE' && inventoryId) {
        const v = vehicles.find(x => x.id === inventoryId);
        if (v) finalName += ` [Xe: ${v.vehicleCode}]`;
      } else if (svc.category === 'TOUR' && inventoryId) {
        const g = guides.find(x => x.id === inventoryId);
        const gName = g?.name || g?.fullName || g?.guideName || 'HDV';
        if (g) finalName += ` [HDV: ${gName}]`;
      }

      return {
        ...f,
        services: [...f.services, {
          serviceCode: svc.serviceCode,
          serviceName: finalName,
          category: svc.category,
          quantity: 1,
          unitPrice: svc.unitPrice || 0,
          inventoryId: inventoryId
        } as any]
      };
    });
  };

  const handleSubmit = async () => {
    if (!form.guestName) return toast.error('Vui lòng nhập tên khách');
    if (form.rooms.length === 0) return toast.error('Vui lòng chọn ít nhất 1 phòng');
    setLoading(true);
    try {
      const booking = await hotelService.createBooking({
        ...form,
        guestEmail: form.guestEmail,
        guestIdCard: form.idCard,
        groupSize: form.totalPerson,
        depositAmount: form.paidAmount,
        paidAmount: form.paidAmount,
        discountAmount: 0,
        totalAmount: calcTotal(),
        nightCount: calcNights(),
        rooms: form.rooms.map(r => ({ ...r, bedCode: r.bedCode || undefined, nightCount: calcNights() })),
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
          <h1>Tạo Đặt Phòng Mới</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Quy trình 4 bước nhanh chóng</p>
        </div>
        <button className={styles.btnSecondary} onClick={() => navigate('/hotel/bookings')}>
          <X size={15} /> Hủy
        </button>
      </div>

      {/* Step indicator */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <div
                className={`${styles.stepItem} ${step === s.key ? styles.stepActive : i < currentStepIndex ? styles.stepDone : ''}`}
                onClick={() => i <= currentStepIndex && setStep(s.key)}>
                <div className={styles.stepCircle}>
                  {i < currentStepIndex ? '✓' : i + 1}
                </div>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${i < currentStepIndex ? styles.lineDone : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.mainColumn}>
          {/* Bước 1: Thông tin khách */}
          {step === 'guest' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}><h3 className={styles.cardTitle}>👤 Thông Tin Khách</h3></div>
              <div className={styles.cardBody}>
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
                      {['DIRECT', 'BOOKING_COM', 'AGODA', 'AIRBNB', 'PHONE', 'WALK_IN'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className={`${styles.formGroup} ${styles.colFull}`}>
                    <label>📝 Ghi chú</label>
                    <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Yêu cầu đặc biệt..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bước 2: Chọn phòng */}
          {step === 'room' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>🛏️ Chọn Phòng</h3>
                <span className={styles.badge}>{nights} đêm</span>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.subtitleSmall}>
                  {new Date(form.checkIn).toLocaleDateString('vi-VN')} → {new Date(form.checkOut).toLocaleDateString('vi-VN')}
                </p>
                {availableRooms.length === 0 ? (
                  <div className={styles.emptyState}><div className={styles.emptyIcon}>🛏️</div><p>Không có phòng trống</p></div>
                ) : (
                  <div className={styles.bookingRoomGrid}>
                    {availableRooms.map(r => {
                      const roomNo = r.roomNo || r.so;
                      const selectedRoomObj = form.rooms.find(sel => sel.roomNo === roomNo && !sel.bedCode);
                      const selected = !!selectedRoomObj;
                      const selectedBeds = form.rooms.filter(sel => sel.roomNo === roomNo && sel.bedCode);
                      return (
                        <div key={roomNo}
                          className={`${styles.selectableRoomCard} ${selected ? styles.selected : ''}`}
                          onClick={() => toggleRoom(r)}
                          style={{ cursor: r.isAvailable === false ? 'not-allowed' : 'pointer', opacity: r.isAvailable === false ? .65 : 1 }}>
                          <div className={styles.roomHeader}>
                            <div className={styles.roomNo}>{roomNo}</div>
                            {selected && <div className={styles.selectedBadge}>✓</div>}
                          </div>
                          <div className={styles.roomType}>{r.roomTypeName || r.roomType || r.ma}</div>
                          <div className={styles.roomDetail}>Tầng {r.floor} · {r.maxPerson} người</div>

                          {!selected && selectedBeds.length === 0 && (
                            <div className={styles.roomPrice}>
                              {(r.pricePerNight || r.basePrice || 0).toLocaleString('vi-VN')}đ
                            </div>
                          )}

                          {selected && (
                            <div className={styles.roomPriceInput} onClick={e => e.stopPropagation()}>
                              <label>Giá phòng/đêm (đ)</label>
                              <input
                                type="number"
                                value={selectedRoomObj.pricePerNight}
                                onChange={e => {
                                  const val = Number(e.target.value);
                                  setForm(f => ({ ...f, rooms: f.rooms.map(x => x.roomNo === roomNo && !x.bedCode ? { ...x, pricePerNight: val } : x) }));
                                }}
                              />
                            </div>
                          )}

                          {r.beds?.length > 0 && (
                            <div className={styles.bedSelectionGrid}>
                              {r.beds.map((bed: any) => {
                                const selectedBedObj = selectedBeds.find(sel => sel.bedCode === bed.bedCode);
                                const bedSelected = !!selectedBedObj;
                                const disabled = !bed.isAvailable || selected;
                                return (
                                  <div key={bed.bedCode} className={styles.bedControl} onClick={e => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={() => toggleBed(r, bed)}
                                      disabled={disabled}
                                      className={`${styles.bedBtn} ${bedSelected ? styles.bedBtnActive : ''}`}
                                    >
                                      {bed.bedCode}
                                    </button>
                                    {bedSelected && (
                                      <input
                                        type="number"
                                        value={selectedBedObj.pricePerNight}
                                        onChange={e => {
                                          const val = Number(e.target.value);
                                          setForm(f => ({ ...f, rooms: f.rooms.map(x => x.roomNo === roomNo && x.bedCode === bed.bedCode ? { ...x, pricePerNight: val } : x) }));
                                        }}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bước 3: Dịch vụ */}
          {step === 'service' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}><h3 className={styles.cardTitle}>🔧 Dịch Vụ Kèm</h3></div>
              <div className={styles.cardBody}>
                {services.length === 0 ? (
                  <div className={styles.emptyState}><div className={styles.emptyIcon}>🔧</div><p>Không có dịch vụ</p></div>
                ) : (
                  <div className={styles.serviceSelectionList}>
                    {services.map(svc => {
                      const requiresInventory = svc.category === 'VEHICLE' || svc.category === 'TOUR';
                      const selectedInstances = form.services.filter(s => s.serviceCode === svc.serviceCode);
                      
                      return (
                        <div key={svc.serviceCode} className={styles.serviceGroupWrapper} style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div className={styles.serviceInfo}>
                              <div className={styles.serviceName} style={{ fontWeight: 700 }}>{svc.serviceName}</div>
                              <div className={styles.serviceMeta}>{svc.category} · {(svc.unitPrice || 0).toLocaleString('vi-VN')}đ</div>
                            </div>
                            {!requiresInventory && (
                              <button 
                                className={selectedInstances.length > 0 ? styles.btnSuccessSmall : styles.btnSecondarySmall}
                                onClick={() => toggleService(svc)}
                              >
                                {selectedInstances.length > 0 ? '✓ Đã chọn' : '+ Thêm'}
                              </button>
                            )}
                          </div>

                          {requiresInventory && (
                            <div className={styles.inventorySelector} style={{ marginTop: 10, padding: 10, background: '#f8fafc', borderRadius: 8 }}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                                {svc.category === 'VEHICLE' ? 'Chọn xe sẵn sàng:' : 'Chọn hướng dẫn viên:'}
                              </label>
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {(svc.category === 'VEHICLE' ? vehicles : guides).map(item => {
                                  const isItemSelected = form.services.some(s => s.serviceCode === svc.serviceCode && (s as any).inventoryId === item.id);
                                  return (
                                    <button
                                      key={item.id}
                                      className={`${styles.miniItemBadge} ${isItemSelected ? styles.active : ''}`}
                                      style={{
                                        padding: '6px 12px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        border: '1px solid #cbd5e1',
                                        background: isItemSelected ? '#1e6fff' : 'white',
                                        color: isItemSelected ? 'white' : '#475569',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                      }}
                                      onClick={() => toggleService(svc, item.id)}
                                    >
                                      {svc.category === 'VEHICLE' 
                                        ? `${item.vehicleCode} (${item.licensePlate})` 
                                        : (item.name || item.fullName || item.guideName || 'HDV')}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {!requiresInventory && selectedInstances.length > 0 && (
                            <div className={styles.serviceQtyControl} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                              <label style={{ fontSize: 12, color: '#64748b' }}>Số lượng:</label>
                              <button className={styles.btnIcon} onClick={() => {
                                const sel = selectedInstances[0];
                                const newQty = sel.quantity - 1;
                                if (newQty <= 0) {
                                  setForm(f => ({ ...f, services: f.services.filter(s => s.serviceCode !== svc.serviceCode) }));
                                } else {
                                  setForm(f => ({ ...f, services: f.services.map(s => s.serviceCode === svc.serviceCode ? { ...s, quantity: newQty } : s) }));
                                }
                              }}><Minus size={14} /></button>
                              <span className={styles.qtyText} style={{ fontWeight: 700 }}>{selectedInstances[0].quantity}</span>
                              <button className={styles.btnIcon} onClick={() => setForm(f => ({ ...f, services: f.services.map(s => s.serviceCode === svc.serviceCode ? { ...s, quantity: s.quantity + 1 } : s) }))}><Plus size={14} /></button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bước 4: Thanh toán */}
          {step === 'payment' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}><h3 className={styles.cardTitle}>💳 Thanh Toán</h3></div>
              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.colFull}`}>
                    <label>Phương thức thanh toán</label>
                    <div className={styles.paymentMethodList}>
                      {PAYMENT_METHODS.map(m => (
                        <button key={m}
                          className={`${styles.paymentMethodBtn} ${form.paymentMethod === m ? styles.methodActive : ''}`}
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
            </div>
          )}
        </div>

        {/* Tóm tắt */}
        <div className={styles.sideColumn}>
          <div className={`${styles.card} ${styles.sticky}`}>
            <div className={styles.cardHeader}><h3 className={styles.cardTitle}>📄 Tóm Tắt Booking</h3></div>
            <div className={styles.cardBody}>
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
                  <div className={styles.summarySectionTitle}>Phòng đã chọn</div>
                  {form.rooms.map(r => (
                    <div key={`${r.roomNo}-${r.bedCode || 'room'}`} className={styles.infoRow}>
                      <span className={styles.infoLabel}>🛏️ {r.roomNo}{r.bedCode ? ` / ${r.bedCode}` : ''}</span>
                      <span className={styles.infoValue}>{((r.pricePerNight || 0) * nights).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </>
              )}

              {form.services.length > 0 && (
                <>
                  <div className={styles.summarySectionTitle}>Dịch vụ</div>
                  {form.services.map(s => (
                    <div key={s.serviceCode} className={styles.infoRow}>
                      <span className={styles.infoLabel}>{s.serviceName} ×{s.quantity}</span>
                      <span className={styles.infoValue}>{((s.unitPrice || 0) * s.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </>
              )}

              <div className={styles.totalSection}>
                <div className={styles.infoRow}>
                  <span className={styles.totalLabel}>Tổng cộng</span>
                  <span className={styles.totalValue}>{total.toLocaleString('vi-VN')}đ</span>
                </div>
                {form.paidAmount > 0 && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Đã trả</span>
                    <span className={styles.paidValueSmall}>{form.paidAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {total - form.paidAmount > 0 && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Còn lại</span>
                    <span className={styles.remainingValueSmall}>{(total - form.paidAmount).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>
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
