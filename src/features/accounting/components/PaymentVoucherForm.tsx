import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import styles from '../accounting.module.scss';
import { accountingService, type PaymentVoucherRequestModel } from '../services/accounting.service';

export const PaymentVoucherForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentVoucherRequestModel>({
    defaultValues: {
      voucherDate: new Date().toISOString().split('T')[0],
      isInternal: false,
      amount: 0,
      debitAccount: '',
      creditAccount: '1111',
    }
  });

  const onSubmit = async (data: PaymentVoucherRequestModel) => {
    try {
      setLoading(true);
      // Ensure amount is number
      data.amount = Number(data.amount);
      if (data.supplierId) {
        data.supplierId = Number(data.supplierId);
      }
      
      const res = await accountingService.createPaymentVoucher(data);
      toast.success(res.message || 'Lập phiếu chi thành công');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lập phiếu chi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Ngày chứng từ <span>*</span></label>
            <input 
              type="date" 
              {...register('voucherDate', { required: 'Vui lòng chọn ngày chứng từ' })} 
            />
            {errors.voucherDate && <span className={styles.error}>{errors.voucherDate.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Đối tượng nhận (Tên người nhận) <span>*</span></label>
            <input 
              type="text" 
              placeholder="Nhập tên người nhận tiền..."
              {...register('receiverName', { required: 'Vui lòng nhập người nhận' })} 
            />
            {errors.receiverName && <span className={styles.error}>{errors.receiverName.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Tài khoản Nợ <span>*</span></label>
            <input 
              type="text" 
              placeholder="VD: 331, 642..."
              {...register('debitAccount', { required: 'Vui lòng nhập tài khoản nợ' })} 
            />
            {errors.debitAccount && <span className={styles.error}>{errors.debitAccount.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Tài khoản Có <span>*</span></label>
            <input 
              type="text" 
              placeholder="VD: 1111, 1121..."
              {...register('creditAccount', { required: 'Vui lòng nhập tài khoản có' })} 
            />
            {errors.creditAccount && <span className={styles.error}>{errors.creditAccount.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Số tiền <span>*</span></label>
            <input 
              type="number" 
              min="0"
              placeholder="0"
              {...register('amount', { required: 'Vui lòng nhập số tiền', min: 1 })} 
            />
            {errors.amount && <span className={styles.error}>{errors.amount.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>ID Nhà cung cấp (Nếu chi trả nợ 331)</label>
            <input 
              type="number" 
              placeholder="Mã NCC..."
              {...register('supplierId')} 
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Lý do chi <span>*</span></label>
            <textarea 
              placeholder="Nhập lý do chi tiền..."
              {...register('reason', { required: 'Vui lòng nhập lý do' })} 
            />
            {errors.reason && <span className={styles.error}>{errors.reason.message}</span>}
          </div>
          
          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: 'auto' }} {...register('isInternal')} />
              Là phiếu nội bộ (Không lên báo cáo thuế)
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={() => reset()}>
            Hủy bỏ
          </button>
          <button type="submit" className={styles.btnSave} disabled={loading}>
            <Save size={16} />
            {loading ? 'Đang xử lý...' : 'Lưu Phiếu Chi'}
          </button>
        </div>
      </form>
    </div>
  );
};
