import React, { useState } from 'react';
import { Search, Calculator } from 'lucide-react';
import styles from '../accounting.module.scss';
import { accountingService } from '../services/accounting.service';
import { toast } from 'sonner';

export const CustomerDebtPage: React.FC = () => {
  const [customerId, setCustomerId] = useState('');
  const [debt, setDebt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckDebt = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const res = await accountingService.getCustomerDebt(Number(customerId));
      setDebt(res.debtBalance || 0);
      toast.success('Tra cứu công nợ thành công');
    } catch (error) {
      toast.error('Lỗi khi tra cứu công nợ');
      setDebt(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.accountingContainer}>
      <div className={styles.header}>
        <h1>Tra cứu công nợ Khách hàng</h1>
      </div>
      
      <div className={styles.content}>
        <div className={styles.card} style={{ maxWidth: '600px' }}>
          <div className={styles.formGroup}>
            <label>Nhập ID Khách hàng</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                value={customerId} 
                onChange={(e) => setCustomerId(e.target.value)} 
                placeholder="VD: 1024..." 
                style={{ flex: 1 }}
              />
              <button 
                className={styles.btnPrimary} 
                onClick={handleCheckDebt}
                disabled={loading || !customerId}
              >
                <Search size={16} /> {loading ? 'Đang tra cứu...' : 'Kiểm tra'}
              </button>
            </div>
          </div>

            {debt !== null && (
              <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f0f9eb', border: '1px solid #e1f3d8', borderRadius: '8px', textAlign: 'center' }}>
                <Calculator size={32} color="#67c23a" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: 0, color: '#606266' }}>Số dư công nợ hiện tại:</h3>
                <h2 style={{ fontSize: '28px', color: '#f56c6c', margin: '10px 0' }}>
                  {debt.toLocaleString()} VNĐ
                </h2>
                <p style={{ color: '#909399', fontSize: '14px', margin: 0 }}>
                  (Dương: Khách hàng đang nợ tiền / Âm: Bạn đang nợ khách hàng)
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDebtPage;
