import React, { useState } from 'react';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import styles from '../accounting.module.scss';
import { accountingService } from '../services/accounting.service';

export const ApproveVoucherList: React.FC = () => {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Giả lập danh sách phiếu chi chờ duyệt từ API
  // Trong thực tế sẽ gọi API GET /v1/accounting/internal/payment-vouchers/pending
  const [vouchers, setVouchers] = useState([
    { id: 1, date: '2026-04-29', amount: 15000000, reason: 'Chi tiền mua sắm thiết bị văn phòng', receiver: 'Nguyễn Văn A' },
    { id: 2, date: '2026-04-28', amount: 5000000, reason: 'Tạm ứng công tác phí', receiver: 'Trần Thị B' },
  ]);

  const handleApprove = async (id: number, isApproved: boolean) => {
    try {
      setLoadingId(id);
      const note = isApproved ? 'Đồng ý duyệt chi' : 'Không hợp lệ, từ chối';
      
      const res = await accountingService.approvePaymentVoucher({
        ledgerId: id,
        isApproved,
        note
      });
      
      toast.success(res.message);
      // Xóa khỏi danh sách chờ
      setVouchers(vouchers.filter(v => v.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.tableSection} style={{ marginTop: 0 }}>
        <div className={styles.tableHeader}>
          <h3>Danh sách yêu cầu chi tiền chờ duyệt</h3>
        </div>
        
        {vouchers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '4px' }}>
            Không có chứng từ nào chờ duyệt.
          </div>
        ) : (
          <table className={styles.dataGrid}>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Ngày CT</th>
                <th>Lý do chi</th>
                <th style={{ width: '200px' }}>Người nhận</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Số tiền</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id}>
                  <td>{v.date}</td>
                  <td>{v.reason}</td>
                  <td>{v.receiver}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#e53935' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.amount)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        disabled={loadingId === v.id}
                        onClick={() => handleApprove(v.id, true)}
                        style={{ background: '#4caf50', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={14} /> Duyệt
                      </button>
                      <button 
                        disabled={loadingId === v.id}
                        onClick={() => handleApprove(v.id, false)}
                        style={{ background: '#e53935', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <X size={14} /> Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
