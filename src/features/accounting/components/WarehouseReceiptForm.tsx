import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, Plus, Trash2 } from 'lucide-react';
import styles from '../accounting.module.scss';
import { accountingService, type WarehouseReceiptRequestModel } from '../services/accounting.service';

export const WarehouseReceiptForm: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, formState: { errors }, reset, watch } = useForm<WarehouseReceiptRequestModel>({
    defaultValues: {
      receiptDate: new Date().toISOString().split('T')[0],
      receiptNumber: `PNK-${new Date().getTime().toString().slice(-6)}`,
      isInternal: false,
      items: [{ goodsId: 0, quantity: 1, unitPrice: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch('items');
  const totalAmount = watchItems?.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0) || 0;

  const onSubmit = async (data: WarehouseReceiptRequestModel) => {
    try {
      setLoading(true);
      if (!data.items || data.items.length === 0) {
        toast.error('Vui lòng thêm ít nhất một mặt hàng');
        return;
      }
      
      data.supplierId = Number(data.supplierId);
      data.items = data.items.map(i => ({
        ...i,
        goodsId: Number(i.goodsId),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice)
      }));

      const res = await accountingService.createWarehouseReceipt(data);
      toast.success(res.message || 'Lập phiếu nhập kho thành công');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lập phiếu nhập kho');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Ngày nhập kho <span>*</span></label>
            <input 
              type="date" 
              {...register('receiptDate', { required: 'Vui lòng chọn ngày nhập kho' })} 
            />
            {errors.receiptDate && <span className={styles.error}>{errors.receiptDate.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Số chứng từ <span>*</span></label>
            <input 
              type="text" 
              {...register('receiptNumber', { required: 'Vui lòng nhập số chứng từ' })} 
            />
            {errors.receiptNumber && <span className={styles.error}>{errors.receiptNumber.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>ID Nhà cung cấp <span>*</span></label>
            <input 
              type="number" 
              placeholder="VD: 1, 2, 3..."
              {...register('supplierId', { required: 'Vui lòng chọn nhà cung cấp' })} 
            />
            {errors.supplierId && <span className={styles.error}>{errors.supplierId.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px' }}>
              <input type="checkbox" style={{ width: 'auto' }} {...register('isInternal')} />
              Phiếu nhập nội bộ
            </label>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Diễn giải</label>
            <textarea 
              placeholder="Nhập ghi chú hoặc diễn giải nhập kho..."
              {...register('note')} 
            />
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3>Chi tiết hàng hóa</h3>
            <button type="button" className={styles.btnAddRow} onClick={() => append({ goodsId: 0, quantity: 1, unitPrice: 0 })}>
              <Plus size={14} /> Thêm dòng
            </button>
          </div>
          
          <table className={styles.dataGrid}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>STT</th>
                <th>Mã hàng (ID)</th>
                <th style={{ width: '150px' }}>Số lượng</th>
                <th style={{ width: '200px' }}>Đơn giá</th>
                <th style={{ width: '200px' }}>Thành tiền</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((item, index) => {
                const qty = Number(watchItems?.[index]?.quantity || 0);
                const price = Number(watchItems?.[index]?.unitPrice || 0);
                const total = qty * price;

                return (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                    <td>
                      <input 
                        type="number" 
                        placeholder="ID"
                        {...register(`items.${index}.goodsId` as const, { required: true, min: 1 })} 
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="0.01"
                        {...register(`items.${index}.quantity` as const, { required: true, min: 0.1 })} 
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="1000"
                        {...register(`items.${index}.unitPrice` as const, { required: true, min: 0 })} 
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button type="button" className={styles.btnRemove} onClick={() => remove(index)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right' }}>Tổng cộng:</td>
                <td style={{ textAlign: 'right', color: '#e53935' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={() => reset()}>
            Hủy bỏ
          </button>
          <button type="submit" className={styles.btnSave} disabled={loading}>
            <Save size={16} />
            {loading ? 'Đang xử lý...' : 'Lưu Phiếu Nhập'}
          </button>
        </div>
      </form>
    </div>
  );
};
