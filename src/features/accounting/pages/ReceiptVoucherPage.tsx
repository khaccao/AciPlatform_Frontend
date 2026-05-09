import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import styles from '../accounting.module.scss';
import { accountingService } from '../services/accounting.service';

export const ReceiptVoucherPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      customerId: '',
      amount: 0,
      paymentMethod: 'Tiền mặt',
      isInternal: 1
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      data.amount = Number(data.amount);
      data.customerId = Number(data.customerId);
      data.isInternal = Number(data.isInternal);
      
      const res = await accountingService.createReceiptVoucher(data);
      toast.success(res.message || 'Lập phiếu thu thành công');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lập phiếu thu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.accountingContainer}>
      <div className={styles.header}>
        <h1>Lập Phiếu Thu (Thu tiền khách hàng)</h1>
      </div>
      
      <div className={styles.content}>
        <div className={styles.card}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>ID Khách hàng (Customer ID) <span>*</span></label>
                <input 
                  type="number" 
                  placeholder="Mã KH..."
                  {...register('customerId', { required: 'Vui lòng nhập ID Khách hàng' })} 
                />
                {errors.customerId && <span className={styles.error}>{errors.customerId?.message as string}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Số tiền thu <span>*</span></label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  {...register('amount', { required: 'Vui lòng nhập số tiền thu', min: 1 })} 
                />
                {errors.amount && <span className={styles.error}>{errors.amount?.message as string}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Phương thức thanh toán</label>
                <select {...register('paymentMethod')}>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Quẹt thẻ">Quẹt thẻ</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Loại Sổ</label>
                <select {...register('isInternal')}>
                  <option value={1}>Sổ nội bộ</option>
                  <option value={0}>Sổ thuế (Tài chính)</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.btnCancel} onClick={() => reset()}>
                Hủy bỏ
              </button>
              <button type="submit" className={styles.btnSave} disabled={loading}>
                <Save size={16} />
                {loading ? 'Đang xử lý...' : 'Lưu Phiếu Thu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiptVoucherPage;
