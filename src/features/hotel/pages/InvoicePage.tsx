import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'sonner';
import hotelService from '../services/hotel.service';
import styles from '../hotel.module.scss';

export const InvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [hasSc, setHasSc] = useState(true);

  useEffect(() => {
    if (id) {
      hotelService.getBookingById(Number(id)).then(setBooking).catch(() => {
        toast.error('Không tìm thấy dữ liệu hóa đơn');
        navigate(-1);
      });
    }
  }, [id]);

  if (!booking) return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>;

  const handlePrint = () => {
    window.print();
  };

  const calculateTaxes = (netTotal: number) => {
    if (hasSc) {
      const heSo = 1.134; // (1 + 5/100) * (1 + 8/100)
      const basePlusPlus = netTotal / heSo;
      const sc = basePlusPlus * 0.05;
      const vat = (basePlusPlus + sc) * 0.08;
      return { basePlusPlus, sc, vat, net: netTotal };
    } else {
      const heSo = 1.08; // 1 + 8/100
      const basePlus = netTotal / heSo;
      const vat = basePlus * 0.08;
      return { basePlusPlus: basePlus, sc: 0, vat, net: netTotal };
    }
  };

  const nights = Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000));
  const roomNet = booking.rooms?.reduce((acc: number, r: any) => acc + (r.pricePerNight || 0) * nights, 0) || 0;
  const serviceNet = booking.services?.reduce((acc: number, s: any) => acc + (s.totalPrice || 0), 0) || 0;

  const roomTax = calculateTaxes(roomNet);
  const serviceTax = calculateTaxes(serviceNet);

  const totalBase = roomTax.basePlusPlus + serviceTax.basePlusPlus;
  const totalSc = roomTax.sc + serviceTax.sc;
  const totalVat = roomTax.vat + serviceTax.vat;
  const grandTotal = booking.totalAmount;

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader} style={{ '@media print': { display: 'none' } } as any}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className={styles.btnIcon} onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h1 style={{ fontSize: 20 }}>Hóa đơn #{booking.bookingCode}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={hasSc} onChange={e => setHasSc(e.target.checked)} />
            Có tính Service Charge (SC 5%)
          </label>
          <button className={styles.btnPrimary} onClick={handlePrint}><Printer size={15} /> In hóa đơn</button>
        </div>
      </div>

      <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: 800, margin: '0 auto', color: '#0f172a' }} id="printable-invoice">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: 24, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e6fff', margin: '0 0 8px' }}>INVOICE</h2>
            <div style={{ fontSize: 14, color: '#64748b' }}>Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>CITITEL HOTEL</h3>
            <div style={{ fontSize: 13, color: '#64748b' }}>Mã đặt phòng: {booking.bookingCode}</div>
          </div>
        </div>

        {/* Khách hàng */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Thông tin khách hàng</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{booking.guestName}</div>
            {booking.guestPhone && <div style={{ fontSize: 14, marginTop: 4 }}>SĐT: {booking.guestPhone}</div>}
            {booking.nationality && <div style={{ fontSize: 14, marginTop: 4 }}>Quốc tịch: {booking.nationality}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Thông tin lưu trú</div>
            <div style={{ fontSize: 14 }}>In: <strong>{new Date(booking.checkIn).toLocaleDateString('vi-VN')}</strong></div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Out: <strong>{new Date(booking.checkOut).toLocaleDateString('vi-VN')}</strong></div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Số đêm: <strong>{nights}</strong></div>
          </div>
        </div>

        {/* Bảng giá */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 13, color: '#475569' }}>Mô tả</th>
              <th style={{ padding: 12, textAlign: 'center', fontSize: 13, color: '#475569' }}>SL</th>
              <th style={{ padding: 12, textAlign: 'right', fontSize: 13, color: '#475569' }}>Đơn giá (NET)</th>
              <th style={{ padding: 12, textAlign: 'right', fontSize: 13, color: '#475569' }}>Thành tiền (NET)</th>
            </tr>
          </thead>
          <tbody>
            {/* Rooms */}
            {booking.rooms?.map(r => (
              <tr key={r.roomNo} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', fontSize: 14 }}>Phòng {r.roomNo}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: 14 }}>{nights}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14 }}>{(r.pricePerNight || 0).toLocaleString('vi-VN')}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>{((r.pricePerNight || 0) * nights).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            {/* Services */}
            {booking.services?.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', fontSize: 14 }}>{s.serviceName || s.serviceCode}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: 14 }}>{s.quantity}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14 }}>{(s.unitPrice || 0).toLocaleString('vi-VN')}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14, fontWeight: 600 }}>{(s.totalPrice || 0).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tổng kết & Thuế phí */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
              <span style={{ color: '#64748b' }}>Tổng giá {hasSc ? '++' : '+'} (Chưa thuế phí)</span>
              <span style={{ fontWeight: 600 }}>{Math.round(totalBase).toLocaleString('vi-VN')}đ</span>
            </div>
            {hasSc && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
                <span style={{ color: '#64748b' }}>Phí phục vụ (SC 5%)</span>
                <span style={{ fontWeight: 600 }}>{Math.round(totalSc).toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
              <span style={{ color: '#64748b' }}>Thuế GTGT (VAT 8%)</span>
              <span style={{ fontWeight: 600 }}>{Math.round(totalVat).toLocaleString('vi-VN')}đ</span>
            </div>
            {booking.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: '#dc2626' }}>
                <span>Giảm giá</span>
                <span style={{ fontWeight: 600 }}>-{booking.discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #e2e8f0', marginTop: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>TỔNG CỘNG (NET)</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#1e6fff' }}>{Math.round(grandTotal).toLocaleString('vi-VN')}đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>Đã thanh toán</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>{booking.paidAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
              <span style={{ color: '#dc2626', fontWeight: 600 }}>Còn lại</span>
              <span style={{ fontWeight: 700, color: '#dc2626' }}>{(grandTotal - booking.paidAmount).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; }
        }
      `}} />
    </div>
  );
};

export default InvoicePage;
